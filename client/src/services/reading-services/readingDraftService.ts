import type { NewReadingTypes } from "../../types.ts";
import spreadConfig from "../../data/spreadConfig.ts";

export const READING_DRAFT_KEY = "tarolytics-reading-draft";

export interface PendingReadingSave {
  userId: string;
  request: NewReadingTypes;
}

export interface ReadingDraft {
  date: string | null;
  readingTopic: string;
  customReadingTopic: string;
  readingSpread: string;
  customReadingSpread: string;
  customReadingSpreadPositions: string[];
  inputtedCards: string[];
  pulledCards: string[];
  notes: string;
  userInterpretation: string;
  isManual: boolean;
  isCardsPulled: boolean;
  isReversals: boolean;
  pendingSave?: PendingReadingSave;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");
const isUUID = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function isPendingSave(value: unknown): value is PendingReadingSave {
  if (
    !isObject(value) ||
    typeof value.userId !== "string" ||
    !value.userId ||
    !isObject(value.request)
  )
    return false;
  const request = value.request;
  return (
    isUUID(request.request_id) &&
    [
      "reading_date",
      "reading_topic",
      "spread_type",
      "notes",
      "user_interpretation",
    ].every((key) => typeof request[key] === "string") &&
    Number.isFinite(Date.parse(request.reading_date as string)) &&
    Array.isArray(request.cards) &&
    request.cards.length > 0 &&
    request.cards.every(
      (card: unknown, index: number) =>
        isObject(card) &&
        typeof card.card_name === "string" &&
        Boolean(card.card_name.trim()) &&
        (card.position_name == null ||
          typeof card.position_name === "string") &&
        card.position_order === index,
    )
  );
}

export function readReadingDraft(
  storage: Pick<Storage, "getItem"> = sessionStorage,
): ReadingDraft | null {
  const raw = storage.getItem(READING_DRAFT_KEY);
  if (!raw) return null;
  const draft: unknown = JSON.parse(raw);
  if (
    !isObject(draft) ||
    !(
      draft.date === null ||
      (typeof draft.date === "string" &&
        Number.isFinite(Date.parse(draft.date)))
    ) ||
    ![
      "readingTopic",
      "customReadingTopic",
      "readingSpread",
      "customReadingSpread",
      "notes",
      "userInterpretation",
    ].every((key) => typeof draft[key] === "string") ||
    !Object.prototype.hasOwnProperty.call(
      spreadConfig,
      draft.readingSpread as string,
    ) ||
    !["customReadingSpreadPositions", "inputtedCards", "pulledCards"].every(
      (key) => isStringArray(draft[key]),
    ) ||
    !["isManual", "isCardsPulled", "isReversals"].every(
      (key) => typeof draft[key] === "boolean",
    ) ||
    (draft.pendingSave !== undefined && !isPendingSave(draft.pendingSave))
  ) {
    // Never discard an unreadable pending ID and silently make a new submission.
    throw new Error(
      "The stored reading couldn't be restored safely. Your stored draft has been kept.",
    );
  }
  return draft as unknown as ReadingDraft;
}

export function writeReadingDraft(
  draft: ReadingDraft,
  storage: Pick<Storage, "setItem"> = sessionStorage,
) {
  storage.setItem(READING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearReadingDraft(
  storage: Pick<Storage, "removeItem"> = sessionStorage,
) {
  // Callers decide whether a cleanup failure should block a new action.
  storage.removeItem(READING_DRAFT_KEY);
}

export function prepareReadingSave(
  draft: ReadingDraft,
  userId: string,
): PendingReadingSave {
  if (draft.pendingSave) {
    if (draft.pendingSave.userId !== userId) {
      throw new Error(
        "This pending save belongs to another account. Log in with the original account to finish it.",
      );
    }
    return draft.pendingSave;
  }
  if (!draft.date || !Number.isFinite(Date.parse(draft.date)))
    throw new Error("please select a date");
  if (!draft.notes.trim()) throw new Error("please input your notes");
  if (!draft.userInterpretation.trim())
    throw new Error("please input your interpretation");
  const cards = Array.from(
    draft.isManual
      ? draft.inputtedCards
      : draft.isCardsPulled
        ? draft.pulledCards
        : [],
  );
  const labels = Object.prototype.hasOwnProperty.call(
    spreadConfig,
    draft.readingSpread,
  )
    ? spreadConfig[draft.readingSpread]
    : undefined;
  if (
    !labels ||
    !cards.length ||
    cards.some((card) => !card?.trim()) ||
    (draft.readingSpread !== "custom" && cards.length !== labels.length)
  ) {
    throw new Error("please select a card for every position in the spread");
  }
  return {
    userId,
    request: {
      request_id: crypto.randomUUID(),
      reading_date: new Date(draft.date).toISOString(),
      reading_topic:
        draft.readingTopic === "custom"
          ? draft.customReadingTopic
          : draft.readingTopic,
      spread_type: draft.readingSpread,
      notes: draft.notes,
      user_interpretation: draft.userInterpretation,
      cards: cards.map((card, index) => ({
        card_name: card,
        position_name:
          draft.readingSpread === "custom"
            ? (draft.customReadingSpreadPositions[index] ?? "")
            : labels[index],
        position_order: index,
      })),
    },
  };
}
