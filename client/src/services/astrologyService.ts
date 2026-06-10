import type { PlanetTypes, PlanetInterpretationTypes } from "../types";

export const getAstrologyData = async (
  userId: string,
): Promise<{
  chartData: string;
  planetData: PlanetTypes[];
  interpretations: PlanetInterpretationTypes[];
}> => {
  const response = await fetch(
    `http://localhost:3000/api/astrology/${userId}`,
    {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok)
    throw new Error(
      `Server error [getAstrologyChart - astrologyService.ts]: ${response.status}`,
    );

  const astrologyChart = await response.json();
  return astrologyChart;
};
