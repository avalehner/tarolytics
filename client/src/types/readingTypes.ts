import type { NewCardTypes } from "./cardTypes";

export interface ReadingTypes {
  id: string;
  user_id: string;
  reading_date: string;
  spread_type: string;
  reading_topic: string;
  notes: string;
  user_interpretation: string;
  ai_interpretation?: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingWithCardTypes extends ReadingTypes {
  card_names: string[] | null;
}

export type NewReadingTypes = Omit<
  ReadingTypes,
  "id" | "user_id" | "created_at" | "updated_at" | "ai_interpretation"
> & {
  request_id: string;
  cards: Omit<NewCardTypes, "reading_id">[];
};

export type UpdateReadingTypes = Omit<
  ReadingTypes,
  | "id"
  | "created_at"
  | "user_id"
  | "reading_date"
  | "spread_type"
  | "reading_topic"
  | "updated_at"
  | "ai_interpretation"
>;

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
