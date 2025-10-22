import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}

const slides: OnboardingSlide[] = [
    {
        icon: 'time-outline',
        title: 'Quick check-ins',
        description: "Share how you're feeling in under 30 seconds with emoji moods and optional tags.",
    },
    {
        icon: 'shield-checkmark-outline',
        title: 'Always anonymous',
        description: 'Your individual responses are never shown to anyone. Team trends only.',
    },
    {
        icon: 'trending-up-outline',
        title: 'Team insights',
        description: 'Managers see 30-day patterns to support wellbeing, not track individuals.',
    },
];

const OnboardingScreen: React.FC = () => {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / width);
        setCurrentPage(page);
    };

    const scrollToPage = (page: number) => {
        scrollViewRef.current?.scrollTo({ x: page * width, animated: true });
        setCurrentPage(page);
    };

    const handleNext = () => {
        if (currentPage < slides.length - 1) {
            scrollToPage(currentPage + 1);
        } else {
            handleGetStarted();
        }
    };

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('@moodly_onboarding_completed', 'true');
            router.replace('/login');
        } catch (error) {
            console.error('Failed to save onboarding state:', error);
        }
    };

    const handleSkip = async () => {
        await handleGetStarted();
    };

    return (
        <View className="flex-1 bg-white">
            <View className="mt-18 items-center">
                <View className="flex-row items-center">
                    <Image source={require('../assets/images/logo.png')} className="w-8 h-6" />
                    <Text className="ml-2 font-inter-semibold text-2xl text-slate-900">Moodly</Text>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                className="flex-1">
                {slides.map((slide, index) => (
                    <View key={index} style={{ width }} className="flex-1 items-center justify-center px-8">
                        <View className="mb-8 h-32 w-32 items-center justify-center rounded-3xl bg-blue-100">
                            <Ionicons name={slide.icon} size={64} color="#2563eb" />
                        </View>

                        <Text className="mb-4 text-center font-inter-bold text-3xl text-slate-900">
                            {slide.title}
                        </Text>

                        <Text className="text-center font-inter-regular text-base leading-6 text-slate-600">
                            {slide.description}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View className="mb-8 flex-row items-center justify-center">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className={`mx-1 h-2 rounded-full ${index === currentPage ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'
                            }`}
                    />
                ))}
            </View>

            <View className="mb-12 flex-row items-center justify-between px-8">
                <TouchableOpacity onPress={handleSkip} className="py-4 px-6">
                    <Text className="font-inter-medium text-base text-slate-600">Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleNext}
                    className="flex-row items-center rounded-full bg-blue-600 py-4 px-8">
                    <Text className="mr-2 font-inter-semibold text-base text-white">
                        {currentPage === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OnboardingScreen;
