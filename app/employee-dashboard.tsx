import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMood, MoodLevel, MoodTag } from '@context/moodcontext';
import { BottomNavbar } from '../components/BottomNavbar';

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

const EmployeeDashboard: React.FC = () => {
  const router = useRouter();
  const { addEntry } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<MoodTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: MoodTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
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
    day: 'numeric',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1 bg-white'>
      <ScrollView className='flex-1' contentContainerClassName='pb-32'>
        <View className='mt-16 flex-row items-center justify-between px-6'>
          <View>
            <Text className='font-inter-regular text-sm text-slate-500'>Today&apos;s check-in</Text>
            <Text className='font-inter-medium text-base text-slate-900'>{today}</Text>
          </View>
          <View className='flex-row items-center'>
            <Image source={require('../assets/images/logo.png')} className='h-6 w-8' />
            <Text className='font-inter-semibold ml-2 text-xl text-slate-900'>Moodly</Text>
          </View>
        </View>

        <View className='mx-4 mt-8 mb-38 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
          <View>
            <Text className='font-inter-semibold mb-6 text-xl text-slate-900'>
              How are you feeling today?
            </Text>

            <View className='mb-6 flex-row flex-wrap justify-center'>
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.level}
                  onPress={() => setSelectedMood(option.level)}
                  className={`m-2 items-center rounded-2xl p-4 ${
                    selectedMood === option.level
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border-2 border-slate-200 bg-white'
                  }`}
                  style={{
                    width: '28%',
                    transform: [{ scale: selectedMood === option.level ? 1.05 : 1 }],
                  }}>
                  <Text className='mb-2 text-3xl'>{option.emoji}</Text>
                  <Text className='font-inter-regular text-center text-xs text-slate-600'>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className='mt-8'>
            <Text className='font-inter-semibold mb-2 text-lg text-slate-900'>
              What&apos;s influencing your mood?
            </Text>

            <View className='mb-4 flex-row flex-wrap'>
              {tagOptions.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className={`mr-3 mb-3 rounded-full px-6 py-3 ${
                    selectedTags.includes(tag) ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                  style={{
                    transform: selectedTags.includes(tag) ? [{ scale: 1.05 }] : [{ scale: 1 }],
                  }}>
                  <Text
                    className={`font-inter-medium text-sm ${
                      selectedTags.includes(tag) ? 'text-white' : 'text-slate-700'
                    }`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className='font-inter-regular text-xs text-slate-500'>
              {selectedTags.length}/2 selected
            </Text>
          </View>

          <>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`mt-8 rounded-full py-4 ${
                canSubmit && !isSubmitting ? 'bg-blue-600 shadow-lg' : 'bg-slate-300'
              }`}
              style={{
                transform: [{ scale: canSubmit && !isSubmitting ? 1 : 0.98 }],
              }}>
              <Text className='font-inter-semibold text-center text-base text-white'>
                {isSubmitting ? 'Submitting...' : 'Submit check-in'}
              </Text>
            </TouchableOpacity>
          </>

          <View className='mt-6 flex-row rounded-xl bg-slate-50 p-4'>
            <Ionicons name='shield-checkmark-outline' size={20} color='#64748b' />
            <View className='ml-3 flex-1'>
              <Text className='font-inter-regular text-xs leading-5 text-slate-600'>
                We never show individual responses. Only aggregated team trends over the last 30
                days.
              </Text>
              <TouchableOpacity>
                <Text className='font-inter-medium mt-1 text-xs text-blue-600'>
                  How your data is used
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavbar activeTab='dashboard' />
    </KeyboardAvoidingView>
  );
};

export default EmployeeDashboard;
