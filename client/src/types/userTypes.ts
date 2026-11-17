import type { CityTypes } from "./cityTypes";

export interface UserTypes {
  id: string;
  email: string;
  last_name: string;
  first_name: string;
  google_id: string;
  profile_url: string;
  full_name: string;
  birthday?: string | null;
  birth_time?: string;
  birth_timezone?: string;
  birth_location?: CityTypes | null;
  birth_city?: string;
}

export type UserProfileTypes = Omit<
  UserTypes,
  | "id"
  | "email"
  | "last_name"
  | "first_name"
  | "google_id"
  | "profile_url"
  | "full_name"
>;
