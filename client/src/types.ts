//reading types
export interface ReadingTypes {
  id: string;
  user_id: string; //? marks as optional
  reading_date: string;
  spread_type: string;
  reading_topic: string;
  notes: string;
  user_interpretation: string;
  ai_interpretation?: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingWithCardTypes extends ReadingTypes {
  card_names: string[] | null;
}

export type NewReadingTypes = Omit<
  ReadingTypes,
  "id" | "created_at" | "updated_at" | "ai_interpretation"
>;
export type UpdateReadingTypes = Omit<
  ReadingTypes,
  | "id"
  | "created_at"
  | "user_id"
  | "reading_date"
  | "spread_type"
  | "reading_topic"
  | "updated_at"
  | "ai_interpretation"
>;

//card types
export interface CardTypes {
  id: string;
  reading_id: string;
  card_name: string;
  position_name?: string | null;
  position_order: number;
  created_at: string;
  updated_at: string;
}

export type NewCardTypes = Omit<CardTypes, "id" | "created_at" | "updated_at">;
export type UpdateCardTypes = Omit<
  CardTypes,
  "id" | "created_at" | "updated_at"
>;

//user types

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

//city types
export interface CityTypes {
  formatted: string;
  lat: number;
  lng: number;
}

export interface CityOptionTypes {
  label: string;
  value: CityTypes;
}

//astrology types
export interface PlanetInterpretationTypes {
  sections: {
    id: string;
    key: string;
    category: string;
    title: string;
    body: string;
    tone: string;
    tags: [string, string];
    created_at: string;
    updated_at: string;
  };
}

export interface PlanetTypes {
  id: string;
  name: string;
  sign: string;
  sign_id: string;
  pos: number;
  abs_pos: number;
  retrograde: boolean;
  house: number;
  dignity: null;
  speed: number;
  is_stationary: false;
  declination_deg: number;
}

//analytics types
export interface SummaryStatsTypes {
  total_readings: string;
  unique_cards: string;
  major_arcana_pct: string;
  avg_per_week: string;
}

export interface MostPulledTypes {
  card_name: string;
  pull_count: string;
}

export interface SuitTrendTypes {
  suit: string;
  count: string;
}

export interface NonSearchDataTypes {
  summary_stats: SummaryStatsTypes;
  most_pulled: MostPulledTypes[];
  suit_trend: SuitTrendTypes[];
}

export interface CardSearchNotesTypes {
  date: string;
  spread_type: string;
  position_name: string;
  notes: string;
  //add cards in spread
}

export interface CardSearchTypes {
  total_pulls: string;
  suit: string;
  reversed_pulls: string;
  reversed_pct: string;
  reading_notes: CardSearchNotesTypes[] | null; //could be null if no notes associated with this specific reading
}

export interface PullsPerMonthTypes {
  [month: string]: number;
}

export interface MonthlyPullEntryType {
  month: string;
  pulls: number;
}
