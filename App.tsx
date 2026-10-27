import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_500Medium_Italic,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_600SemiBold_Italic,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_700Bold_Italic,
  PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_800ExtraBold_Italic,
} from '@expo-google-fonts/plus-jakarta-sans';
import { ThemeProvider, useTheme } from './src/theme/themeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import { useHeartRegen } from './src/hooks/useHeartRegen';
import { useAppUpdate } from './src/hooks/useAppUpdate';
import { UpdateModal } from './src/components/UpdateModal';
import { setupNotificationHandler } from './src/utils/notifications';
import { PermissionsScreen, shouldShowPermissions } from './src/screens/PermissionsScreen';

const AppContent = () => {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_400Regular_Italic,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_500Medium_Italic,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_600SemiBold_Italic,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_700Bold_Italic,
    PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_800ExtraBold_Italic,
  });
  const loadFromStorage = useAppStore((s) => s.loadFromStorage);
  const isLoggedIn = useAppStore((s) => s.user.isLoggedIn);
  const onboardingCompleted = useAppStore((s) => s.user.onboardingCompleted);
  const { isDark } = useTheme();
  const [needsPermissions, setNeedsPermissions] = useState<boolean | null>(null);
  const { update, openUpdate, dismissUpdate } = useAppUpdate();

  useHeartRegen();

  useEffect(() => {
    setupNotificationHandler();
    const init = async () => {
      await loadFromStorage();
      setNeedsPermissions(await shouldShowPermissions());
    };
    init();
  }, []);

  // Wait for the font set and stored session before showing anything.
  if ((!fontsLoaded && !fontError) || needsPermissions === null) return null;

  const permissionsRequired = isLoggedIn && onboardingCompleted && needsPermissions;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {permissionsRequired ? (
        <PermissionsScreen onDone={() => setNeedsPermissions(false)} />
      ) : (
        <AppNavigator />
      )}
      <UpdateModal update={update} onUpdate={openUpdate} onLater={dismissUpdate} />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
