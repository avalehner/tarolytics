export interface ReadingTypes {
  id: string, 
  user_id?: string, //? marks as optional 
  reading_date: string, 
  spread_type: string, 
  reading_topic: string, 
  notes: string, 
  interpretation: string, 
  created_at: string, 
  updated_at: string, 
}

export type NewReadingTypes = Omit<ReadingTypes, 'id' | 'created_at' | 'updated_at' | 'user_id'>

export interface CardTypes {
  id: string, 
  reading_id: string, 
  card_name: string, 
  position: string, 
  position_order: number, 
  created_at: string, 
  updated_at: string, 
}

export type NewCardTypes = Omit<CardTypes, 'id' | 'created_at' | 'updated_at'>