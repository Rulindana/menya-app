import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/themeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import { PermissionsScreen, shouldShowPermissions } from './src/screens/PermissionsScreen';

const AppContent = () => {
  const loadFromStorage = useAppStore((s) => s.loadFromStorage);
  const { isDark } = useTheme();
  const [showPermissions, setShowPermissions] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadFromStorage();
      const needsPermissions = await shouldShowPermissions();
      setShowPermissions(needsPermissions);
    };
    init();
  }, []);

  // Still loading
  if (showPermissions === null) return null;

  // First launch — show permissions screen
  if (showPermissions) {
    return (
      <>
        <StatusBar style="light" />
        <PermissionsScreen onDone={() => setShowPermissions(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
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
