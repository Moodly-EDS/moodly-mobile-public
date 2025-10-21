import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMood, MoodLevel, MoodTag } from '@context/moodcontext';
import { useAuth } from '@context/authcontext';

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
  const { user, logout } = useAuth();
  const { addEntry, hasCheckedInToday } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<MoodTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManager = user?.account_type === 'manager';
  const alreadyCheckedIn = hasCheckedInToday();

  useEffect(() => {
    if (!isManager && alreadyCheckedIn) {
      router.replace('/checkin-success');
    }
  }, [isManager, alreadyCheckedIn, router]);

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
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <View className="mt-6 flex-row items-center justify-between px-6">
          <View>
            <Text className="font-inter-regular text-sm text-slate-500">Today&apos;s check-in</Text>
            <Text className="font-inter-medium text-base text-slate-900">{today}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="people" size={24} color="#2563eb" />
            <Text className="ml-2 font-inter-semibold text-xl text-slate-900">Moodly</Text>
          </View>
        </View>

        <View className="mx-4 mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          {isManager ? (
            <View>
              <Text className="mb-4 font-inter-semibold text-xl text-slate-900">
                Manager Dashboard
              </Text>
              <View className="rounded-xl bg-blue-50 p-4 mb-4">
                <Ionicons name="information-circle" size={24} color="#2563eb" />
                <Text className="mt-2 font-inter-medium text-sm text-blue-900">
                  As a manager, you can view team statistics in the History tab.
                </Text>
                <Text className="mt-1 font-inter-regular text-xs text-blue-700">
                  Managers cannot submit mood check-ins.
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className="mb-6 font-inter-semibold text-xl text-slate-900">
                How are you feeling today?
              </Text>

              <View className="mb-6 flex-row justify-between">
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    onPress={() => setSelectedMood(option.level)}
                    className={`items-center rounded-2xl p-4 ${selectedMood === option.level
                      ? 'bg-blue-50 border-2 border-blue-600'
                      : 'bg-white border-2 border-slate-200'
                      }`}>
                    <Text className="mb-2 text-4xl">{option.emoji}</Text>
                    <Text className="font-inter-regular text-xs text-slate-600">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="mb-2 text-center font-inter-regular text-xs text-slate-500">
                Press 1-5 on your keyboard for quick selection
              </Text>
            </View>
          )}

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
                {selectedTags.length}/2 selected • Optional—helps understand patterns
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

              {canSubmit && (
                <Text className="mt-2 text-center font-inter-regular text-xs text-slate-500">
                  Press Enter to submit
                </Text>
              )}
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

        <View className="mt-8 flex-row items-center justify-around border-t border-slate-200 pt-4">
          <TouchableOpacity className="items-center py-2 px-4">
            <Ionicons name="home" size={24} color="#2563eb" />
            <Text className="mt-1 font-inter-medium text-xs text-blue-600">Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/history')}
            className="items-center py-2 px-4">
            <Ionicons name="time-outline" size={24} color="#94a3b8" />
            <Text className="mt-1 font-inter-regular text-xs text-slate-500">History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace('/login');
            }}
            className="items-center py-2 px-4">
            <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
            <Text className="mt-1 font-inter-regular text-xs text-slate-500">Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CheckInScreen;
