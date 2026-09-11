import { createClient } from '@supabase/supabase-js';

// Recuerda crear tu archivo .env.local en la raíz del proyecto con estas variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);