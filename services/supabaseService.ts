import { supabase, AccountType, Profile, Report, MoodLevel } from './supabase';

class SupabaseService {
    // ============================================
    // AUTHENTICATION
    // ============================================

    async signUp(email: string, password: string, username: string, accountType: AccountType) {
        // 1. Créer l'utilisateur dans auth.users
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // 2. Créer le profil dans public.profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                username,
                account_type: accountType,
            });

        if (profileError) throw profileError;

        return authData;
    }

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    }

    async getProfile(): Promise<Profile | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) throw error;

        // Si le profil n'existe pas, le créer (pour les utilisateurs existants)
        if (!data) {
            const username = user.email?.split('@')[0] || 'user';
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email || '',
                    username,
                    account_type: 'employee',
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return newProfile;
        }

        return data;
    }

    // ============================================
    // AUTH LISTENER
    // ============================================

    onAuthStateChange(callback: (user: any) => void) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });
    }

    // ============================================
    // REPORTS
    // ============================================

    async createReport(mood: MoodLevel, reasons: string[]): Promise<Report> {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('reports')
            .insert({
                user_id: user.id,
                date: today,
                mood,
                reasons,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getMyReports(): Promise<Report[]> {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async hasReportToday(): Promise<boolean> {
        const user = await this.getCurrentUser();
        if (!user) return false;

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('reports')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

        if (error) return false;
        return data !== null;
    }

    async getTodayReport(): Promise<Report | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

        if (error) return null;
        return data;
    }

    async updateReport(id: string, mood: MoodLevel, reasons: string[]): Promise<Report> {
        const { data, error } = await supabase
            .from('reports')
            .update({ mood, reasons, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteReport(id: string): Promise<void> {
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getAllReports(startDate?: string, endDate?: string): Promise<Report[]> {
        const profile = await this.getProfile();

        if (!profile || !['manager', 'superadmin'].includes(profile.account_type)) {
            throw new Error('Unauthorized');
        }

        let query = supabase
            .from('reports')
            .select('*, profiles(username, account_type)')
            .order('date', { ascending: false });

        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }
}

export const supabaseService = new SupabaseService();
