import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function assertEnv() {
  if (!supabaseUrl) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL en .env.local');
  if (!supabaseAnonKey) throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
}

let _client: SupabaseClient | null = null;
export function supabaseClient() {
  if (_client) return _client;
  assertEnv();
  _client = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return _client;
}
