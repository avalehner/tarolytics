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