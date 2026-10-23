import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from '../components/ui/AppText';
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
import { PracticeScreen } from '../screens/PracticeScreen';
import { WelcomeScreen, EmailAuthScreen } from '../screens/AuthScreens';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const TabIcon: React.FC<{ icon: string; color: string; focused: boolean; label: string }> = ({
  icon,
  color,
  focused,
  label,
}) => (
  <View style={tabStyles.tabItem}>
    <View style={[tabStyles.iconPill, focused && { backgroundColor: color + '14' }]}>
      <AppIcon name={icon} size={21} color={color} strokeWidth={focused ? 2.4 : 1.9} />
    </View>
    <Text style={[tabStyles.tabLabel, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          elevation: 0,
          shadowColor: '#14212B',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
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
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="home" color={color} focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="StoriesTab"
        component={StoriesScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="bookOpen" color={color} focused={focused} label="Stories" />
          ),
        }}
      />
      <Tab.Screen
        name="GameTab"
        component={GameScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="gamepad" color={color} focused={focused} label="Game" />
          ),
        }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="trophy" color={color} focused={focused} label="Ranks" />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="user" color={color} focused={focused} label="Profile" />
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
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
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
    <Stack.Screen
      name="Practice"
      component={PracticeScreen as any}
      options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
    />
  </Stack.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="EmailAuth" component={EmailAuthScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => {
  const isLoggedIn = useAppStore((s) => s.user.isLoggedIn);
  const onboardingCompleted = useAppStore((s) => s.user.onboardingCompleted);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  if (isLoggedIn && !onboardingCompleted) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
