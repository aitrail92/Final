import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface CustomerOrder {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  zip_code: string
  house_photo_url?: string
  location_latitude?: number
  location_longitude?: number
  created_at: string
  updated_at: string
}

export interface OrderFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  zipCode: string
  housePhotoUrl?: string
  locationLatitude?: number
  locationLongitude?: number
}