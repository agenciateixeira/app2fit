import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// UserProfile interface (se usando TypeScript, mova para um arquivo .ts)
export interface UserProfile {
  id: string
  email?: string
  full_name?: string
  gender?: 'male' | 'female'
  age?: number
  height?: number // em cm
  current_weight?: number // em kg
  target_weight?: number // em kg
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
  goal?: 'lose_weight' | 'gain_weight' | 'maintain_weight'
  daily_calories?: number
  daily_protein?: number
  daily_carbs?: number
  daily_fat?: number
  onboarding_completed?: boolean
  created_at?: string
  updated_at?: string
}