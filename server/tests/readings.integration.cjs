// Uses real PostgreSQL in a disposable schema so separate connections can race.
// No rows are written to the application's public tables.
require("dotenv/config");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { randomUUID } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { before, after, beforeEach, test } = require("node:test");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET_KEY = "isolated-database-test-secret";
process.env.GEMINI_API_KEY = "unused-in-reading-creation-tests";
const pool = require("../src/db").default;
const schema = `test_readings_${randomUUID().replaceAll("-", "")}`;
pool.options.max = 4;
pool.options.options = `-c search_path=${schema}`;
pool.options.connectionTimeoutMillis = 5000;
const readingsRouter = require("../src/routes/readings").default;
const userId = "11111111-1111-4111-8111-111111111111";
const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY);
const payload = {
  request_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  reading_date: "2026-11-16T12:00:00.000Z",
  reading_topic: "card-of-day",
  spread_type: "top-bottom",
  notes: "Transaction integration test",
  user_interpretation: "Test interpretation",
  cards: [
    { card_name: "The Fool", position_name: "top", position_order: 0 },
    { card_name: "The Magician", position_name: "bottom", position_order: 1 },
  ],
};
let server;
let base;
let publicCounts;

async function counts(schema) {
  // Only hard-coded schema names from this test are used here.
  const result = await pool.query(`SELECT
    (SELECT count(*) FROM ${schema}.readings) AS readings,
    (SELECT count(*) FROM ${schema}.cards) AS cards`);
  return result.rows[0];
}

before(async () => {
  publicCounts = await counts("public");
  await pool.query(`CREATE SCHEMA ${schema}`);
  await pool.query("CREATE TABLE users (id UUID PRIMARY KEY)");
  await pool.query("INSERT INTO users VALUES ($1), ($2)", [
    userId,
    "22222222-2222-4222-8222-222222222222",
  ]);
  await pool.query(
    "CREATE TABLE readings (LIKE public.readings INCLUDING ALL)",
  );
  await pool.query("CREATE TABLE cards (LIKE public.cards INCLUDING ALL)");
  await pool.query(`ALTER TABLE cards ADD CONSTRAINT test_reading_fk
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE`);
  await pool.query(
    "ALTER TABLE cards ADD CONSTRAINT test_card_failure CHECK (card_name <> '__FAIL_CARD__')",
  );
  await pool.query(
    "ALTER TABLE readings ADD CONSTRAINT test_reading_failure CHECK (notes <> '__FAIL_READING__')",
  );
  const migration = readFileSync(
    join(__dirname, "../migrations/001_reading_save_requests.sql"),
    "utf8",
  );
  await pool.query(migration);
  await pool.query(migration); // The migration must also be safe to rerun.
  const app = express();
  app.use(express.json(), cookieParser());
  app.use((req, res, next) => {
    if (req.headers["x-test-drop-response"]) {
      res.json = () => {
        req.socket.destroy();
        return res;
      };
    }
    next();
  });
  app.use("/api/readings", readingsRouter);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  try {
    if (publicCounts) assert.deepEqual(await counts("public"), publicCounts);
  } finally {
    try {
      await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    } finally {
      await pool.end();
    }
  }
});

beforeEach(async () => {
  await pool.query("TRUNCATE reading_save_requests, cards, readings");
});

async function post(body = payload, authToken = token, dropResponse = false) {
  const response = await fetch(`${base}/api/readings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `authToken=${authToken}`,
      ...(dropResponse ? { "x-test-drop-response": "1" } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test("commits one reading and every card to the verified account", async () => {
  const result = await post({
    ...payload,
    user_id: "22222222-2222-4222-8222-222222222222",
  });
  assert.equal(result.status, 201);
  const reading = (await pool.query("SELECT * FROM readings")).rows[0];
  assert.equal(reading.id, result.body.id);
  assert.equal(reading.user_id, userId);
  const cards = (
    await pool.query("SELECT * FROM cards ORDER BY position_order")
  ).rows;
  assert.deepEqual(
    cards.map(({ reading_id, card_name, position_name, position_order }) => ({
      reading_id,
      card_name,
      position_name,
      position_order,
    })),
    payload.cards.map((card) => ({ reading_id: reading.id, ...card })),
  );
});

test("preserves custom positions and reversed card names", async () => {
  const cards = [
    {
      card_name: "The Fool rx",
      position_name: "What to release",
      position_order: 0,
    },
    {
      card_name: "The Magician",
      position_name: "What to welcome",
      position_order: 1,
    },
  ];
  assert.equal(
    (await post({ ...payload, spread_type: "custom", cards })).status,
    201,
  );
  const saved = (
    await pool.query(
      "SELECT card_name,position_name,position_order FROM cards ORDER BY position_order",
    )
  ).rows;
  assert.deepEqual(saved, cards);
});

test("a failure on the second card rolls back the reading and first card", async () => {
  const result = await post({
    ...payload,
    cards: [
      payload.cards[0],
      { ...payload.cards[1], card_name: "__FAIL_CARD__" },
    ],
  });
  assert.equal(result.status, 500);
  assert.deepEqual(await counts(schema), { readings: "0", cards: "0" });
  assert.equal(
    (await pool.query("SELECT * FROM reading_save_requests")).rowCount,
    0,
  );
  // The failed transaction releases the request ID too, so retrying can succeed.
  assert.equal((await post()).status, 201);
  assert.deepEqual(await counts(schema), { readings: "1", cards: "2" });
});

test("a reading insert failure leaves no rows", async () => {
  assert.equal(
    (await post({ ...payload, notes: "__FAIL_READING__" })).status,
    500,
  );
  assert.deepEqual(await counts(schema), { readings: "0", cards: "0" });
});

test("an empty card list is rejected without creating a reading", async () => {
  assert.equal((await post({ ...payload, cards: [] })).status, 400);
  assert.deepEqual(await counts(schema), { readings: "0", cards: "0" });
});

test("an identical retry returns the original reading without inserting cards", async () => {
  const first = await post();
  const second = await post();
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal(first.body.id, second.body.id);
  assert.deepEqual(await counts(schema), { readings: "1", cards: "2" });
  assert.equal(
    (await pool.query("SELECT * FROM reading_save_requests")).rowCount,
    1,
  );
});

test("JSON property order and omitted optional labels do not change identity", async () => {
  const original = {
    ...payload,
    cards: payload.cards.map(({ position_name, ...card }) => card),
  };
  const first = await post(original);
  const reordered = Object.fromEntries(Object.entries(original).reverse());
  reordered.cards = original.cards.map((card) => ({
    ...card,
    position_name: null,
  }));
  const second = await post(reordered);
  assert.equal(second.status, 200);
  assert.equal(second.body.id, first.body.id);
});

test("the same ID with changed reading or cards returns 409", async () => {
  await post();
  assert.equal(
    (await post({ ...payload, notes: "Different notes" })).status,
    409,
  );
  assert.equal(
    (
      await post({
        ...payload,
        cards: [
          { ...payload.cards[0], card_name: "The Sun" },
          payload.cards[1],
        ],
      })
    ).status,
    409,
  );
  assert.deepEqual(await counts(schema), { readings: "1", cards: "2" });
});

test("simultaneous requests on separate connections create exactly one reading", async () => {
  const results = await Promise.all([post(), post(), post(), post()]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 200, 200, 201]);
  assert.equal(new Set(results.map((r) => r.body.id)).size, 1);
  assert(pool.totalCount > 1);
  assert.deepEqual(await counts(schema), { readings: "1", cards: "2" });
});

test("a response lost after commit can be retried without duplication", async () => {
  await assert.rejects(post(payload, token, true));
  const id = (await pool.query("SELECT id FROM readings")).rows[0].id;
  const retried = await post();
  assert.equal(retried.status, 200);
  assert.equal(retried.body.id, id);
  assert.deepEqual(await counts(schema), { readings: "1", cards: "2" });
});

test("request IDs are scoped to the authenticated account", async () => {
  const first = await post();
  const otherId = "22222222-2222-4222-8222-222222222222";
  const otherToken = jwt.sign({ userId: otherId }, process.env.JWT_SECRET_KEY);
  const second = await post(payload, otherToken);
  assert.equal(second.status, 201);
  assert.equal(second.body.user_id, otherId);
  assert.notEqual(first.body.id, second.body.id);
  assert.deepEqual(await counts(schema), { readings: "2", cards: "4" });
});

test("a fresh request ID can intentionally save the same content again", async () => {
  const first = await post();
  const second = await post({ ...payload, request_id: randomUUID() });
  assert.equal(second.status, 201);
  assert.notEqual(second.body.id, first.body.id);
});

test("retrying after deletion returns 410 without resurrecting the reading", async () => {
  const first = await post();
  await pool.query("DELETE FROM readings WHERE id=$1", [first.body.id]);
  assert.equal((await post()).status, 410);
  assert.deepEqual(await counts(schema), { readings: "0", cards: "0" });
  assert.equal(
    (await pool.query("SELECT reading_id FROM reading_save_requests")).rows[0]
      .reading_id,
    null,
  );
});

test("editing a saved reading does not invalidate the original request fingerprint", async () => {
  const first = await post();
  await pool.query("UPDATE readings SET notes='Edited later' WHERE id=$1", [
    first.body.id,
  ]);
  const replay = await post();
  assert.equal(replay.status, 200);
  assert.equal(replay.body.id, first.body.id);
  assert.equal(replay.body.notes, "Edited later");
});
