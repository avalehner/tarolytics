import { CityTypes } from "../types";

export const getCityData = async (cityName: string): Promise<CityTypes[]> => {
  const cityResponse = await fetch(
    `http://localhost:3000/api/cities?cityName=${cityName}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!cityResponse.ok)
    throw new Error(
      `Server error [getCityCoordinates - cityService.ts]: ${cityResponse.status}`,
    );

  const cityData = await cityResponse.json();

  return cityData;
};
