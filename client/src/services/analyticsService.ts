export const getNonSearchData = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/analytics/${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/josn" },
      credentials: "include",
    },
  );

  if (!response.ok)
    throw new Error(
      `Server error [getNonSearchData - analyticsService.ts]: ${response.status}`,
    );

  const analyticsData = await response.json();
  return analyticsData;
};
