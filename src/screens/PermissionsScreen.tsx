import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Camera from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'camera',
      icon: '📷',
      title: 'Camera',
      description: 'Take your profile photo for your certificate and scan QR codes',
      required: true,
      status: 'pending',
    },
    {
      id: 'media',
      icon: '🖼️',
      title: 'Photo Library',
      description: 'Choose a profile photo from your gallery and save your certificate PDF',
      required: true,
      status: 'pending',
    },
    {
      id: 'microphone',
      icon: '🎤',
      title: 'Microphone',
      description: 'Used for speech exercises to practice Kinyarwanda pronunciation',
      required: false,
      status: 'pending',
    },
  ]);

  const [requesting, setRequesting] = useState(false);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const updateStatus = (id: string, status: 'granted' | 'denied') => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const requestAll = async () => {
    setRequesting(true);

    // 1. Camera — check current status first; if already granted in settings
    //    Android will block a re-request and return 'denied', so we must
    //    call getCameraPermissionsAsync() before requestCameraPermissionsAsync().
    try {
      let camStatus = (await Camera.getCameraPermissionsAsync()).status;
      if (camStatus !== 'granted') {
        const result = await Camera.requestCameraPermissionsAsync();
        camStatus = result.status;
      }
      updateStatus('camera', camStatus === 'granted' ? 'granted' : 'denied');
    } catch { updateStatus('camera', 'denied'); }

    // 2. Media Library — same pattern
    try {
      let mediaStatus = (await MediaLibrary.getPermissionsAsync()).status;
      if (mediaStatus !== 'granted') {
        const result = await MediaLibrary.requestPermissionsAsync();
        mediaStatus = result.status;
      }
      updateStatus('media', mediaStatus === 'granted' ? 'granted' : 'denied');
    } catch { updateStatus('media', 'denied'); }

    // 3. Microphone — same pattern
    try {
      let micStatus = (await ImagePicker.getCameraPermissionsAsync()).status;
      if (micStatus !== 'granted') {
        const result = await ImagePicker.requestCameraPermissionsAsync();
        micStatus = result.status;
      }
      updateStatus('microphone', micStatus === 'granted' ? 'granted' : 'denied');
    } catch { updateStatus('microphone', 'denied'); }

    setRequesting(false);
    setAllDone(true);
  };

  const handleContinue = async () => {
    if (!requiredGranted) {
      // Re-check + re-request
      setAllDone(false);
      await requestAll();
      return;
    }
    await AsyncStorage.setItem(PERMISSIONS_DONE_KEY, 'true');
    onDone();
  };

  const handleSkip = async () => {
    // Allow user to continue without granting permissions — they can grant later
    await AsyncStorage.setItem(PERMISSIONS_DONE_KEY, 'true');
    onDone();
  };

  const requiredGranted = permissions
    .filter(p => p.required)
    .every(p => p.status === 'granted');

  return (
    <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.bg}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>🦍</Text>
          <Text style={styles.title}>Menya needs a few permissions</Text>
          <Text style={styles.subtitle}>
            To give you the best learning experience, please allow the following:
          </Text>
        </View>

        {/* Permission items */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {permissions.map((perm) => (
            <View
              key={perm.id}
              style={[
                styles.permItem,
                perm.status === 'granted' && styles.permGranted,
                perm.status === 'denied' && styles.permDenied,
              ]}
            >
              <Text style={styles.permIcon}>{perm.icon}</Text>
              <View style={styles.permText}>
                <View style={styles.permTitleRow}>
                  <Text style={styles.permTitle}>{perm.title}</Text>
                  {perm.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.permDesc}>{perm.description}</Text>
              </View>
              <Text style={styles.permStatus}>
                {perm.status === 'granted' ? '✅' : perm.status === 'denied' ? '❌' : '⏳'}
              </Text>
            </View>
          ))}

          {/* Denied note */}
          {allDone && !requiredGranted && (
            <View style={styles.deniedNote}>
              <Text style={styles.deniedNoteText}>
                ⚠️ Some required permissions were denied. You can enable them in your phone Settings → Apps → Menya → Permissions.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Buttons */}
        <View style={styles.footer}>
          {!allDone ? (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, requesting && styles.btnDisabled]}
                onPress={requestAll}
                disabled={requesting}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>
                  {requesting ? 'Requesting...' : '🔓 Allow Permissions'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.btnTextSecondary}>Skip for now →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>
                  {requiredGranted ? '✅ Continue to Menya →' : '⚠️ Try Again'}
                </Text>
              </TouchableOpacity>
              {!requiredGranted && (
                <>
                  <Text style={styles.mandatoryNote}>
                    Camera and Photo Library permissions are required for full functionality. You can also grant them later in Settings.
                  </Text>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnTextSecondary}>Skip for now →</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

// ── Helper to check if permissions screen has been shown ──
export const shouldShowPermissions = async (): Promise<boolean> => {
  try {
    const done = await AsyncStorage.getItem(PERMISSIONS_DONE_KEY);
    return done !== 'true';
  } catch {
    return false;
  }
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 70, paddingBottom: 30 },

  header: { alignItems: 'center', marginBottom: 32 },
  appIcon: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 21,
  },

  list: { flex: 1 },

  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  permGranted: {
    backgroundColor: 'rgba(32,96,61,0.25)',
    borderColor: '#20603D',
  },
  permDenied: {
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderColor: '#E74C3C',
  },
  permIcon: { fontSize: 28 },
  permText: { flex: 1 },
  permTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  permTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  requiredBadge: {
    backgroundColor: '#FFD70033',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: { fontSize: 9, color: '#FFD700', fontWeight: '700' },
  permDesc: { fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 17 },
  permStatus: { fontSize: 22 },

  deniedNote: {
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E74C3C44',
  },
  deniedNoteText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },

  footer: { gap: 10, paddingTop: 16 },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#20603D' },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  btnTextSecondary: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  mandatoryNote: {
    color: '#FFD700',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
