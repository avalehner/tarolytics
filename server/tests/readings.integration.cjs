// Uses real PostgreSQL with temporary copies of the existing tables.
// No rows are written to the application's public tables.
require("dotenv/config");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { before, after, beforeEach, test } = require("node:test");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET_KEY = "isolated-database-test-secret";
process.env.GEMINI_API_KEY = "unused-in-reading-creation-tests";
const pool = require("../src/db").default;
// A single connection keeps all test requests on the same temporary tables.
pool.options.max = 1;
pool.options.connectionTimeoutMillis = 5000;
const readingsRouter = require("../src/routes/readings").default;
const userId = "11111111-1111-4111-8111-111111111111";
const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY);
const payload = {
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
  await pool.query(
    "CREATE TEMP TABLE readings (LIKE public.readings INCLUDING ALL)",
  );
  await pool.query("CREATE TEMP TABLE cards (LIKE public.cards INCLUDING ALL)");
  await pool.query(`ALTER TABLE pg_temp.cards ADD CONSTRAINT test_reading_fk
    FOREIGN KEY (reading_id) REFERENCES pg_temp.readings(id)`);
  // Even if a temporary table is missing, route queries must not reach public tables.
  await pool.query("SET search_path TO pg_temp");
  const app = express();
  app.use(express.json(), cookieParser());
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
    // Closing this session automatically drops its temporary tables and rows.
    await pool.end();
  }
});

beforeEach(async () => {
  await pool.query("TRUNCATE pg_temp.cards, pg_temp.readings");
});

async function post(body = payload) {
  const response = await fetch(`${base}/api/readings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `authToken=${token}`,
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
  const reading = (await pool.query("SELECT * FROM pg_temp.readings")).rows[0];
  assert.equal(reading.id, result.body.id);
  assert.equal(reading.user_id, userId);
  const cards = (
    await pool.query("SELECT * FROM pg_temp.cards ORDER BY position_order")
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
      "SELECT card_name,position_name,position_order FROM pg_temp.cards ORDER BY position_order",
    )
  ).rows;
  assert.deepEqual(saved, cards);
});

test("a failure on the second card rolls back the reading and first card", async () => {
  const result = await post({
    ...payload,
    cards: [
      payload.cards[0],
      { ...payload.cards[1], card_name: "x".repeat(101) },
    ],
  });
  assert.equal(result.status, 500);
  assert.deepEqual(await counts("pg_temp"), { readings: "0", cards: "0" });
  // A subsequent request can reuse the released connection successfully.
  assert.equal((await post()).status, 201);
  assert.deepEqual(await counts("pg_temp"), { readings: "1", cards: "2" });
});

test("a reading insert failure leaves no rows", async () => {
  assert.equal(
    (await post({ ...payload, reading_date: "invalid-date" })).status,
    500,
  );
  assert.deepEqual(await counts("pg_temp"), { readings: "0", cards: "0" });
});

test("an empty card list is rejected without creating a reading", async () => {
  assert.equal((await post({ ...payload, cards: [] })).status, 400);
  assert.deepEqual(await counts("pg_temp"), { readings: "0", cards: "0" });
});
