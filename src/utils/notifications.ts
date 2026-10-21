import AsyncStorage from '@react-native-async-storage/async-storage';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch { /* not available */ }

const NOTIF_KEY = 'menya_notifications_enabled';
const NOTIF_HOUR_KEY = 'menya_notification_hour';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch { return false; }
};

export const scheduleStreakReminder = async (hour: number = 20): Promise<void> => {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🦍 Menya — Kwiga Ikinyarwanda!',
        body: 'Ubu ni igihe cyo kwiga! Komeza umurongo wawe 🔥',
        sound: true,
      },
      trigger: {
        hour,
        minute: 0,
        repeats: true,
      },
    });
    await AsyncStorage.setItem(NOTIF_KEY, 'true');
    await AsyncStorage.setItem(NOTIF_HOUR_KEY, String(hour));
  } catch (e) {
    console.log('Notification schedule error:', e);
  }
};

export const cancelNotifications = async (): Promise<void> => {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(NOTIF_KEY, 'false');
  } catch { /* ignore */ }
};

export const getNotificationSettings = async (): Promise<{ enabled: boolean; hour: number }> => {
  try {
    const enabled = await AsyncStorage.getItem(NOTIF_KEY);
    const hour = await AsyncStorage.getItem(NOTIF_HOUR_KEY);
    return {
      enabled: enabled === 'true',
      hour: hour ? parseInt(hour) : 20,
    };
  } catch {
    return { enabled: false, hour: 20 };
  }
};

export const setupNotificationHandler = (): void => {
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch { /* ignore */ }
};
