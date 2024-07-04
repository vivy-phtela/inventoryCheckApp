import { createClient } from "@supabase/supabase-js";

// console.log(process.env.REACT_PUBLIC_SUPABASE_URL);
// console.log(process.env.REACT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(
  process.env.REACT_PUBLIC_SUPABASE_URL,
  process.env.REACT_PUBLIC_SUPABASE_ANON_KEY
);
