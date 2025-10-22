import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@context/authcontext';

const DashboardRouter: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.account_type === 'manager') {
        router.replace('/manager-dashboard');
      } else {
        router.replace('/employee-dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
};

export default DashboardRouter;
