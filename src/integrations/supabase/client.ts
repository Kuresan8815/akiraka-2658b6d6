
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nmlpmvsxqkmfrddvdfaw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbHBtdnN4cWttZnJkZHZkZmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4Nzc5ODMsImV4cCI6MjA1MDQ1Mzk4M30.HPDO1-btalJuWRYHSWumyMGAcguyXDHGWs-GjJjG0Ys";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      debug: process.env.NODE_ENV === 'development'
    }
  }
);

// Initialize auth state from storage
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session }}) => {
    if (session) {
      console.log('Session initialized from storage');
    }
  });
}
