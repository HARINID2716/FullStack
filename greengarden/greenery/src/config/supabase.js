import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase env vars missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 🔥 Make it available in browser console for testing
window.supabase = supabase;

export default supabase;


