import { CardTypes, NewCardTypes } from "../types"

export const getCardsForReading = async (readingId: string): Promise<CardTypes[]> => {
  const response = await fetch(`http://localhost:3000/api/cards/${readingId}`, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json'}, 
  })
  if(!response.ok) throw new Error(`Server error: ${response.status}`)
    
  const cardData = await response.json()
  return cardData
}

export const getAllCards = async (): Promise<CardTypes[]> => {
  const response = await fetch(`http://localhost:3000/api/cards/`, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json'}
  })
  if(!response.ok) throw new Error(`Server error: ${response.status}`)

  const cardData = await response.json()
  return cardData
}

export const saveCards = async (data: NewCardTypes): Promise<CardTypes> => {
  const response = await fetch('http://localhost:3000/api/cards/', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data)
  })
  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const cardData = await response.json()
  return cardData
}