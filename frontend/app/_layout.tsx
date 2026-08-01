import { ErrorBoundary as ExpoRouterErrorBoundary, Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { ProfileProvider, useProfile } from '@/src/profile-context';
import { PreferencesProvider } from '@/src/preferences-context';
import { AudioProvider } from '@/src/audio-context';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { GlobalNavigationDock, GLOBAL_DOCK_HEIGHT } from '@/src/components/navigation/GlobalNavigationDock';
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

function AppShell() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { profile, loading } = useProfile();
  const hideDock = pathname === '/'
    || pathname.startsWith('/onboarding')
    || pathname.startsWith('/faction-select');
  const showDock = Boolean(profile) && !loading && !hideDock;
  const dockSpace = GLOBAL_DOCK_HEIGHT + Math.max(insets.bottom, 7) + 7;

  return (
    <View style={styles.shell}>
      <View style={[styles.navigator, showDock && { paddingBottom: dockSpace }]}>
        <RootNavigator />
      </View>
      {showDock ? <GlobalNavigationDock /> : null}
    </View>
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
              <AppShell />
            </ProfileProvider>
          </AudioProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.surface },
  navigator: { flex: 1 },
});
