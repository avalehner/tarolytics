import assert from "node:assert/strict";
import { test } from "node:test";
import { getRandomSequence } from "../src/services/randomService.ts";
import { isValidCardName } from "../src/services/reading-services/cardValidation.ts";
import { prepareReadingSave } from "../src/services/reading-services/readingDraftService.ts";

test("selects requested cards from a full valid sequence", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(Array.from({ length: 78 }, (_, i) => i + 1)),
  );
  assert.deepEqual(await getRandomSequence(3, false), [1, 2, 3]);
});
test("rejects malformed, incomplete, duplicate and invalid card numbers", async (t) => {
  for (const data of [
    {},
    null,
    [],
    [1],
    [1, 1],
    [0, 2],
    [1.5, 2],
    ["1", 2],
    [79, 2],
    [1, 2, 999],
  ]) {
    const stub = t.mock.method(globalThis, "fetch", async () =>
      Response.json(data),
    );
    await assert.rejects(getRandomSequence(2, false), /incomplete or invalid/);
    stub.mock.restore();
  }
});
test("reversed IDs require reversals to be enabled", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json([79, 156]));
  assert.deepEqual(await getRandomSequence(2, true), [79, 156]);
  await assert.rejects(getRandomSequence(2, false), /invalid/);
});
test("failure can be followed by a successful retry", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () =>
    ++calls === 1 ? new Response(null, { status: 503 }) : Response.json([1, 2]),
  );
  await assert.rejects(getRandomSequence(2, false), /Please try again/);
  assert.deepEqual(await getRandomSequence(2, false), [1, 2]);
});
test("invalid JSON and network failures produce readable errors", async (t) => {
  const stub = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("not JSON"),
  );
  await assert.rejects(getRandomSequence(2, false), /Couldn't pull your cards/);
  stub.mock.mockImplementation(async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(getRandomSequence(2, false), /Couldn't pull your cards/);
});
test("stalled request is aborted after 15 seconds", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let aborted = false;
  t.mock.method(
    globalThis,
    "fetch",
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("Aborted", "AbortError"));
        });
      }),
  );
  const result = assert.rejects(getRandomSequence(2, false), /took too long/);
  t.mock.timers.tick(15000);
  await result;
  assert.equal(aborted, true);
});
test("validates upright and reversed card names", () => {
  assert.equal(isValidCardName("The Fool"), true);
  assert.equal(isValidCardName("The Fool rx"), true);
  for (const name of [undefined, "", "Unknown", "The Fool reversed"])
    assert.equal(isValidCardName(name), false);
});
test("new saves reject unknown cards but preserve pending retries", () => {
  const draft = {
    date: "2026-11-17T12:00:00.000Z",
    readingTopic: "card-of-day",
    customReadingTopic: "",
    readingSpread: "top-bottom",
    customReadingSpread: "",
    customReadingSpreadPositions: [],
    inputtedCards: ["The Fool", "Unknown"],
    pulledCards: ["The Fool", "Unknown"],
    notes: "Notes",
    userInterpretation: "Meaning",
    isManual: true,
    isCardsPulled: false,
    isReversals: false,
  };
  assert.throws(() => prepareReadingSave(draft, "user"), /every position/);
  assert.throws(
    () =>
      prepareReadingSave(
        { ...draft, isManual: false, isCardsPulled: true },
        "user",
      ),
    /every position/,
  );
  const pending = prepareReadingSave(
    { ...draft, inputtedCards: ["The Fool", "The Sun rx"] },
    "user",
  );
  assert.equal(
    prepareReadingSave({ ...draft, pendingSave: pending }, "user"),
    pending,
  );
});
