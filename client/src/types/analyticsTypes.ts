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
  readings_per_month: ReadingsPerMonthTypes[];
}

export interface CardSearchNotesTypes {
  reading_id: string;
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

export interface ReadingsPerMonthTypes {
  month: string;
  readings: number;
}
