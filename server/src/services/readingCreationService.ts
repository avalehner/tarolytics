import { createHash } from "node:crypto";
import pool from "../db";

export class ReadingSaveError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface InitialCard {
  card_name: string;
  position_name: string;
  position_order: number;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseRequest(body: unknown) {
  if (
    !isObject(body) ||
    typeof body.request_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      body.request_id,
    )
  ) {
    throw new ReadingSaveError(400, "A valid save request ID is required.");
  }
  const {
    reading_date,
    reading_topic,
    spread_type,
    notes,
    user_interpretation,
    cards,
  } = body;
  if (
    typeof reading_date !== "string" ||
    !Number.isFinite(Date.parse(reading_date)) ||
    typeof reading_topic !== "string" ||
    !reading_topic.trim() ||
    reading_topic.length > 250 ||
    typeof spread_type !== "string" ||
    !spread_type.trim() ||
    spread_type.length > 100 ||
    typeof notes !== "string" ||
    typeof user_interpretation !== "string"
  ) {
    throw new ReadingSaveError(
      400,
      "Include a valid date, topic, spread, notes and interpretation.",
    );
  }
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new ReadingSaveError(400, "Include a valid, ordered list of cards.");
  }
  const normalizedCards: InitialCard[] = cards.map(
    (card: unknown, index: number) => {
      if (
        !isObject(card) ||
        typeof card.card_name !== "string" ||
        !card.card_name.trim() ||
        card.card_name.length > 100 ||
        !(
          card.position_name == null ||
          (typeof card.position_name === "string" &&
            card.position_name.length <= 100)
        ) ||
        card.position_order !== index
      ) {
        throw new ReadingSaveError(
          400,
          "Include valid cards and position labels of at most 100 characters, in order.",
        );
      }
      return {
        card_name: card.card_name,
        position_name:
          typeof card.position_name === "string" ? card.position_name : "",
        position_order: index,
      };
    },
  );
  // Fixed field order and normalized optional values make the hash independent
  // of JSON property order. Client-supplied user_id/reading_id are ignored.
  return {
    requestId: body.request_id.toLowerCase(),
    payload: {
      reading_date: new Date(reading_date).toISOString(),
      reading_topic,
      spread_type,
      notes,
      user_interpretation,
      cards: normalizedCards,
    },
  };
}

export async function createReadingWithRequest(userId: string, body: unknown) {
  const { requestId, payload } = parseRequest(body);
  const hash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
  const client = await pool.connect();
  let transactionStarted = false;
  let discardClient = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    // The primary key serializes concurrent submissions for this user/request.
    // A competing request waits for commit or rollback before proceeding.
    const claimed = await client.query(
      `INSERT INTO reading_save_requests (user_id, request_id, payload_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, request_id) DO NOTHING
       RETURNING request_id`,
      [userId, requestId, hash],
    );
    if (claimed.rows.length === 0) {
      const previous = (
        await client.query(
          `SELECT payload_hash, reading_id FROM reading_save_requests
         WHERE user_id = $1 AND request_id = $2`,
          [userId, requestId],
        )
      ).rows[0];
      if (!previous) throw new Error("Save request disappeared");
      if (previous.payload_hash !== hash) {
        throw new ReadingSaveError(
          409,
          "This save request was already used for different reading content.",
        );
      }
      const reading = (
        await client.query(
          "SELECT * FROM readings WHERE id = $1 AND user_id = $2",
          [previous.reading_id, userId],
        )
      ).rows[0];
      if (!reading) {
        throw new ReadingSaveError(
          410,
          "This reading was already saved and then deleted. It will not be created again.",
        );
      }
      await client.query("COMMIT");
      transactionStarted = false;
      return { reading, replayed: true };
    }

    const reading = (
      await client.query(
        `INSERT INTO readings (user_id, reading_date, reading_topic, spread_type, notes, user_interpretation)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          userId,
          payload.reading_date,
          payload.reading_topic,
          payload.spread_type,
          payload.notes,
          payload.user_interpretation,
        ],
      )
    ).rows[0];
    for (const card of payload.cards) {
      await client.query(
        `INSERT INTO cards (reading_id, card_name, position_name, position_order)
         VALUES ($1, $2, $3, $4)`,
        [reading.id, card.card_name, card.position_name, card.position_order],
      );
    }
    await client.query(
      "UPDATE reading_save_requests SET reading_id = $3 WHERE user_id = $1 AND request_id = $2",
      [userId, requestId, reading.id],
    );
    await client.query("COMMIT");
    transactionStarted = false;
    return { reading, replayed: false };
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        discardClient = true;
      }
    } else {
      discardClient = true;
    }
    throw error;
  } finally {
    client.release(discardClient);
  }
}
