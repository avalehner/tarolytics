import assert from "node:assert/strict";
import { test } from "node:test";
import {
  READING_DRAFT_KEY,
  prepareReadingSave,
  readReadingDraft,
  writeReadingDraft,
  clearReadingDraft,
} from "../src/services/readingDraftService.ts";

const draft = {
  date: "2026-11-16T05:00:00.000Z",
  readingTopic: "card-of-day",
  customReadingTopic: "",
  readingSpread: "top-bottom",
  customReadingSpread: "",
  customReadingSpreadPositions: [""],
  inputtedCards: ["The Fool", "The Magician"],
  pulledCards: [""],
  notes: "My notes",
  userInterpretation: "My interpretation",
  isManual: true,
  isCardsPulled: false,
  isReversals: false,
};
function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

test("pending ID and exact payload survive a reload through session storage", () => {
  const s = storage();
  const first = prepareReadingSave(draft, "user-a");
  writeReadingDraft({ ...draft, pendingSave: first }, s);
  const restored = readReadingDraft(s);
  const retry = prepareReadingSave(restored, "user-a");
  assert.deepEqual(retry, first);
});

test("retry uses original snapshot even if form fields have changed", () => {
  const first = prepareReadingSave(draft, "user-a");
  const retry = prepareReadingSave(
    { ...draft, notes: "Changed", pendingSave: first },
    "user-a",
  );
  assert.equal(retry.request.notes, draft.notes);
  assert.equal(retry.request.request_id, first.request.request_id);
});

test("changing accounts cannot replay a pending save as a new reading", () => {
  const first = prepareReadingSave(draft, "user-a");
  assert.throws(
    () => prepareReadingSave({ ...draft, pendingSave: first }, "user-b"),
    /original account/,
  );
});

test("new readings receive different request IDs", () => {
  assert.notEqual(
    prepareReadingSave(draft, "user-a").request.request_id,
    prepareReadingSave(draft, "user-a").request.request_id,
  );
});

test("legacy drafts without a pending request still restore", () => {
  const s = storage();
  writeReadingDraft(draft, s);
  assert.deepEqual(readReadingDraft(s), draft);
});

test("malformed pending requests remain in storage instead of silently losing their ID", () => {
  const s = storage();
  const broken = { ...draft, pendingSave: { userId: "user-a", request: {} } };
  writeReadingDraft(broken, s);
  assert.throws(() => readReadingDraft(s), /restored safely/);
  assert.equal(s.getItem(READING_DRAFT_KEY), JSON.stringify(broken));
});

test("storage failures are surfaced to stop submission", () => {
  assert.throws(
    () =>
      writeReadingDraft(draft, {
        setItem() {
          throw new Error("Storage unavailable");
        },
      }),
    /Storage unavailable/,
  );
});

test("clearing a completed draft removes the pending ID", () => {
  const s = storage();
  writeReadingDraft(
    { ...draft, pendingSave: prepareReadingSave(draft, "user-a") },
    s,
  );
  clearReadingDraft(s);
  assert.equal(readReadingDraft(s), null);
});

test("pulled cards and custom position labels are included in the snapshot", () => {
  const pulled = prepareReadingSave(
    {
      ...draft,
      isManual: false,
      isCardsPulled: true,
      pulledCards: ["The Sun", "The Moon"],
    },
    "user-a",
  );
  assert.deepEqual(
    pulled.request.cards.map((c) => c.card_name),
    ["The Sun", "The Moon"],
  );
  const custom = prepareReadingSave(
    {
      ...draft,
      readingSpread: "custom",
      customReadingSpreadPositions: ["Past", "Future"],
    },
    "user-a",
  );
  assert.deepEqual(
    custom.request.cards.map((c) => c.position_name),
    ["Past", "Future"],
  );
});
