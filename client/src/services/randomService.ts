import { tarotCards } from "../data/tarotCards.ts";

export const getRandomSequence = async (
  numCards: number,
  isReversals: boolean,
): Promise<number[]> => {
  const maxNumber = tarotCards.length * (isReversals ? 2 : 1);
  if (!Number.isInteger(numCards) || numCards < 1 || numCards > maxNumber) {
    throw new Error("Invalid number of cards requested.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/random/${isReversals}`, {
      method: "GET",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok)
      throw new Error("Couldn't pull your cards. Please try again.");
    const data: unknown = await response.json();
    if (
      !Array.isArray(data) ||
      data.length < numCards ||
      data.some(
        (value) => !Number.isInteger(value) || value < 1 || value > maxNumber,
      ) ||
      new Set(data).size !== data.length
    ) {
      throw new Error(
        "The card draw was incomplete or invalid. Please try again.",
      );
    }
    return data.slice(0, numCards);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Pulling cards took too long. Please try again.");
    }
    if (error instanceof SyntaxError || error instanceof TypeError) {
      throw new Error("Couldn't pull your cards. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
