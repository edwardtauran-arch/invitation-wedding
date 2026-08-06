import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || supabaseServiceKey;

// Use service_role key for server-side operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey || "placeholder");

// For client-side (anon key, respects RLS)
export const supabaseAnon = createClient(
  supabaseUrl,
  supabaseAnonKey || "placeholder"
);
