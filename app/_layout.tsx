import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthContext, AuthProvider } from '@/src/contexts/AuthContext';
import { ToastProvider } from '@/src/contexts/ToastContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
  initialRouteName: 'auth',
};

function RootLayoutNav() {
  const { isAuthenticated, isInitializing } = useContext(AuthContext)!;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/(auth)/auth');
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitializing, segments, router]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
