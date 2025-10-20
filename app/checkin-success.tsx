import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
            {/* Success Icon */}
            <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>

            {/* Success Message */}
            <Text className="mb-2 text-center font-inter-bold text-2xl text-slate-900">
                Already submitted today
            </Text>

            <Text className="mb-8 text-center font-inter-regular text-base leading-6 text-slate-600">
                Your response has been recorded anonymously. Thank you for checking in.
            </Text>

            {/* Action Button */}
            <TouchableOpacity
                onPress={handleAnotherCheckIn}
                className="w-full rounded-full border-2 border-slate-300 bg-white py-4 px-8">
                <Text className="text-center font-inter-semibold text-base text-slate-900">
                    Submit another check-in
                </Text>
            </TouchableOpacity>

            {/* Secondary Action */}
            <TouchableOpacity
                onPress={handleViewHistory}
                className="mt-6">
                <Text className="text-center font-inter-medium text-base text-blue-600">
                    View your history
                </Text>
            </TouchableOpacity>

            {/* Bottom Navigation */}
            <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around border-t border-slate-200 py-4 bg-white">
                <TouchableOpacity
                    onPress={() => router.push('/dashboard')}
                    className="items-center py-2 px-4">
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
                    onPress={() => router.push('/profile')}
                    className="items-center py-2 px-4">
                    <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
                    <Text className="mt-1 font-inter-regular text-xs text-slate-500">Sign out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CheckInSuccessScreen;
