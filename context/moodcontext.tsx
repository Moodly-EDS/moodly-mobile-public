import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Report } from '../services/supabase';
import {
    MoodLevel,
    MoodTag,
    supabaseToMoodLevel,
    supabaseToMoodTags,
    moodLevelToSupabase,
    moodTagsToSupabase,
} from '../services/mappers';

export { MoodLevel, MoodTag };

export interface MoodEntry {
    id: string;
    date: string;
    mood: MoodLevel;
    tags: MoodTag[];
    timestamp: number;
}

interface MoodContextType {
    entries: MoodEntry[];
    addEntry: (mood: MoodLevel, tags: MoodTag[]) => Promise<void>;
    hasCheckedInToday: () => boolean;
    getTodayEntry: () => MoodEntry | undefined;
    get30DayAverage: () => number;
    get7DayTrend: () => 'Rising' | 'Falling' | 'Stable';
    getEntriesByWeek: () => { thisWeek: MoodEntry[]; lastWeek: MoodEntry[] };
    refreshEntries: () => Promise<void>;
    loading: boolean;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const supabaseReportToMoodEntry = (report: Report): MoodEntry => {
    return {
        id: report.id,
        date: report.date,
        mood: supabaseToMoodLevel(report.mood),
        tags: supabaseToMoodTags(report.reasons),
        timestamp: new Date(report.date).getTime(),
    };
};

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const reports = await supabaseService.getMyReports();
            const moodEntries = reports.map(supabaseReportToMoodEntry);
            setEntries(moodEntries);
        } catch (error) {
            if (error && typeof error === 'object' && 'name' in error && error.name === 'AuthSessionMissingError') {
                setEntries([]);
            } else {
                console.error('Failed to load mood entries:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const addEntry = async (mood: MoodLevel, tags: MoodTag[]) => {
        try {
            const supabaseMood = moodLevelToSupabase(mood);
            const supabaseReasons = moodTagsToSupabase(tags);

            const report = await supabaseService.createReport(supabaseMood, supabaseReasons);
            const newEntry = supabaseReportToMoodEntry(report);

            setEntries([newEntry, ...entries]);
        } catch (error) {
            console.error('Failed to add mood entry:', error);
            throw error;
        }
    };

    const hasCheckedInToday = (): boolean => {
        const today = new Date().toISOString().split('T')[0];
        return entries.some(entry => entry.date === today);
    };

    const getTodayEntry = (): MoodEntry | undefined => {
        const today = new Date().toISOString().split('T')[0];
        return entries.find(entry => entry.date === today);
    };

    const refreshEntries = async () => {
        setLoading(true);
        await loadEntries();
    };

    const get30DayAverage = (): number => {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recentEntries = entries.filter(entry => entry.timestamp >= thirtyDaysAgo);

        if (recentEntries.length === 0) return 0;

        const sum = recentEntries.reduce((acc, entry) => acc + entry.mood, 0);
        return Math.round((sum / recentEntries.length) * 10) / 10;
    };

    const get7DayTrend = (): 'Rising' | 'Falling' | 'Stable' => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

        const lastWeekEntries = entries.filter(
            entry => entry.timestamp >= sevenDaysAgo
        );
        const previousWeekEntries = entries.filter(
            entry => entry.timestamp >= fourteenDaysAgo && entry.timestamp < sevenDaysAgo
        );

        if (lastWeekEntries.length === 0) return 'Stable';

        const lastWeekAvg = lastWeekEntries.reduce((acc, e) => acc + e.mood, 0) / lastWeekEntries.length;
        const previousWeekAvg = previousWeekEntries.length > 0
            ? previousWeekEntries.reduce((acc, e) => acc + e.mood, 0) / previousWeekEntries.length
            : lastWeekAvg;

        const difference = lastWeekAvg - previousWeekAvg;

        if (difference > 0.3) return 'Rising';
        if (difference < -0.3) return 'Falling';
        return 'Stable';
    };

    const getEntriesByWeek = () => {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

        return {
            thisWeek: entries.filter(entry => entry.timestamp >= sevenDaysAgo),
            lastWeek: entries.filter(
                entry => entry.timestamp >= fourteenDaysAgo && entry.timestamp < sevenDaysAgo
            ),
        };
    };

    return (
        <MoodContext.Provider
            value={{
                entries,
                addEntry,
                hasCheckedInToday,
                getTodayEntry,
                get30DayAverage,
                get7DayTrend,
                getEntriesByWeek,
                refreshEntries,
                loading,
            }}>
            {children}
        </MoodContext.Provider>
    );
};

export const useMood = (): MoodContextType => {
    const context = useContext(MoodContext);
    if (!context) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
};
