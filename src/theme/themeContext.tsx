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
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  primary: '#20603D',
  primaryLight: '#2D8653',
  primaryDark: '#164a2e',
  secondary: '#FAD201',
  
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.5)',
  
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  tabActive: '#20603D',
  tabInactive: '#999999',
  
  inputBg: '#F5F5F5',
  inputBorder: '#E0E0E0',
  inputText: '#1A1A1A',
  placeholder: '#999999',
  
  badgeBg: '#F5F5F5',
  badgeText: '#1A1A1A',
  
  xpOrange: '#FF6B35',
  heartRed: '#FF5252',
  starYellow: '#FFD700',
  green: '#20603D',
  blue: '#2196F3',
};

const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',
  
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#707070',
  
  primary: '#4CAF50',
  primaryLight: '#66BB6A',
  primaryDark: '#388E3C',
  secondary: '#FAD201',
  
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFA726',
  info: '#42A5F5',
  
  border: '#3D3D3D',
  divider: '#2D2D2D',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.7)',
  
  tabBar: '#1E1E1E',
  tabBarBorder: '#3D3D3D',
  tabActive: '#4CAF50',
  tabInactive: '#707070',
  
  inputBg: '#2D2D2D',
  inputBorder: '#3D3D3D',
  inputText: '#FFFFFF',
  placeholder: '#707070',
  
  badgeBg: '#3D3D3D',
  badgeText: '#FFFFFF',
  
  xpOrange: '#FF8A65',
  heartRed: '#EF5350',
  starYellow: '#FFD54F',
  green: '#4CAF50',
  blue: '#42A5F5',
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
