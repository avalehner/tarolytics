export interface Reading {
  id?: string
  user_id?: string 
  reading_date: string 
  reading_topic: string 
  spread_type: string
  cards?: Card[]
  notes: string 
  interpretation: string
  created_at?: string 
  updated_at?: string 
}

export interface Card {
  id?: string
  reading_id?: string 
  card_name: string 
  position: string 
  position_order: number 
  created_at?: string 
}

export interface User {
  id?: string
  email: string 
  first_name: string 
  last_name: string 
  created_at?: string 
  updated_at?: string 
}