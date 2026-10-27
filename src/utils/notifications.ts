import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { savePushTokenToFirestore } from '../firebase/syncService';

type NotificationsApi = typeof import('expo-notifications');

const NOTIF_KEY = 'menya_notifications_enabled';
const NOTIF_HOUR_KEY = 'menya_notification_hour';
const PUSH_TOKEN_KEY = 'menya_push_token';
const CHANNEL_ID = 'menya-reminders';

let notificationsModule: NotificationsApi | null | undefined;

// Expo Go on Android omits the notification topic-subscription native module,
// and expo-notifications imports it eagerly. Loading the package there crashes
// the whole app, so reminders are only enabled in development/production builds.
export const areNotificationsAvailable = (): boolean =>
  Platform.OS !== 'web' && !(Platform.OS === 'android' && isRunningInExpoGo());

const getNotifications = (): NotificationsApi | null => {
  if (notificationsModule !== undefined) return notificationsModule;
  if (!areNotificationsAvailable()) {
    notificationsModule = null;
    return null;
  }
  try {
    notificationsModule = require('expo-notifications') as NotificationsApi;
  } catch (error) {
    console.log('expo-notifications unavailable:', error);
    notificationsModule = null;
  }
  return notificationsModule;
};

export const setupNotificationHandler = (): void => {
  const Notifications = getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

const ensureAndroidChannel = async (): Promise<void> => {
  const Notifications = getNotifications();
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Menya reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0B6E84',
    sound: 'default',
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    await ensureAndroidChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
};

export const registerForPushNotifications = async (uid?: string | null): Promise<string | null> => {
  if (!Device.isDevice) return null;
  const Notifications = getNotifications();
  if (!Notifications) return null;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;
    if (!projectId) return null;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    if (uid) {
      await savePushTokenToFirestore(uid, token);
    }
    return token;
  } catch (error) {
    // Remote push needs FCM credentials in the native build. Local reminders
    // still work if token registration is unavailable.
    console.log('Push token registration unavailable:', error);
    return null;
  }
};

export const scheduleStreakReminder = async (hour: number = 20): Promise<void> => {
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Menya — Kwiga Ikinyarwanda!',
        body: 'Ubu ni igihe cyo kwiga! Komeza umurongo wawe.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
    await AsyncStorage.setItem(NOTIF_KEY, 'true');
    await AsyncStorage.setItem(NOTIF_HOUR_KEY, String(hour));
  } catch (error) {
    console.log('Notification schedule error:', error);
  }
};

export const enableNotifications = async (
  uid?: string | null,
  hour: number = 20,
): Promise<{ enabled: boolean; token: string | null }> => {
  if (!getNotifications()) return { enabled: false, token: null };

  const granted = await requestNotificationPermission();
  if (!granted) return { enabled: false, token: null };

  await scheduleStreakReminder(hour);
  const token = await registerForPushNotifications(uid);
  return { enabled: true, token };
};

export const cancelNotifications = async (): Promise<void> => {
  const Notifications = getNotifications();
  try {
    if (Notifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    await AsyncStorage.setItem(NOTIF_KEY, 'false');
  } catch {
    // Ignore cancellation failures; the user can retry from Profile.
  }
};

export const getNotificationSettings = async (): Promise<{ enabled: boolean; hour: number }> => {
  try {
    const enabled = await AsyncStorage.getItem(NOTIF_KEY);
    const hour = await AsyncStorage.getItem(NOTIF_HOUR_KEY);
    return {
      enabled: enabled === 'true' && areNotificationsAvailable(),
      hour: hour ? parseInt(hour, 10) : 20,
    };
  } catch {
    return { enabled: false, hour: 20 };
  }
};

export const getStoredPushToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
};
