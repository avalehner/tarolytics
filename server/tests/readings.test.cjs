const assert = require("node:assert/strict");
const { once } = require("node:events");
const { before, after, beforeEach, test, mock } = require("node:test");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET_KEY = "reading-transaction-test-secret";
process.env.GEMINI_API_KEY = "unused-in-reading-creation-tests";
const pool = require("../src/db").default;
const readingsRouter = require("../src/routes/readings").default;
const userId = "test-user";
const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY);
const reading = { id: "new-reading", user_id: userId };
const payload = {
  request_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  reading_date: "2026-11-16T12:00:00.000Z",
  reading_topic: "card-of-day",
  spread_type: "top-bottom",
  notes: "Test notes",
  user_interpretation: "Test interpretation",
  cards: [
    { card_name: "The Fool", position_name: "top", position_order: 0 },
    { card_name: "The Magician", position_name: "bottom", position_order: 1 },
  ],
};
let server;
let base;
let client;
let calls;
let fail;
let releaseValues;
let connectCalls;

before(async () => {
  mock.method(pool, "query", () => {
    throw new Error("Creation must use its checked-out client, not pool.query");
  });
  mock.method(pool, "connect", async () => {
    connectCalls++;
    if (fail === "CONNECT") throw new Error("Connection unavailable");
    return client;
  });
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/readings", readingsRouter);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  mock.restoreAll();
  await pool.end();
});

beforeEach(() => {
  calls = [];
  fail = null;
  connectCalls = 0;
  releaseValues = [];
  let cardInserts = 0;
  client = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (/INSERT INTO cards/.test(sql)) {
        cardInserts++;
        if (fail === `CARD_${cardInserts}` || fail === "ROLLBACK") {
          throw new Error("Card insert failed");
        }
      }
      if (sql === fail) throw new Error("Database statement failed");
      return {
        rows: /INSERT INTO reading_save_requests/.test(sql)
          ? [{ request_id: payload.request_id }]
          : /INSERT INTO readings/.test(sql)
            ? [reading]
            : [],
      };
    },
    release(discard) {
      releaseValues.push(discard);
    },
  };
});

async function post(body = payload, authToken = token) {
  const response = await fetch(`${base}/api/readings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Cookie: `authToken=${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test("requires a valid login before acquiring a database connection", async () => {
  for (const authToken of [
    null,
    "invalid",
    jwt.sign({ userId }, "wrong-secret"),
  ]) {
    assert.equal((await post(payload, authToken)).status, 401);
  }
  assert.equal(connectCalls, 0);
});

test("rejects missing, empty, or malformed cards before writing", async () => {
  const invalidLists = [
    undefined,
    [],
    {},
    [null],
    ["The Fool"],
    [{ card_name: "", position_order: 0 }],
    [{ card_name: "   ", position_order: 0 }],
    [{ card_name: "The Fool", position_order: "0" }],
    [{ card_name: "The Fool", position_order: 1 }],
    [{ card_name: "The Fool", position_order: 0, position_name: 12 }],
  ];
  for (const cards of invalidLists) {
    assert.equal((await post({ ...payload, cards })).status, 400);
  }
  assert.equal(connectCalls, 0);
});

test("commits all cards with server-derived ownership and reading ID", async () => {
  const response = await post({
    ...payload,
    user_id: "another-user",
    cards: payload.cards.map((card) => ({
      ...card,
      reading_id: "another-reading",
    })),
  });
  assert.equal(response.status, 201);
  assert.deepEqual(response.body, reading);
  assert.equal(connectCalls, 1);
  assert.equal(calls[0].sql, "BEGIN");
  assert.equal(calls[1].values[0], userId);
  const inserts = calls.filter(({ sql }) => /INSERT INTO cards/.test(sql));
  assert.deepEqual(
    inserts.map(({ values }) => values),
    [
      [reading.id, "The Fool", "top", 0],
      [reading.id, "The Magician", "bottom", 1],
    ],
  );
  assert.equal(calls.at(-1).sql, "COMMIT");
  assert.deepEqual(releaseValues, [false]);
});

for (const failure of ["CARD_1", "CARD_2", "COMMIT"]) {
  test(`rolls back and releases the connection when ${failure} fails`, async () => {
    fail = failure;
    assert.equal((await post()).status, 500);
    assert.equal(calls.at(-1).sql, "ROLLBACK");
    assert.deepEqual(releaseValues, [false]);
  });
}

test("does not return success until COMMIT finishes", async () => {
  const originalQuery = client.query;
  let finishCommit;
  let commitStarted;
  const enteredCommit = new Promise((resolve) => {
    commitStarted = resolve;
  });
  const commitGate = new Promise((resolve) => {
    finishCommit = resolve;
  });
  client.query = async (sql, values) => {
    if (sql === "COMMIT") {
      commitStarted();
      await commitGate;
    }
    return originalQuery(sql, values);
  };
  let responded = false;
  const response = post().then((result) => {
    responded = true;
    return result;
  });
  await enteredCommit;
  try {
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(responded, false);
  } finally {
    finishCommit();
  }
  assert.equal((await response).status, 201);
});

test("returns an error when no database connection is available", async () => {
  fail = "CONNECT";
  assert.equal((await post()).status, 500);
  assert.equal(calls.length, 0);
  assert.deepEqual(releaseValues, []);
});

test("discards a connection when rollback itself fails", async () => {
  fail = "ROLLBACK";
  assert.equal((await post()).status, 500);
  assert.equal(calls.at(-1).sql, "ROLLBACK");
  assert.deepEqual(releaseValues, [true]);
});

test("requires a request UUID and valid reading fields before writing", async () => {
  for (const request_id of [undefined, "", "not-a-uuid"]) {
    assert.equal((await post({ ...payload, request_id })).status, 400);
  }
  for (const changes of [
    { reading_date: "invalid" },
    { notes: 12 },
    { reading_topic: "" },
  ]) {
    assert.equal((await post({ ...payload, ...changes })).status, 400);
  }
  assert.equal(connectCalls, 0);
});
