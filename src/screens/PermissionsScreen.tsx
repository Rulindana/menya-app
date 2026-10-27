import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppIcon } from '../components/ui/AppIcon';
import { MenyaMascot } from '../components/MenyaMascot';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/themeContext';
import {
  areNotificationsAvailable,
  registerForPushNotifications,
  requestNotificationPermission,
  scheduleStreakReminder,
} from '../utils/notifications';

const PERMISSIONS_DONE_KEY = 'menya_permissions_granted';

interface PermissionItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'granted' | 'denied';
}

interface Props {
  onDone: () => void;
}

export const PermissionsScreen: React.FC<Props> = ({ onDone }) => {
  const uid = useAppStore((state) => state.user.uid);
  const { colors, isDark } = useTheme();
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'camera',
      icon: 'camera',
      title: 'Camera',
      description: 'Scan QR codes and take a profile photo for your certificate.',
      required: true,
      status: 'pending',
    },
    {
      id: 'media',
      icon: 'image',
      title: 'Photo library',
      description: 'Choose a profile photo and save your certificate PDF.',
      required: true,
      status: 'pending',
    },
    {
      id: 'notifications',
      icon: 'bell',
      title: 'Notifications',
      description: areNotificationsAvailable()
        ? 'Daily practice reminders and important Menya updates.'
        : 'Requires a development build — not available in Expo Go.',
      required: false,
      status: 'pending',
    },
  ]);
  const [requesting, setRequesting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const updateStatus = (id: string, status: 'granted' | 'denied') => {
    setPermissions((previous) =>
      previous.map((permission) => (permission.id === id ? { ...permission, status } : permission)),
    );
  };

  const requestAll = async () => {
    setRequesting(true);
    setAttempted(false);
    try {
      let cameraStatus = (await Camera.getCameraPermissionsAsync()).status;
      if (cameraStatus !== 'granted') {
        cameraStatus = (await Camera.requestCameraPermissionsAsync()).status;
      }
      updateStatus('camera', cameraStatus === 'granted' ? 'granted' : 'denied');
    } catch {
      updateStatus('camera', 'denied');
    }

    try {
      let mediaStatus = (await MediaLibrary.getPermissionsAsync()).status;
      if (mediaStatus !== 'granted') {
        mediaStatus = (await MediaLibrary.requestPermissionsAsync()).status;
      }
      updateStatus('media', mediaStatus === 'granted' ? 'granted' : 'denied');
    } catch {
      updateStatus('media', 'denied');
    }

    if (areNotificationsAvailable()) {
      try {
        const notificationGranted = await requestNotificationPermission();
        updateStatus('notifications', notificationGranted ? 'granted' : 'denied');
        if (notificationGranted) {
          await scheduleStreakReminder(20);
          await registerForPushNotifications(uid);
        }
      } catch {
        updateStatus('notifications', 'denied');
      }
    }

    setRequesting(false);
    setAttempted(true);
  };

  const finish = async () => {
    await AsyncStorage.setItem(PERMISSIONS_DONE_KEY, 'true');
    onDone();
  };

  const requiredGranted = permissions
    .filter((permission) => permission.required)
    .every((permission) => permission.status === 'granted');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.mascotWrap, { backgroundColor: colors.primaryLight }]}>
            <MenyaMascot size={118} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>A few permissions</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Menya only asks for access when it helps you learn, scan, or save your certificate.
          </Text>
        </View>

        <View style={styles.list}>
          {permissions.map((permission) => {
            const granted = permission.status === 'granted';
            const denied = permission.status === 'denied';
            return (
              <View
                key={permission.id}
                style={[
                  styles.permissionCard,
                  {
                    backgroundColor: granted
                      ? colors.success + '15'
                      : denied
                        ? colors.error + '15'
                        : colors.card,
                    borderColor: granted
                      ? colors.success
                      : denied
                        ? colors.error
                        : colors.border,
                  },
                ]}
              >
                <View style={[styles.permissionIcon, { backgroundColor: colors.primaryLight }]}>
                  <AppIcon name={permission.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.permissionCopy}>
                  <View style={styles.permissionTitleRow}>
                    <Text style={[styles.permissionTitle, { color: colors.text }]}>
                      {permission.title}
                    </Text>
                    {!permission.required && (
                      <Text
                        style={[
                          styles.optionalLabel,
                          { color: colors.textSecondary, backgroundColor: colors.background },
                        ]}
                      >
                        Optional
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                    {permission.description}
                  </Text>
                  {granted && (
                    <Text style={[styles.grantedLabel, { color: colors.success }]}>Allowed</Text>
                  )}
                  {denied && (
                    <Text style={[styles.deniedLabel, { color: colors.error }]}>Not now</Text>
                  )}
                </View>
                {granted && <AppIcon name="checkCircle" size={22} color={colors.success} />}
              </View>
            );
          })}
        </View>

        {attempted && !requiredGranted && (
          <View style={[styles.note, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="info" size={17} color={colors.primary} />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              Camera and photo access are required for the full experience. You can
              enable any permission later in Settings → Apps → Menya → Permissions.
            </Text>
          </View>
        )}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
            requesting && styles.buttonDisabled,
          ]}
          onPress={requiredGranted ? finish : requestAll}
          disabled={requesting}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {requesting ? 'Requesting…' : requiredGranted ? 'Continue' : 'Allow access'}
          </Text>
          <AppIcon name={requiredGranted ? 'arrowRight' : 'shield'} size={19} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={finish} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export const shouldShowPermissions = async (): Promise<boolean> => {
  try {
    const done = await AsyncStorage.getItem(PERMISSIONS_DONE_KEY);
    return done !== 'true';
  } catch {
    return false;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
  },
  header: {
    alignItems: 'center',
  },
  mascotWrap: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 310,
  },
  list: {
    gap: 12,
    marginTop: 28,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  permissionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCopy: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionalLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  permissionDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  grantedLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  deniedLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
