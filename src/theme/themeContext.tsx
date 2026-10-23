import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  // Core colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // UI colors
  border: string;
  divider: string;
  shadow: string;
  overlay: string;
  
  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  
  // Input
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  
  // Badge
  badgeBg: string;
  badgeText: string;
  
  // Specific
  xpOrange: string;
  heartRed: string;
  starYellow: string;
  green: string;
  blue: string;
}

const lightTheme: ThemeColors = {
  background: '#F4F7F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#14212B',
  textSecondary: '#536471',
  textMuted: '#83919D',

  primary: '#0B6E84',
  primaryLight: '#D9EEF3',
  primaryDark: '#085468',
  secondary: '#D9A441',

  success: '#2F9E6E',
  error: '#D64545',
  warning: '#C9891C',
  info: '#2B6CB0',

  border: '#DCE5EA',
  divider: '#E8EEF2',
  shadow: 'rgba(20,33,43,0.08)',
  overlay: 'rgba(12,28,36,0.45)',

  tabBar: '#FFFFFF',
  tabBarBorder: '#DCE5EA',
  tabActive: '#0B6E84',
  tabInactive: '#8A99A5',

  inputBg: '#F7FAFB',
  inputBorder: '#DCE5EA',
  inputText: '#14212B',
  placeholder: '#93A1AC',

  badgeBg: '#EAF2F5',
  badgeText: '#0B6E84',

  xpOrange: '#C9891C',
  heartRed: '#D64545',
  starYellow: '#D9A441',
  green: '#2F9E6E',
  blue: '#2B6CB0',
};

const darkTheme: ThemeColors = {
  background: '#0E171D',
  surface: '#16232B',
  card: '#1B2B34',

  text: '#F2F6F8',
  textSecondary: '#A9B8C2',
  textMuted: '#758591',

  primary: '#4FB6C8',
  primaryLight: '#123A44',
  primaryDark: '#2E8FA3',
  secondary: '#D9A441',

  success: '#4CC38A',
  error: '#F07171',
  warning: '#E0A84A',
  info: '#6CA9E0',

  border: '#2A3B45',
  divider: '#22323B',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.65)',

  tabBar: '#16232B',
  tabBarBorder: '#2A3B45',
  tabActive: '#4FB6C8',
  tabInactive: '#758591',

  inputBg: '#1B2B34',
  inputBorder: '#2A3B45',
  inputText: '#F2F6F8',
  placeholder: '#758591',

  badgeBg: '#22323B',
  badgeText: '#F2F6F8',

  xpOrange: '#E0A84A',
  heartRed: '#F07171',
  starYellow: '#D9A441',
  green: '#4CC38A',
  blue: '#6CA9E0',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
  isDark: false,
  themeMode: 'auto',
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Update isDark based on themeMode and system scheme
  useEffect(() => {
    if (themeMode === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const saved = await AsyncStorage.getItem('menya_theme_mode');
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        setThemeModeState(saved);
      }
    } catch (e) {
      console.log('Error loading theme:', e);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('menya_theme_mode', mode);
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
