// src/shared/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file:\n' +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'set' : 'missing'}`
    );
  }

  if (supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || supabaseAnonKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    throw new Error(
      'Supabase environment variables are set to placeholder values. Please update your .env file with actual values.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
