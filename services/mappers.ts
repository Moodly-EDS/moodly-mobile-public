import { MoodLevel as SupabaseMood } from './supabase';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type MoodTag = 'Workload' | 'Collaboration' | 'Recognition' | 'Autonomy' | 'Focus' | 'Personal' | 'Other';

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

export const moodTagsToSupabase = (tags: MoodTag[]): string[] => {
    return tags;
};

export const supabaseToMoodTags = (tags: string[]): MoodTag[] => {
    return tags as MoodTag[];
};

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
