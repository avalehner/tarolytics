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
export type UpdateReadingTypes = Omit<ReadingTypes, 'id' | 'created_at' | 'user_id' |'reading_date' | 'spread_type' | 'reading_topic' | 'updated_at'>

export interface CardTypes {
  id: string, 
  reading_id: string, 
  card_name: string, 
  position_name?: string | null, 
  position_order: number, 
  created_at: string, 
  updated_at: string, 
}

export type NewCardTypes = Omit<CardTypes, 'id' | 'created_at' | 'updated_at'>
export type UpdateCardTypes = Omit<CardTypes, 'id' | 'created_at' | 'updated_at'> 

export interface UserTypes {
  id: string, 
  email: string, 
  last_name: string, 
  first_name: string, 
  google_id: string, 
  profile_url: string, 
  full_name: string
}