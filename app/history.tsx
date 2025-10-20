import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMood } from '@context/moodcontext';

const moodEmojis: Record<number, string> = {
    1: '😞',
    2: '😟',
    3: '😐',
    4: '🙂',
    5: '😄',
};

const moodLabels: Record<number, string> = {
    1: 'Very bad',
    2: 'Bad',
    3: 'Okay',
    4: 'Good',
    5: 'Very good',
};

const HistoryScreen: React.FC = () => {
    const router = useRouter();
    const { entries, get30DayAverage, get7DayTrend, getEntriesByWeek } = useMood();

    const average = get30DayAverage();
    const trend = get7DayTrend();
    const { thisWeek, lastWeek } = getEntriesByWeek();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateString === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateString === yesterday.toISOString().split('T')[0]) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerClassName="pb-8">
                {/* Header */}
                <View className="mt-6 flex-row items-center px-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="font-inter-bold text-2xl text-slate-900">Your mood history</Text>
                        <Text className="font-inter-regular text-sm text-slate-500">
                            Your personal check-ins from the last 30 days
                        </Text>
                    </View>
                </View>

                {/* Statistics Cards */}
                <View className="mt-6 flex-row px-6">
                    {/* 30-day Average */}
                    <View className="mr-3 flex-1 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                        <View className="mb-2 flex-row items-center">
                            <Ionicons name="calendar-outline" size={16} color="#64748b" />
                            <Text className="ml-2 font-inter-medium text-xs text-slate-600">
                                30-day average
                            </Text>
                        </View>
                        <Text className="font-inter-bold text-3xl text-slate-900">
                            {average > 0 ? average.toFixed(1) : '—'}
                            <Text className="font-inter-regular text-base text-slate-500"> /5.0</Text>
                        </Text>
                    </View>

                    {/* 7-day Trend */}
                    <View className="ml-3 flex-1 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                        <View className="mb-2 flex-row items-center">
                            <Ionicons name="trending-up-outline" size={16} color="#64748b" />
                            <Text className="ml-2 font-inter-medium text-xs text-slate-600">
                                7-day trend
                            </Text>
                        </View>
                        <Text className="font-inter-bold text-2xl text-slate-900">{trend}</Text>
                    </View>
                </View>

                {/* This Week */}
                {thisWeek.length > 0 && (
                    <View className="mt-8 px-6">
                        <Text className="mb-4 font-inter-semibold text-base text-slate-900">This week</Text>
                        {thisWeek.map((entry) => (
                            <View
                                key={entry.id}
                                className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                                <View className="flex-row items-center">
                                    <Text className="mr-3 text-3xl">{moodEmojis[entry.mood]}</Text>
                                    <View>
                                        <Text className="font-inter-medium text-base text-slate-900">
                                            {moodLabels[entry.mood]}
                                        </Text>
                                        <Text className="font-inter-regular text-sm text-slate-500">
                                            {formatDate(entry.date)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row">
                                    {entry.tags.map((tag, index) => (
                                        <View
                                            key={index}
                                            className="ml-2 rounded-full bg-slate-100 px-3 py-1">
                                            <Text className="font-inter-medium text-xs text-slate-700">{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Last Week */}
                {lastWeek.length > 0 && (
                    <View className="mt-6 px-6">
                        <Text className="mb-4 font-inter-semibold text-base text-slate-900">Last week</Text>
                        {lastWeek.map((entry) => (
                            <View
                                key={entry.id}
                                className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                                <View className="flex-row items-center">
                                    <Text className="mr-3 text-3xl">{moodEmojis[entry.mood]}</Text>
                                    <View>
                                        <Text className="font-inter-medium text-base text-slate-900">
                                            {moodLabels[entry.mood]}
                                        </Text>
                                        <Text className="font-inter-regular text-sm text-slate-500">
                                            {formatDate(entry.date)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row">
                                    {entry.tags.map((tag, index) => (
                                        <View
                                            key={index}
                                            className="ml-2 rounded-full bg-slate-100 px-3 py-1">
                                            <Text className="font-inter-medium text-xs text-slate-700">{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* No Data */}
                {entries.length === 0 && (
                    <View className="mt-20 items-center px-8">
                        <Ionicons name="time-outline" size={64} color="#cbd5e1" />
                        <Text className="mt-4 text-center font-inter-semibold text-xl text-slate-900">
                            No check-ins yet
                        </Text>
                        <Text className="mt-2 text-center font-inter-regular text-base text-slate-600">
                            Start tracking your mood to see your history and trends here.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View className="flex-row items-center justify-around border-t border-slate-200 py-4">
                <TouchableOpacity
                    onPress={() => router.push('/dashboard')}
                    className="items-center py-2 px-4">
                    <Ionicons name="home-outline" size={24} color="#94a3b8" />
                    <Text className="mt-1 font-inter-regular text-xs text-slate-500">Check-in</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center py-2 px-4">
                    <Ionicons name="time" size={24} color="#2563eb" />
                    <Text className="mt-1 font-inter-medium text-xs text-blue-600">History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/profile')}
                    className="items-center py-2 px-4">
                    <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
                    <Text className="mt-1 font-inter-regular text-xs text-slate-500">Sign out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HistoryScreen;
