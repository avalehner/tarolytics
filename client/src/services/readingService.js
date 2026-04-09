import { supabase } from "../supabaseClient"

export const createReading = async (readingData) => {
  try {
    //inserts data into database 
    const { data, error } = await supabase 
      .from('readings')
      .insert({
        reading_date: readingData.reading_date, 
        reading_topic: readingData.reading_topic,
        reading_spread: readingData.reading_spread,
        cards: readingData.cards,
        notes: readingData.notes
      })
      .select () //return the created reading 

      //checking for supabase errors, if true jumps to catch block 
      if (error) throw error

      return { success: true, data: data[0] } //returns created reading

  } catch (error) {

    console.error('Error creating reading:', error)

    return { success: false, error: error.message }
  }
}

export const getAllReadings = async () => {
  try {
    const { data , error } = await supabase
      .from('readings')
      .select('*')
      .order('reading_date', { ascending: false })

    if (error) throw error 

    return { success: true, data } 

  } catch (error) {
    console.error('Error:', error)
    return { success:false, error: error.message}
  }
}

export const getReadingsByDate = async (date) => {
  try {
    const { data , error } = await supabase 
      .from('readings')
      .select('*') // which columns to return '*' means return all columns (vertical filter)
      .eq('reading_date', date) // (horizontal filter) which rows to return, this says give me only rows where reading date is equal to current date. eq takes in column name and value to match 

    if (error) throw error

    return { success: true, data } //this is an object literal, this is a new object we have created. data is not an array, it is just one obj because we were only querying for one

    /* 
    const result = { success: true, data: data}
    return result 
    */ //same as return { success:true, data }

  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: error.message}
  }
}

export const updateReading = async (id, updates) => {
  try {
    const { data , error } = await supabase //read this right to left. await makes js wait for all methods to complete before assignment 
      .from('readings')
      .update(updates) //contains an object with what to update 
      .eq('id', id) //where to put those updates 
      .select() //select has two different uses: 1. read operation with vertical filter; 2. (this case) return result. in this case it is telling supabase to fetch the updated row and send it back to me

    if (error) throw error 

    return { success: true, data: data[0]} //data is an array 

  } catch (error) {
    console.error ('Error:', error)

    return { success: false, error: error.message }
  }
}

export const deleteReading = async (id) => {
  try {
    const { error } = await supabase 
      .from('readings')
      .delete() //does not take in any parameters, must use eq to filter for what to delete
      .eq('id', id)
      .select()

    if (error) throw error 

    return { success: true } //delete doesn't usually return data 
  } catch (error) {

    console.error ('Error:', error)

    return { success: false, error: error.message}
  }
}