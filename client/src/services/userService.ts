import type { UserProfileTypes, UserTypes } from "../types";

export const saveProfileData = async (
  userId: string,
  userProfile: UserProfileTypes,
): Promise<UserTypes> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userProfile),
  });

  if (!response.ok)
    throw new Error(
      `Server error [saveProfileData - userService.ts]: ${response.status}`,
    );

  const updatedUserData = await response.json();
  return updatedUserData;
};
