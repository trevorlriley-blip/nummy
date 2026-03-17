import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders } from '../src/contexts/AppProviders';
import { useUser } from '../src/contexts/UserContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useThemeMode } from '../src/contexts/ThemeContext';

LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const { user, isProfileLoaded } = useUser();
  const { isDark } = useThemeMode();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading && isProfileLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading, isProfileLoaded]);

  useEffect(() => {
    if (isLoading || !isProfileLoaded) return;

    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      // Not logged in — must be on auth screens
      if (!inAuth) {
        router.replace('/auth/login');
      }
    } else if (!user.onboardingComplete) {
      // Logged in but hasn't completed onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // Logged in + onboarding complete — go to main app
      if (inAuth || inOnboarding) {
        router.replace('/');
      }
    }
  }, [session, user.onboardingComplete, segments, isLoading, isProfileLoaded]);

  // Render nothing while loading — splash screen covers the blank
  if (isLoading || !isProfileLoaded) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipe"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="feedback"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="preview/index"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen
          name="wizard"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen
          name="agent"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
