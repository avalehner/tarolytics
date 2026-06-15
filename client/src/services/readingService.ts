import {
  ReadingTypes,
  NewReadingTypes,
  UpdateReadingTypes,
  ReadingWithCardTypes,
} from "../types";

export const getAllReadings = async (): Promise<ReadingTypes[]> => {
  const response = await fetch("http://localhost:3000/api/readings/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", //for auth
  });
  if (!response.ok)
    throw new Error(
      `Server error [getAllReadings - readingService.ts]: ${response.status}`,
    );

  const readingData = await response.json();
  return readingData;
};

export const getReadingByReadingId = async (
  readingId: string,
): Promise<ReadingTypes> => {
  const response = await fetch(
    `http://localhost:3000/api/readings/${readingId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //for auth
    },
  );
  if (!response.ok)
    throw new Error(
      `Server error [getReadingById - readingService.ts]: ${response.status}`,
    );

  const readingData = await response.json();
  return readingData;
};

export const getReadingsByUserId = async (
  userId: string,
): Promise<ReadingWithCardTypes[]> => {
  const response = await fetch(
    `http://localhost:3000/api/readings/user/${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //for auth
    },
  );

  if (!response.ok)
    throw new Error(`
      Server error [getReadingsByUserId - readingService.ts]: ${response.status}`);

  const readingsData = await response.json();
  return readingsData;
};

export const createReading = async (
  data: NewReadingTypes,
): Promise<ReadingTypes> => {
  const response = await fetch("http://localhost:3000/api/readings/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data), //convert data from object to string
    credentials: "include", //for auth
  });
  if (!response.ok)
    throw new Error(
      `Server error [createReading - readingService.ts]: ${response.status}`,
    ); //fetch only throws error on network falures (no internet/server down). if server responds with status(500) or 404 fetch still considers that successful. this check throws an error for when the server is running but sends back an error

  const readingData = await response.json();
  return readingData;
};

export const updateReadingById = async (
  readingId: string,
  data: UpdateReadingTypes,
): Promise<ReadingTypes> => {
  const response = await fetch(
    `http://localhost:3000/api/readings/${readingId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    },
  );
  if (!response.ok)
    throw new Error(
      `Server error [updateReadingById - readingService.ts]: ${response.status}`,
    );

  const updatedReadingData = await response.json();
  return updatedReadingData;
};

export const deletedReadingById = async (readingId: string | undefined) => {
  const response = await fetch(
    `http://localhost:3000/api/readings/${readingId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //for auth
    },
  );

  if (!response.ok)
    throw new Error(
      `Server error [deleteReadingById - readingService.ts]: ${response.status}`,
    );

  const deletedReadingData = await response.json();
  return deletedReadingData;
};

export const interpretReadingById = async (
  readingId: string,
): Promise<string> => {
  const response = await fetch(
    `http://localhost:3000/api/readings/${readingId}/interpret`,
    {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok)
    throw new Error(
      `Server error [interpretReadingById- readingService.ts]: ${response.status}`,
    );

  const interpretation = await response.json();
  return interpretation;
};

export const saveAIInterpretation = async (
  readingId: string,
  interpretation: Object,
): Promise<ReadingTypes> => {
  const response = await fetch(
    `http://localhost:3000/api/readings/${readingId}/ai-interpretation`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interpretation),
      credentials: "include",
    },
  );

  if (!response.ok)
    throw new Error(
      `Server error [saveAIInterpretation readingService.ts]: ${response.status}`,
    );

  const updatedReading = await response.json();
  return updatedReading;
};
