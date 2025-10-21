import { MoodLevel as SupabaseMood } from './supabase';

// App types
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type MoodTag = 'Workload' | 'Collaboration' | 'Recognition' | 'Autonomy' | 'Focus' | 'Personal' | 'Other';

// Convert app mood level to Supabase mood
export const moodLevelToSupabase = (level: MoodLevel): SupabaseMood => {
    const mapping: Record<MoodLevel, SupabaseMood> = {
        1: 'very_bad',
        2: 'bad',
        3: 'okay',
        4: 'good',
        5: 'very_good',
    };
    return mapping[level];
};

// Convert Supabase mood to app mood level
export const supabaseToMoodLevel = (mood: SupabaseMood): MoodLevel => {
    const mapping: Record<SupabaseMood, MoodLevel> = {
        'very_bad': 1,
        'bad': 2,
        'okay': 3,
        'good': 4,
        'very_good': 5,
    };
    return mapping[mood];
};

// Tags are stored as-is in Supabase (strings in JSON array)
export const moodTagsToSupabase = (tags: MoodTag[]): string[] => {
    return tags;
};

export const supabaseToMoodTags = (tags: string[]): MoodTag[] => {
    return tags as MoodTag[];
};

// Mood emojis
export const getMoodEmoji = (level: MoodLevel): string => {
    const emojis: Record<MoodLevel, string> = {
        1: '😞',
        2: '😟',
        3: '😐',
        4: '🙂',
        5: '😄',
    };
    return emojis[level];
};

// Mood labels
export const getMoodLabel = (level: MoodLevel): string => {
    const labels: Record<MoodLevel, string> = {
        1: 'Very bad',
        2: 'Bad',
        3: 'Okay',
        4: 'Good',
        5: 'Very good',
    };
    return labels[level];
};
