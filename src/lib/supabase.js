import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Database features will be unavailable.');
}

/**
 * Frontend Supabase client (using anon key)
 * 
 * Used for:
 * - Real-time subscriptions (Supabase Realtime)
 * - Direct file storage access (Supabase Storage)
 * 
 * The access token can be set via setSupabaseAccessToken() to authenticate
 * with Clerk JWT for RLS-protected realtime subscriptions.
 */
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : null;

/**
 * Set the access token for authenticated Supabase operations
 * Call this with the Clerk token to enable RLS-authenticated realtime
 */
export const setSupabaseAccessToken = async (token) => {
    if (!supabase) return;

    if (token) {
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
        });
    }
};

