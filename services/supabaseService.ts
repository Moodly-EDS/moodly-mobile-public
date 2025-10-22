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
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                if (error.message?.includes('session') || error.name === 'AuthSessionMissingError') {
                    return null;
                }
                throw error;
            }
            return user;
        } catch (error) {
            if (error && typeof error === 'object' && 'name' in error && error.name === 'AuthSessionMissingError') {
                return null;
            }
            throw error;
        }
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


    onAuthStateChange(callback: (user: any) => void) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });
    }


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
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            console.error('❌ getMyReports error:', error);
            throw error;
        }

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

    // ============================================
    // MANAGER STATISTICS (ANONYMOUS)
    // ============================================

    async getTeamStats(days: number = 30) {
        const profile = await this.getProfile();

        if (!profile || !['manager', 'superadmin'].includes(profile.account_type)) {
            throw new Error('Unauthorized: Only managers can view team statistics');
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        // Récupérer tous les reports anonymes (sans user_id)
        const { data: reports, error } = await supabase
            .from('reports')
            .select('mood, reasons, date')
            .gte('date', startDateStr)
            .order('date', { ascending: false });

        if (error) throw error;

        const allReports = reports || [];

        // Calculer la moyenne
        const average = allReports.length > 0
            ? allReports.reduce((sum, r) => sum + r.mood, 0) / allReports.length
            : 0;

        // Calculer le trend 7 jours
        const last7Days = allReports.filter(r => {
            const reportDate = new Date(r.date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return reportDate >= sevenDaysAgo;
        });

        const prev7Days = allReports.filter(r => {
            const reportDate = new Date(r.date);
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return reportDate >= fourteenDaysAgo && reportDate < sevenDaysAgo;
        });

        const last7DaysAvg = last7Days.length > 0
            ? last7Days.reduce((sum, r) => sum + r.mood, 0) / last7Days.length
            : 0;

        const prev7DaysAvg = prev7Days.length > 0
            ? prev7Days.reduce((sum, r) => sum + r.mood, 0) / prev7Days.length
            : 0;

        const trendDiff = last7DaysAvg - prev7DaysAvg;
        const trendLabel = trendDiff > 0.1 ? 'Rising' : trendDiff < -0.1 ? 'Falling' : 'Stable';

        // Distribution des moods (breakdown)
        const moodDistribution = {
            very_bad: 0,
            bad: 0,
            okay: 0,
            good: 0,
            very_good: 0,
        };

        last7Days.forEach(r => {
            if (r.mood && moodDistribution.hasOwnProperty(r.mood)) {
                moodDistribution[r.mood as MoodLevel]++;
            }
        });

        // Top influences (compter les raisons)
        const reasonsCount: Record<string, number> = {};
        last7Days.forEach(r => {
            r.reasons?.forEach((reason: string) => {
                reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
            });
        });

        const topInfluences = Object.entries(reasonsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([reason, count]) => ({ reason, count }));

        // Données pour le graphique 7 jours
        const last7DaysData: { date: string; average: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayReports = allReports.filter(r => r.date === dateStr);
            const dayAvg = dayReports.length > 0
                ? dayReports.reduce((sum, r) => sum + r.mood, 0) / dayReports.length
                : 0;

            last7DaysData.push({ date: dateStr, average: dayAvg });
        }

        return {
            average: Math.round(average * 10) / 10,
            totalReports: allReports.length,
            last7Days: {
                average: Math.round(last7DaysAvg * 10) / 10,
                trend: trendLabel,
                trendDiff: Math.round(trendDiff * 100) / 100,
                totalCheckins: last7Days.length,
                moodDistribution,
                chartData: last7DaysData,
            },
            topInfluences,
        };
    }
}

export const supabaseService = new SupabaseService();
