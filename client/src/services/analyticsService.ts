import type { NonSearchDataTypes, CardSearchTypes } from "../types";

export const getNonSearchData = async (): Promise<NonSearchDataTypes> => {
  const response = await fetch(`http://localhost:3000/api/analytics/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok)
    throw new Error(
      `Server error [getNonSearchData - analyticsService.ts]: ${response.status}`,
    );

  const analyticsData = await response.json();
  return analyticsData;
};

export const getCardSearchData = async (
  cardName: string,
  timePeriod: number | null,
): Promise<CardSearchTypes> => {
  const url = timePeriod
    ? `http://localhost:3000/api/analytics/card-search?cardName=${encodeURIComponent(cardName)}&period=${timePeriod}`
    : `http://localhost:3000/api/analytics/card-search?cardName=${encodeURIComponent(cardName)}`;

  const response = await fetch(`${url}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok)
    throw new Error(`
      Server error [getCardSearchData - analyticsService.ts]: ${response.status}
    `);

  const cardSearchData = await response.json();
  return cardSearchData;
};
