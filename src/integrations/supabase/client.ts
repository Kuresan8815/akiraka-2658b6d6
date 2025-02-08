
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
      storageKey: 'admin-auth-token',
      storage: localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

// Add helper to handle sign out cleanly
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
  
  // Clear any stored tokens/session data
  localStorage.removeItem('admin-auth-token');
  localStorage.removeItem('supabase.auth.token');
};
