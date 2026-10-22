import { createClient } from "@supabase/supabase-js";

// These public values come from .env.local. Never put a service-role key here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase now calls the browser-safe anon key a publishable key.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase =
  isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : null;
