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

export interface TarotCardTypes {
  card_name: string;
  meanings: {
    upright: string;
    reversed: string;
  };
  number: number | null;
  card_links: string | null;
  astrological_sign: string | null;
  element: string;
  wikipedia_link: string;
}
