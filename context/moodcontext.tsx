import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type MoodTag = 'Workload' | 'Collaboration' | 'Recognition' | 'Autonomy' | 'Focus' | 'Personal' | 'Other';

export interface MoodEntry {
    id: string;
    date: string; // ISO date string
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
    loading: boolean;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const STORAGE_KEY = '@moodly_entries';

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Load entries from AsyncStorage on mount
    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedEntries) {
                setEntries(JSON.parse(storedEntries));
            }
        } catch (error) {
            console.error('Failed to load mood entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveEntries = async (newEntries: MoodEntry[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
            setEntries(newEntries);
        } catch (error) {
            console.error('Failed to save mood entries:', error);
        }
    };

    const addEntry = async (mood: MoodLevel, tags: MoodTag[]) => {
        const now = new Date();
        const newEntry: MoodEntry = {
            id: `${now.getTime()}`,
            date: now.toISOString().split('T')[0],
            mood,
            tags,
            timestamp: now.getTime(),
        };
        const updatedEntries = [newEntry, ...entries];
        await saveEntries(updatedEntries);
    };

    const hasCheckedInToday = (): boolean => {
        const today = new Date().toISOString().split('T')[0];
        return entries.some(entry => entry.date === today);
    };

    const getTodayEntry = (): MoodEntry | undefined => {
        const today = new Date().toISOString().split('T')[0];
        return entries.find(entry => entry.date === today);
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
