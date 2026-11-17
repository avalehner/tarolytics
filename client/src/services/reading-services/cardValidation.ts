import { tarotCardNames } from "../../data/tarotCards.ts";

const supportedCards = new Set(tarotCardNames);

export const isValidCardName = (value: unknown): value is string =>
  typeof value === "string" && supportedCards.has(value);
