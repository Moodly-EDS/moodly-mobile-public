import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ManagerNavbar } from '../components/ManagerNavbar';
import { supabaseService } from '../services/supabaseService';

interface TeamStats {
    average: number;
    totalReports: number;
    last7Days: {
        average: number;
        trend: string;
        trendDiff: number;
        totalCheckins: number;
        moodDistribution: {
            very_bad: number;
            bad: number;
            okay: number;
            good: number;
            very_good: number;
        };
        chartData: { date: string; average: number }[];
    };
    topInfluences: { reason: string; count: number }[];
}

const ManagerDashboard: React.FC = () => {
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        loadTeamStats();
    }, []);

    const loadTeamStats = async () => {
        setStatsLoading(true);
        try {
            const stats = await supabaseService.getTeamStats(30);
            setTeamStats(stats);
            console.log('📊 Team stats loaded:', stats);
        } catch (error) {
            console.error('Error loading team stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerClassName="pb-32">
                <View className="mt-16 flex-row items-center justify-between px-6">
                    <View>
                        <Text className="font-inter-regular text-sm text-slate-500">Team Dashboard</Text>
                        <Text className="font-inter-medium text-base text-slate-900">{today}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Image source={require('../assets/images/logo.png')} className="w-8 h-6" />
                        <Text className="ml-2 font-inter-semibold text-xl text-slate-900">Moodly</Text>
                    </View>
                </View>

                <View className="px-6 pb-32">
                    {statsLoading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#2563eb" />
                            <Text className="mt-4 font-inter-medium text-sm text-slate-500">Loading team statistics...</Text>
                        </View>
                    ) : teamStats ? (
                        <>
                            {/* Header */}
                            <View className="mb-6 mt-8">
                                <Text className="font-inter-bold text-2xl text-slate-900">Team Wellbeing Dashboard</Text>
                                <View className="mt-1 flex-row items-center">
                                    <Ionicons name="people-outline" size={16} color="#64748b" />
                                    <Text className="ml-1 font-inter-medium text-sm text-slate-500">
                                        Engineering Team
                                    </Text>
                                </View>
                                <Text className="mt-1 font-inter-regular text-xs text-slate-400">
                                    30-day anonymous, aggregated team trends
                                </Text>
                            </View>

                            {/* 30-day Average Card */}
                            <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                                <Text className="mb-4 font-inter-medium text-sm text-slate-600">30-day average</Text>
                                <View className="items-center">
                                    <View className="relative items-center justify-center" style={{ width: 120, height: 120 }}>
                                        {/* Outer Circle */}
                                        <View
                                            style={{
                                                position: 'absolute',
                                                width: 120,
                                                height: 120,
                                                borderRadius: 60,
                                                borderWidth: 8,
                                                borderColor: '#e2e8f0',
                                            }}
                                        />
                                        {/* Progress Circle */}
                                        <View
                                            className="transition-transform duration-1000"
                                            style={{
                                                position: 'absolute',
                                                width: 120,
                                                height: 120,
                                                borderRadius: 60,
                                                borderWidth: 8,
                                                borderColor: '#2563eb',
                                                borderTopColor: 'transparent',
                                                borderRightColor: 'transparent',
                                                transform: [{ rotate: `${-45 + (teamStats.average / 5) * 360}deg` }],
                                            }}
                                        />
                                        {/* Score */}
                                        <View className="items-center">
                                            <Text className="font-inter-bold text-4xl text-slate-900">
                                                {teamStats.average.toFixed(1)}
                                            </Text>
                                            <Text className="font-inter-regular text-sm text-slate-500">/5.0</Text>
                                        </View>
                                    </View>
                                    <Text className="mt-4 text-4xl">
                                        {teamStats.average >= 4.5 ? '😄' : teamStats.average >= 3.5 ? '🙂' : teamStats.average >= 2.5 ? '😐' : teamStats.average >= 1.5 ? '😟' : '😞'}
                                    </Text>
                                </View>
                            </View>

                            {/* 7-day Trend Card */}
                            <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                                <View className="mb-4 flex-row items-center justify-between">
                                    <Text className="font-inter-medium text-sm text-slate-600">7-day trend</Text>
                                    <Ionicons name="information-circle-outline" size={20} color="#64748b" />
                                </View>

                                <View className={`mb-4 flex-row items-center rounded-2xl p-4 ${teamStats.last7Days.trend === 'Rising' ? 'bg-green-50' : teamStats.last7Days.trend === 'Falling' ? 'bg-red-50' : 'bg-slate-50'
                                    }`}>
                                    <View className={`mr-3 items-center justify-center rounded-full p-2 ${teamStats.last7Days.trend === 'Rising' ? 'bg-green-100' : teamStats.last7Days.trend === 'Falling' ? 'bg-red-100' : 'bg-slate-100'
                                        }`}>
                                        <Ionicons
                                            name={teamStats.last7Days.trend === 'Rising' ? 'arrow-up' : teamStats.last7Days.trend === 'Falling' ? 'arrow-down' : 'remove'}
                                            size={20}
                                            color={teamStats.last7Days.trend === 'Rising' ? '#16a34a' : teamStats.last7Days.trend === 'Falling' ? '#dc2626' : '#64748b'}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-inter-bold text-2xl ${teamStats.last7Days.trend === 'Rising' ? 'text-green-700' : teamStats.last7Days.trend === 'Falling' ? 'text-red-700' : 'text-slate-700'
                                            }`}>
                                            {teamStats.last7Days.trend}
                                        </Text>
                                        <Text className={`font-inter-regular text-sm ${teamStats.last7Days.trend === 'Rising' ? 'text-green-600' : teamStats.last7Days.trend === 'Falling' ? 'text-red-600' : 'text-slate-600'
                                            }`}>
                                            {teamStats.last7Days.trendDiff > 0 ? '+' : ''}{teamStats.last7Days.trendDiff.toFixed(2)} vs prev week
                                        </Text>
                                    </View>
                                </View>

                                {/* Mini Chart */}
                                <View className="h-20 flex-row items-end justify-between px-2">
                                    {teamStats.last7Days.chartData.map((day, index) => (
                                        <View
                                            key={index}
                                            className="w-8 rounded-t-lg bg-blue-200"
                                            style={{ height: day.average > 0 ? `${(day.average / 5) * 100}%` : '5%' }}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Top Influences Card */}
                            <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                                <View className="mb-4 flex-row items-center justify-between">
                                    <Text className="font-inter-medium text-sm text-slate-600">Top influences</Text>
                                    <Ionicons name="information-circle-outline" size={20} color="#64748b" />
                                </View>

                                <View className="space-y-4">
                                    {teamStats.topInfluences.slice(0, 3).map((influence, index) => {
                                        const colors = ['#2563eb', '#22c55e', '#f97316'];
                                        const maxCount = Math.max(...teamStats.topInfluences.map(i => i.count));
                                        const percentage = (influence.count / maxCount) * 100;

                                        return (
                                            <View key={index} className={index < 2 ? 'mb-4' : ''}>
                                                <View className="mb-2 flex-row items-center justify-between">
                                                    <Text className="font-inter-medium text-sm text-slate-700">{influence.reason}</Text>
                                                    <Text className="font-inter-semibold text-sm text-slate-900">{influence.count}</Text>
                                                </View>
                                                <View className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <View
                                                        className="h-full rounded-full"
                                                        style={{ width: `${percentage}%`, backgroundColor: colors[index] }}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Team Mood Breakdown */}
                            <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                                <View className="mb-1 flex-row items-center justify-between">
                                    <Text className="font-inter-semibold text-base text-slate-900">Team mood breakdown</Text>
                                    <View className="rounded-full bg-slate-100 px-3 py-1">
                                        <Text className="font-inter-medium text-xs text-slate-600">App</Text>
                                    </View>
                                </View>
                                <Text className="mb-4 font-inter-regular text-xs text-slate-500">
                                    Last 7 days • {teamStats.last7Days.totalCheckins} check-ins
                                </Text>

                                {/* Bar Chart */}
                                <View className="mb-6 space-y-3">
                                    {[
                                        { emoji: '😞', mood: 'very_bad', color: '#dc2626' },
                                        { emoji: '😟', mood: 'bad', color: '#f97316' },
                                        { emoji: '😐', mood: 'okay', color: '#eab308' },
                                        { emoji: '🙂', mood: 'good', color: '#22c55e' },
                                        { emoji: '😄', mood: 'very_good', color: '#16a34a' },
                                    ].map((item, index) => {
                                        const count = teamStats.last7Days.moodDistribution[item.mood as keyof typeof teamStats.last7Days.moodDistribution];
                                        const percentage = teamStats.last7Days.totalCheckins > 0
                                            ? (count / teamStats.last7Days.totalCheckins) * 100
                                            : 0;

                                        return (
                                            <View key={index} className="flex-row items-center">
                                                <Text className="mr-3 text-2xl" style={{ width: 30 }}>{item.emoji}</Text>
                                                <View className="flex-1">
                                                    <View
                                                        className="h-8 rounded-lg"
                                                        style={{
                                                            width: percentage > 0 ? `${percentage}%` : '100%',
                                                            backgroundColor: count === 0 ? '#e2e8f0' : item.color,
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>

                                {/* Percentage Labels */}
                                <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
                                    {[
                                        { emoji: '😞', mood: 'very_bad' },
                                        { emoji: '😟', mood: 'bad' },
                                        { emoji: '😐', mood: 'okay' },
                                        { emoji: '🙂', mood: 'good' },
                                        { emoji: '😄', mood: 'very_good' },
                                    ].map((item, index) => {
                                        const count = teamStats.last7Days.moodDistribution[item.mood as keyof typeof teamStats.last7Days.moodDistribution];
                                        const percentage = teamStats.last7Days.totalCheckins > 0
                                            ? Math.round((count / teamStats.last7Days.totalCheckins) * 100)
                                            : 0;

                                        return (
                                            <View key={index} className="items-center">
                                                <Text className="mb-1 text-2xl">{item.emoji}</Text>
                                                <Text className="font-inter-semibold text-sm text-slate-900">
                                                    {count > 0 ? `${percentage}%` : 'N/A'}
                                                </Text>
                                                <Text className="font-inter-regular text-xs text-slate-500">({count})</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* 30-day Trend Over Time (Collapsed) */}
                            <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Text className="font-inter-semibold text-base text-slate-900">30-day trend over time</Text>
                                        <Ionicons name="information-circle-outline" size={18} color="#64748b" className="ml-2" />
                                    </View>
                                    <Ionicons name="chevron-down" size={24} color="#64748b" />
                                </View>
                            </View>

                            {/* Privacy Notice */}
                            <View className="rounded-3xl bg-slate-50 p-6">
                                <View className="flex-row">
                                    <Ionicons name="information-circle-outline" size={24} color="#64748b" />
                                    <View className="ml-3 flex-1">
                                        <Text className="mb-2 font-inter-semibold text-sm text-slate-900">About this data:</Text>
                                        <Text className="font-inter-regular text-xs leading-5 text-slate-600">
                                            All check-ins are anonymous and aggregated at the team level. Trends are only shown when there are sufficient responses to preserve individual privacy.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View className="items-center justify-center py-20">
                            <Text className="font-inter-medium text-sm text-slate-500">No team data available</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            <ManagerNavbar activeTab="dashboard" />
        </KeyboardAvoidingView>
    );
};

export default ManagerDashboard;
