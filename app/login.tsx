import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';

type UserRole = 'employee' | 'manager';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login();
    router.replace('/dashboard');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-12 items-center">
            <View className="mb-6 flex-row items-center">
              <Ionicons name="people" size={40} color="#2563eb" />
              <Text className="ml-3 font-inter-bold text-3xl text-slate-900">Moodly</Text>
            </View>
            <Text className="mb-2 font-inter-bold text-2xl text-slate-900">
              Sign in to Moodly
            </Text>
            <Text className="font-inter-regular text-base text-slate-600">
              Select your role and enter credentials
            </Text>
          </View>
          <View className="mb-8 w-full">
            <Text className="mb-3 font-inter-semibold text-sm text-slate-700">Sign in as</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setRole('employee')}
                className={`mr-3 flex-1 items-center rounded-2xl border-2 p-4 ${role === 'employee' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}>
                <Ionicons name="person-outline" size={32} color={role === 'employee' ? '#2563eb' : '#64748b'} />
                <Text className={`mt-2 font-inter-semibold text-sm ${role === 'employee' ? 'text-blue-600' : 'text-slate-700'}`}>
                  Employee
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('manager')}
                className={`ml-3 flex-1 items-center rounded-2xl border-2 p-4 ${role === 'manager' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}>
                <Ionicons name="people-outline" size={32} color={role === 'manager' ? '#2563eb' : '#64748b'} />
                <Text className={`mt-2 font-inter-semibold text-sm ${role === 'manager' ? 'text-blue-600' : 'text-slate-700'}`}>
                  Manager
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="mt-2 text-center font-inter-regular text-xs text-slate-500">
              Share mood check-ins
            </Text>
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
          <View className="mb-2 w-full">
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
          <TouchableOpacity className="mb-8 w-full">
            <Text className="text-right font-inter-medium text-sm text-blue-600">
              Forgot password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogin} className="mb-6 w-full rounded-full bg-blue-600 py-4">
            <Text className="text-center font-inter-semibold text-base text-white">Sign in</Text>
          </TouchableOpacity>
          <View className="rounded-xl bg-slate-50 p-4">
            <Text className="text-center font-inter-regular text-xs text-slate-600">
              Demo mode: Use any email/password to continue
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/onboarding')} className="mt-6 flex-row items-center">
            <Ionicons name="arrow-back" size={16} color="#64748b" />
            <Text className="ml-2 font-inter-medium text-sm text-slate-600">Back to home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
