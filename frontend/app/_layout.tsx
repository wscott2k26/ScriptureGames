import { ErrorBoundary as ExpoRouterErrorBoundary, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { ProfileProvider } from '@/src/profile-context';
import { PreferencesProvider } from '@/src/preferences-context';
import { AudioProvider } from '@/src/audio-context';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { colors } from '@/src/theme';

export const ErrorBoundary = ExpoRouterErrorBoundary;

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const reducedMotion = useReducedMotionPreference();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reducedMotion ? 'none' : 'fade_from_bottom',
        contentStyle: { backgroundColor: colors.surface },
        gestureEnabled: true,
      }}
    />
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={styles.shell}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <AudioProvider>
            <ProfileProvider>
              <RootNavigator />
            </ProfileProvider>
          </AudioProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.surface },
});
