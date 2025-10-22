import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';
import { useToast } from '@context/toastcontext';

type UserRole = 'employee' | 'manager';

const RegisterScreen: React.FC = () => {
    const router = useRouter();
    const { register } = useAuth();
    const { showError, showSuccess } = useToast();
    const [role, setRole] = useState<UserRole>('employee');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {

        if (!username || !email || !password || !confirmPassword) {
            const errorMsg = 'Please fill in all fields';
            showError(errorMsg);
            return;
        }

        if (password !== confirmPassword) {
            const errorMsg = 'Passwords do not match';
            showError(errorMsg);
            return;
        }

        if (password.length < 6) {
            const errorMsg = 'Password must be at least 6 characters';
            showError(errorMsg);
            return;
        }

        setIsLoading(true);

        try {
            await register(username, email, password, role);
            showSuccess('Account created successfully! Welcome to Moodly!');
            router.replace('/dashboard');
        } catch (err: any) {
            const errorMsg = err.message || 'Registration failed. Please try again.';
            showError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white">
            <ScrollView contentContainerClassName="flex-1">
                <View className="flex-1 items-center justify-center px-6 py-12">
                    <View className="mb-8 items-center mt-4">
                        <View className="mb-4 flex-row items-center">
                            <Image source={require('../assets/images/logo.png')} className="w-8 h-6" />
                            <Text className="ml-3 font-inter-bold text-3xl text-slate-900">Moodly</Text>
                        </View>
                        <Text className="mb-2 font-inter-bold text-2xl text-slate-900">
                            Create your account
                        </Text>
                        <Text className="font-inter-regular text-base text-slate-600">
                            Join your team on Moodly
                        </Text>
                    </View>

                    <View className="mb-6 w-full">
                        <Text className="mb-3 font-inter-semibold text-sm text-slate-700">I am a</Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => setRole('employee')}
                                className={`mr-3 flex-1 items-center rounded-2xl border-2 p-4 ${role === 'employee' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
                                    }`}>
                                <Ionicons
                                    name="person-outline"
                                    size={32}
                                    color={role === 'employee' ? '#2563eb' : '#64748b'}
                                />
                                <Text
                                    className={`mt-2 font-inter-semibold text-sm ${role === 'employee' ? 'text-blue-600' : 'text-slate-700'
                                        }`}>
                                    Employee
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRole('manager')}
                                className={`ml-3 flex-1 items-center rounded-2xl border-2 p-4 ${role === 'manager' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
                                    }`}>
                                <Ionicons
                                    name="people-outline"
                                    size={32}
                                    color={role === 'manager' ? '#2563eb' : '#64748b'}
                                />
                                <Text
                                    className={`mt-2 font-inter-semibold text-sm ${role === 'manager' ? 'text-blue-600' : 'text-slate-700'
                                        }`}>
                                    Manager
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-4 w-full">
                        <Text className="mb-2 font-inter-medium text-sm text-slate-700">Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="johndoe"
                            autoCapitalize="none"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-inter-regular text-base text-slate-900"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="mb-4 w-full">
                        <Text className="mb-2 font-inter-medium text-sm text-slate-700">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-inter-regular text-base text-slate-900"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="mb-4 w-full">
                        <Text className="mb-2 font-inter-medium text-sm text-slate-700">Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            autoCapitalize="none"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-inter-regular text-base text-slate-900"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="mb-6 w-full">
                        <Text className="mb-2 font-inter-medium text-sm text-slate-700">Confirm Password</Text>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            autoCapitalize="none"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-inter-regular text-base text-slate-900"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={isLoading}
                        className={`mb-4 w-full rounded-full py-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-600'
                            }`}>
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-center font-inter-semibold text-base text-white">
                                Sign up
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} className="mb-4 w-full">
                        <Text className="text-center font-inter-medium text-sm text-slate-600">
                            Already have an account? <Text className="text-blue-600">Sign in</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/onboarding')}
                        className="mt-2 flex-row items-center">
                        <Ionicons name="arrow-back" size={16} color="#64748b" />
                        <Text className="ml-2 font-inter-medium text-sm text-slate-600">Back to home</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;
