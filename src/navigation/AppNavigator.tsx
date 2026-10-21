import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppIcon } from '../components/ui/AppIcon';

import { HomeScreen } from '../screens/HomeScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { CertificateScreen } from '../screens/CertificateScreen';
import { ThemeSettings } from '../screens/ThemeSettings';
import { GameScreen } from '../screens/GameScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { StoriesScreen } from '../screens/StoriesScreen';
import { DailyChallengeScreen } from '../screens/DailyChallengeScreen';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const TabIcon: React.FC<{ emoji: string; color: string; focused: boolean; label: string }> = ({
  emoji,
  color,
  focused,
  label,
}) => (
  <View style={tabStyles.tabItem}>
    <View style={[tabStyles.iconPill, focused && { backgroundColor: color + '18' }]}>
      <Text style={tabStyles.tabEmoji}>{emoji}</Text>
    </View>
    <Text style={[tabStyles.tabLabel, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const MainTabs = () => {
  const { colors } = useTheme();
  const { progress } = useAppStore();

  // Dynamic gorilla state based on streak/activity
  const getGorillaState = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const hour = new Date().getHours();
    const lastActive = progress.lastActiveDate;
    if (lastActive === today) {
      // Studied today — fresh green
      return { emoji: '🦍', color: '#20603D', label: '😊 Course' };
    }
    if (lastActive !== yesterday) {
      // Missed 2+ days — red/angry
      return { emoji: '🦍', color: '#E74C3C', label: '😡 Learn!' };
    }
    // Active yesterday, not yet today
    if (hour >= 18) {
      // Evening — sad orange
      return { emoji: '🦍', color: '#FF9800', label: '😢 Study!' };
    }
    return { emoji: '🦍', color: '#20603D', label: '📚 Course' };
  };

  const gorilla = getGorillaState();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.tabItem}>
              <View style={[tabStyles.iconPill, focused && { backgroundColor: gorilla.color + '22' }]}>
                <Text style={tabStyles.tabEmoji}>{gorilla.emoji}</Text>
              </View>
              <Text style={[tabStyles.tabLabel, { color: focused ? gorilla.color : colors.tabInactive }]} numberOfLines={1}>
                {gorilla.label}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="StoriesTab"
        component={StoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" color={focused ? '#7B1FA2' : colors.tabInactive} focused={focused} label="Stories" />
          ),
        }}
      />
      <Tab.Screen
        name="GameTab"
        component={GameScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎮" color={focused ? colors.xpOrange : colors.tabInactive} focused={focused} label="Game" />
          ),
        }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" color={focused ? colors.secondary : colors.tabInactive} focused={focused} label="Ranks" />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" color={focused ? colors.tabActive : colors.tabInactive} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 30,
    borderRadius: 15,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  tabEmoji: {
    fontSize: 22,
  },
});

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen
      name="Lesson"
      component={LessonScreen as any}
      options={{ gestureEnabled: false, animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="Certificate"
      component={CertificateScreen}
      options={{ animation: 'fade' }}
    />
    <Stack.Screen
      name="ThemeSettings"
      component={ThemeSettings}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
    />
    <Stack.Screen
      name="DailyChallenge"
      component={DailyChallengeScreen}
      options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
    />
  </Stack.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => {
  const isLoggedIn = useAppStore((s) => s.user.isLoggedIn);
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
