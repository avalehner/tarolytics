import { CardTypes, NewCardTypes, UpdateCardTypes } from "../types";

export const getCardsByReadingId = async (
  readingId: string,
): Promise<CardTypes[]> => {
  const response = await fetch(`http://localhost:3000/api/cards/${readingId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", //for auth
  });
  if (!response.ok)
    throw new Error(
      `Server error [getCardsByReadingId - cardsService.ts]: ${response.status}`,
    );

  const cardData = await response.json();
  return cardData;
};

export const getAllCards = async (): Promise<CardTypes[]> => {
  const response = await fetch(`http://localhost:3000/api/cards/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", //for auth
  });
  if (!response.ok)
    throw new Error(
      `Server error [getAllCards - cardsService.ts]: ${response.status}`,
    );

  const cardData = await response.json();
  return cardData;
};

export const saveCards = async (data: NewCardTypes): Promise<CardTypes> => {
  const response = await fetch("http://localhost:3000/api/cards/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include", //for auth
  });
  if (!response.ok)
    throw new Error(
      `Server error [saveCards - cardsService.ts]: ${response.status}`,
    );

  const cardData = await response.json();
  return cardData;
};

export const updateCardsByReadingId = async (
  readingId: string,
  data: UpdateCardTypes,
): Promise<CardTypes> => {
  const response = await fetch(`http://localhost:3000/api/cards/${readingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include", //for auth
  });
  if (!response.ok)
    throw new Error(
      `Server error [updateCardsByReadingId - cardsService.ts]: ${response.status}`,
    );

  const updatedCardData = await response.json();
  return updatedCardData;
};
