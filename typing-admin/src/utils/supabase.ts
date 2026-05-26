import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wwodnlsmiditrlyvbqnp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Szkh4LtZQGidkyY1VAQiIA_ueNwA-b3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
