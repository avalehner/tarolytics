import { ReadingTypes, NewReadingTypes } from "../types"

export const getAllReadings = async (): Promise<ReadingTypes[]> => {
  const response = await fetch('http://localhost:3000/api/readings/', {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }, 
  })
  const readingData = await response.json()
  return readingData 
}

export const createReading = async (data: NewReadingTypes): Promise<NewReadingTypes> => {
  const response = await fetch('http://localhost:3000/api/readings/', {
    method: 'POST', 
    headers: {'Content-Type': 'application/json' }, 
    body: JSON.stringify(data), //convert data from object to string
  })
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }
  const readingData = await response.json()
  return readingData
}
