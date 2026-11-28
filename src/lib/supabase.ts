import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** False until .env.local holds the project's URL and publishable key; the app then shows how to set them up. */
export const isSupabaseConfigured = /^https?:\/\//.test(url) && !url.includes('YOUR-PROJECT-REF') && key.length > 20;

// createClient throws on an empty URL, so an unconfigured app gets a placeholder that is never called.
export const supabase = createClient(isSupabaseConfigured ? url : 'http://localhost', isSupabaseConfigured ? key : 'not-configured', {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Refresh the token only while the app is in front.
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
