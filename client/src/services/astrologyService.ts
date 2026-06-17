import type { PlanetTypes } from "../types";

export const getAstrologyData = async (): Promise<{
  chartData: string;
  planetsData: PlanetTypes[];
  interpretations: any;
}> => {
  const response = await fetch(`http://localhost:3000/api/astrology/`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });

  if (!response.ok)
    throw new Error(
      `Server error [getAstrologyChart - astrologyService.ts]: ${response.status}`,
    );

  const astrologyChart = await response.json();
  return astrologyChart;
};
