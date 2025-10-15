import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL');
if (!anon) throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY');

let _client: SupabaseClient | null = null;
export function supabaseBrowser() {
  if (_client) return _client;
  _client = createClient(url!, anon!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}
