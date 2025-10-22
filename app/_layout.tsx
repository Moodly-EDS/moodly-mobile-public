import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '@context/themecontext';
import { AuthProvider } from '@context/authcontext';
import { MoodProvider } from '@context/moodcontext';
import { ToastProvider } from '@context/toastcontext';

import '../global.css';

import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
        <Text>Chargement des polices...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <MoodProvider>
          <ToastProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_right',
              }}
            />
          </ToastProvider>
        </MoodProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
