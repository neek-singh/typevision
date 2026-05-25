import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  throw new Error(
    `[Supabase Client Error]: Missing config key(s): ${missing.join(', ')}. ` +
    `Ensure these credentials are configured inside your .env.local file or deployment console variables.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
