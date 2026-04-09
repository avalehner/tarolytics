import { createClient } from '@supabase/supabase-js'

//get environment variables from .env 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

//creating and exporting supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)