import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMood, MoodLevel, MoodTag } from '@context/moodcontext';
import { useAuth } from '@context/authcontext';
import { BottomNavbar } from '../components/BottomNavbar';
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

const moodOptions: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '😞', label: 'Very bad' },
  { level: 2, emoji: '😟', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Very good' },
];

const tagOptions: MoodTag[] = [
  'Workload',
  'Collaboration',
  'Recognition',
  'Autonomy',
  'Focus',
  'Personal',
  'Other',
];

const CheckInScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addEntry } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<MoodTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const isManager = user?.account_type === 'manager';

  useEffect(() => {
    if (isManager) {
      loadTeamStats();
    }
  }, [isManager]);

  const loadTeamStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await supabaseService.getTeamStats(30);
      setTeamStats(stats);
    } catch (error) {
      console.error('Error loading team stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const toggleTag = (tag: MoodTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 2) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      await addEntry(selectedMood, selectedTags);
      router.replace('/checkin-success');
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      alert('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedMood !== null;

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
            <Text className="font-inter-regular text-sm text-slate-500">Today&apos;s check-in</Text>
            <Text className="font-inter-medium text-base text-slate-900">{today}</Text>
          </View>
          <View className="flex-row items-center">
            <Image source={require('../assets/images/logo.png')} className="w-8 h-6" />
            <Text className="ml-2 font-inter-semibold text-xl text-slate-900">Moodly</Text>
          </View>
        </View>

        {isManager ? (
          <View className="px-6 pb-32">
            {statsLoading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-4 font-inter-medium text-sm text-slate-500">Loading team statistics...</Text>
              </View>
            ) : teamStats ? (
              <>
                <View className="mb-6">
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

                <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <Text className="mb-4 font-inter-medium text-sm text-slate-600">30-day average</Text>
                  <View className="items-center">
                    <View className="relative items-center justify-center" style={{ width: 120, height: 120 }}>
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
                      <View
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

                <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="font-inter-semibold text-base text-slate-900">30-day trend over time</Text>
                      <Ionicons name="information-circle-outline" size={18} color="#64748b" className="ml-2" />
                    </View>
                    <Ionicons name="chevron-down" size={24} color="#64748b" />
                  </View>
                </View>

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
        ) : (
          <View className="mx-4 mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 mb-38">
            <View>
              <Text className="mb-6 font-inter-semibold text-xl text-slate-900">
                How are you feeling today?
              </Text>

              <View className="mb-6 flex-row flex-wrap justify-center">
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    onPress={() => setSelectedMood(option.level)}
                    className={`items-center rounded-2xl p-4 m-2 ${selectedMood === option.level
                      ? 'bg-blue-50 border-2 border-blue-600'
                      : 'bg-white border-2 border-slate-200'
                      }`}
                    style={{ width: '28%' }}>
                    <Text className="mb-2 text-3xl">{option.emoji}</Text>
                    <Text className="font-inter-regular text-xs text-slate-600 text-center">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {!isManager && (
              <View className="mt-8">
                <Text className="mb-2 font-inter-semibold text-lg text-slate-900">
                  What&apos;s influencing your mood?
                </Text>

                <View className="mb-4 flex-row flex-wrap">
                  {tagOptions.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      className={`mb-3 mr-3 rounded-full px-6 py-3 ${selectedTags.includes(tag)
                        ? 'bg-blue-600'
                        : 'bg-slate-100'
                        }`}>
                      <Text
                        className={`font-inter-medium text-sm ${selectedTags.includes(tag) ? 'text-white' : 'text-slate-700'
                          }`}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="font-inter-regular text-xs text-slate-500">
                  {selectedTags.length}/2 selected
                </Text>
              </View>
            )}

            {!isManager && (
              <>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={`mt-8 rounded-full py-4 ${canSubmit && !isSubmitting ? 'bg-blue-600' : 'bg-slate-300'
                    }`}>
                  <Text className="text-center font-inter-semibold text-base text-white">
                    {isSubmitting ? 'Submitting...' : 'Submit check-in'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View className="mt-6 flex-row rounded-xl bg-slate-50 p-4">
              <Ionicons name="shield-checkmark-outline" size={20} color="#64748b" />
              <View className="ml-3 flex-1">
                <Text className="font-inter-regular text-xs leading-5 text-slate-600">
                  We never show individual responses. Only aggregated team trends over the last 30 days.
                </Text>
                <TouchableOpacity>
                  <Text className="mt-1 font-inter-medium text-xs text-blue-600">
                    How your data is used
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {isManager ? (
        <ManagerNavbar activeTab="dashboard" />
      ) : (
        <BottomNavbar activeTab="dashboard" />
      )}
    </KeyboardAvoidingView>
  );
};

export default CheckInScreen;
