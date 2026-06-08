export const getRandomSequence = async (
  numCards: number,
  isReversals: boolean,
): Promise<number[]> => {
  const randomResponse = await fetch(
    `http://localhost:3000/api/random/${isReversals}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!randomResponse.ok) {
    throw new Error(
      `Server error [getRandomSequence - randomService.ts]: ${randomResponse.status}`,
    );
  }
  const randomData = await randomResponse.json();
  const randomCardIndeces = randomData.slice(0, numCards);
  return randomCardIndeces;
};
