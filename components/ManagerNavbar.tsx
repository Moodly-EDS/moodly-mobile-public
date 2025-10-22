import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';
import { BlurView } from 'expo-blur';

type ManagerNavItem = 'dashboard' | 'logout';

interface ManagerNavbarProps {
    activeTab?: ManagerNavItem;
}

export const ManagerNavbar: React.FC<ManagerNavbarProps> = ({ activeTab = 'dashboard' }) => {
    const router = useRouter();
    const { logout } = useAuth();

    const currentTab = activeTab || 'dashboard';

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={15} tint="light" style={styles.blurContainer}>
                <View className="flex-row items-center justify-around py-1 px-2">
                    <TouchableOpacity
                        onPress={() => router.push('/dashboard')}
                        className="items-center py-2 px-3"
                        style={[
                            styles.tabButton,
                            currentTab === 'dashboard' && styles.activeTabButton
                        ]}>
                        <View style={[
                            styles.iconContainer,
                            currentTab === 'dashboard' && styles.activeIconContainer
                        ]}>
                            <Ionicons
                                name={currentTab === 'dashboard' ? 'stats-chart' : 'stats-chart-outline'}
                                size={15}
                                color={currentTab === 'dashboard' ? '#ffffff' : '#64748b'}
                            />
                        </View>
                        <Text
                            className={`mt-1.5 text-xs ${currentTab === 'dashboard'
                                ? 'font-inter-semibold text-blue-600'
                                : 'font-inter-medium text-slate-500'
                                }`}>
                            Dashboard
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="items-center py-2 px-3"
                        style={styles.tabButton}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="log-out-outline" size={15} color="#64748b" />
                        </View>
                        <Text className="mt-1.5 font-inter-medium text-xs text-slate-500">Sign out</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        borderRadius: 32,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    blurContainer: {
        borderRadius: 32,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
    },
    tabButton: {
        borderRadius: 20,
        minWidth: 30,
    },
    activeTabButton: {
        transform: [{ scale: 1.08 }],
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(100, 116, 139, 0.06)',
    },
    activeIconContainer: {
        backgroundColor: '#2563eb',
        ...Platform.select({
            ios: {
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
});
