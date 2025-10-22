import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from '../components/BottomNavbar';

const CheckInSuccessScreen: React.FC = () => {
  const router = useRouter();

  const handleAnotherCheckIn = () => {
    router.push('/dashboard');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  return (
    <View className='flex-1 items-center justify-center bg-white px-6'>
      <View className='mb-8 h-32 w-32 items-center justify-center rounded-full bg-green-100'>
        <Ionicons name='checkmark-circle' size={80} color='#10b981' />
      </View>

      <Text className='font-inter-bold mb-2 text-center text-2xl text-slate-900'>
        Check-in submitted!
      </Text>

      <Text className='font-inter-regular mb-8 text-center text-base leading-6 text-slate-600'>
        Your response has been recorded anonymously. Feel free to check in again anytime today.
      </Text>

      <TouchableOpacity
        onPress={handleAnotherCheckIn}
        className='w-full rounded-full border-2 border-slate-300 bg-white px-8 py-4 active:opacity-80'>
        <Text className='font-inter-semibold text-center text-base text-slate-900'>
          Submit another check-in
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleViewHistory} className='mt-6 active:opacity-70'>
        <Text className='font-inter-medium text-center text-base text-blue-600'>
          View your history
        </Text>
      </TouchableOpacity>

      <BottomNavbar activeTab='dashboard' />
    </View>
  );
};

export default CheckInSuccessScreen;
