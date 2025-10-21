import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
        'Missing Supabase configuration. Please create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
export type AccountType = 'employee' | 'manager' | 'superadmin';
export type MoodLevel = 'very_bad' | 'bad' | 'okay' | 'good' | 'very_good';

export interface Profile {
    id: string;
    email: string;
    username: string;
    account_type: AccountType;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: string;
    user_id: string;
    date: string;
    mood: MoodLevel;
    reasons: string[];
    created_at: string;
    updated_at: string;
}
