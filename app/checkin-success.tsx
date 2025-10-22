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
        <View className="flex-1 bg-white items-center justify-center px-6">
            <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>

            <Text className="mb-2 text-center font-inter-bold text-2xl text-slate-900">
                Check-in submitted!
            </Text>

            <Text className="mb-8 text-center font-inter-regular text-base leading-6 text-slate-600">
                Your response has been recorded anonymously. Feel free to check in again anytime today.
            </Text>

            <TouchableOpacity
                onPress={handleAnotherCheckIn}
                className="w-full rounded-full border-2 border-slate-300 bg-white py-4 px-8">
                <Text className="text-center font-inter-semibold text-base text-slate-900">
                    Submit another check-in
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleViewHistory}
                className="mt-6">
                <Text className="text-center font-inter-medium text-base text-blue-600">
                    View your history
                </Text>
            </TouchableOpacity>

            <BottomNavbar activeTab="dashboard" />
        </View>
    );
};

export default CheckInSuccessScreen;
