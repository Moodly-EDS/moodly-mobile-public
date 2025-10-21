import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@context/authcontext';

const IndexRedirect: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkInitialRoute = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('@moodly_onboarding_completed');

      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/login');
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Failed to check initial route:', error);
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return null;
};

export default IndexRedirect;
