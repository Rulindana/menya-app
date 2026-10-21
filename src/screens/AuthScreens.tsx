import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { AppModal } from '../components/AppModal';
import { useAppStore } from '../store/useAppStore';
import { isFirebaseConfigured, GOOGLE_WEB_CLIENT_ID } from '../firebase/config';
import { signInWithCredential, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Try to load Google Sign-In
let GoogleSignin: any = null;
let statusCodes: any = null;
try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }
} catch (e) {
  console.log('Google Sign-In not available in Expo Go');
}

// ── Modal State Type ──
interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

const defaultModal: ModalState = {
  visible: false,
  title: '',
  message: '',
  type: 'info',
  icon: '💡',
};

// ── Friendly Firebase auth error messages (Kinyarwanda) ──
const getAuthErrorMessage = (code: string): string => {
  if (code.includes('email-already-in-use')) return 'Iyi email irakoze ifite konti. Gerageza kwinjira (Login).';
  if (code.includes('invalid-email')) return 'Email ntabwo ari yo. Yegera ukore indi.';
  if (code.includes('weak-password')) return 'Ijambo banga rirakenewe: 8+ inyuguti, injyana, umubare n\'ikimenyetso (Urugero: Mwami2026!).';
  if (code.includes('user-not-found')) return 'Nta konti ifite iyi email. Iyandikishe (Sign Up).';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Ijambo banga cyangwa email sibyo.';
  if (code.includes('too-many-requests')) return 'Ongerageza kumaze akoanya. Gerageza nyuma.';
  if (code.includes('network')) return 'Nta murandasi. Gerageza ubwo nyine.';
  return 'Byanze. Ongera ugerageze.';
};

// ── Google Sign-In Handler ──
const handleGoogleSignIn = async (
  setUser: (u: any) => void,
  setLoading: (b: boolean) => void,
  setModal: (m: ModalState) => void
) => {
  if (!isFirebaseConfigured()) {
    setModal({
      visible: true,
      title: 'Byanze',
      message: 'Serivisi ntikora ubu. Koresha email cyangwa iyandikishe.',
      type: 'error',
      icon: '⚠️',
      showCancel: false,
      confirmText: 'Sawe',
    });
    return;
  }

  if (!GoogleSignin) {
    // No Google Sign-In available (Expo Go) — require email account instead
    setModal({
      visible: true,
      title: 'Google ntibonetse',
      message: 'Koresha email na ijambo banga, cyangwa iyandikishe (Sign Up).',
      type: 'info',
      icon: '📧',
      showCancel: false,
      confirmText: 'Sawe',
    });
    return;
  }

  try {
    setLoading(true);
    // 1. Check Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // 2. Sign in — newer versions return { data: { idToken, ... } }
    //    older versions return { idToken, ... } directly
    const signInResult = await GoogleSignin.signIn();
    // Support both old API (idToken at top level) and new API (idToken inside data)
    const idToken = signInResult?.data?.idToken ?? signInResult?.idToken ?? null;
    if (!idToken) throw new Error('No idToken returned from Google');
    // 3. Exchange for a Firebase credential
    const credential = GoogleAuthProvider.credential(idToken);
    if (!firebaseAuth) throw new Error('Firebase not initialized');
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || 'Google User',
      avatar: 'gorilla',
      isLoggedIn: true,
    });
    setLoading(false);
  } catch (error: any) {
    setLoading(false);
    // User cancelled — do nothing
    if (error.code === statusCodes?.SIGN_IN_CANCELLED) return;
    // Play Services not available
    if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      setModal({
        visible: true,
        title: 'Play Services',
        message: 'Google Play Services ntiboneka kuri telefoni yawe. Koresha email.',
        type: 'error',
        icon: '⚠️',
        showCancel: false,
        confirmText: 'Sawe',
      });
      return;
    }
    // Any other error — include the real cause so problems are diagnosable
    console.log('Google Sign-In error:', error?.code, error?.message, error);
    const detail = error?.code ? ` (${error.code})` : '';
    setModal({
      visible: true,
      title: 'Byanze',
      message: `Google byanze${detail}. Koresha email na ijambo banga.`,
      type: 'error',
      icon: '⚠️',
      showCancel: false,
      confirmText: 'Sawe',
    });
  }
};

// ── Animated Sun Component ───────────────────────────────────────
const AnimatedSun: React.FC<{ opacity: Animated.Value }> = ({ opacity }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 60000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rays = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Animated.View style={[styles.sunContainer, { opacity }]}>
      <Animated.View style={[styles.sunInner, { transform: [{ rotate: spin }] }]}>
        {rays.map((i) => (
          <View
            key={i}
            style={[
              styles.sunRay,
              {
                transform: [{ rotate: `${i * 30}deg` }],
              },
            ]}
          />
        ))}
        <View style={styles.sunCenter} />
      </Animated.View>
    </Animated.View>
  );
};

// ── Hill Silhouettes ─────────────────────────────────────────────
const HillSilhouettes: React.FC = () => (
  <View style={styles.hillsContainer}>
    <View style={[styles.hill, styles.hill1]} />
    <View style={[styles.hill, styles.hill2]} />
    <View style={[styles.hill, styles.hill3]} />
  </View>
);

// ── Login Screen ─────────────────────────────────────────────────
export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(defaultModal);
  const setUser = useAppStore((s) => s.setUser);

  // Animations
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(30)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;


  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(brandTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(brandOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setModal({
        visible: true,
        title: 'Ibisabwa',
        message: 'Shyiramo email na ijambo banga.',
        type: 'error',
        icon: '📧',
        showCancel: false,
        confirmText: 'Sawe',
      });
      return;
    }
    setLoading(true);
    // Sign in with a real Firebase email/password account so data
    // follows the user on ANY device (new phone, reinstall, etc.)
    try {
      if (!firebaseAuth) throw new Error('Firebase not initialized');
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim().toLowerCase(), password);
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email || email.trim(),
        displayName: userCredential.user.displayName || email.split('@')[0],
        isLoggedIn: true,
      });
    } catch (e: any) {
      setModal({
        visible: true,
        title: 'Byanze',
        message: getAuthErrorMessage(e?.code || ''),
        type: 'error',
        icon: '📧',
        showCancel: false,
        confirmText: 'Sawe',
      });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background (decorative, does NOT participate in keyboard avoidance) ── */}
      <Animated.View style={[styles.background, { opacity: bgOpacity }]}>
        <LinearGradient
          colors={['#1a3a5c', '#2c5f7c', '#4a7c5c', '#3d6b4a', '#2d5a3a']}
          style={styles.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <HillSilhouettes />
        <AnimatedSun opacity={bgOpacity} />
      </Animated.View>

      {/* ── Branding (shrinks when keyboard opens, never overlaps) ── */}
      <View style={styles.brandingArea}>
        <Animated.View
          style={[
            styles.brandingInner,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandTranslateY }],
            },
          ]}
        >
          <View style={styles.gorillaContainer}>
            <Text style={styles.gorillaEmoji}>🦍</Text>
          </View>
          <Text style={styles.appName}>Menya</Text>
          <Text style={styles.tagline}>Menya Ikinyarwanda 🇷🇼</Text>
        </Animated.View>
      </View>

      {/* ── Bottom Sheet (normal flow — adapts to remaining height) ── */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        <ScrollView
            contentContainerStyle={[styles.sheetContent, { flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={styles.sheetTitle}>Injira</Text>
            <Text style={styles.sheetSubtitle}>Ikaze! Injira kuri konti yawe.</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <AppIcon name="mail" size={18} color="#FFFFFF" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <AppIcon name="lock" size={18} color="#FFFFFF" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Ijambo banga / Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <AppIcon
                  name={showPassword ? 'eye' : 'eye'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.loginBtnText}>Injira...</Text>
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Injira / Login</Text>
                  <AppIcon name="arrowRight" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>cyangwa / or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => handleGoogleSignIn(setUser, setLoading, setModal)}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Injira na Google</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Nta konti?{' '}
                <Text style={styles.registerHighlight}>Iyandikishe</Text>
              </Text>
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => Linking.openURL('https://sites.google.com/view/menya-ikinyarwanda')}
            >
              <Text style={[styles.registerText, { fontSize: 11, opacity: 0.6 }]}>
                🔒 Privacy Policy
              </Text>
            </TouchableOpacity>
          </ScrollView>
      </Animated.View>

      {/* Modal */}
      <AppModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        icon={modal.icon}
        cancelText={modal.cancelText}
        confirmText={modal.confirmText || 'Sawe'}
        confirmColor={modal.confirmColor}
        showCancel={modal.showCancel}
        onCancel={() => setModal(defaultModal)}
        onConfirm={() => {
          modal.onConfirm?.();
          if (!modal.onConfirm) setModal(defaultModal);
        }}
      />
    </KeyboardAvoidingView>
  );
};

// ── Register Screen ──────────────────────────────────────────────
export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(defaultModal);
  const setUser = useAppStore((s) => s.setUser);
  const setPhoto = useAppStore((s) => s.setPhotoUri);

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(30)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;


  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(brandTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(brandOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ]),
      Animated.spring(sheetTranslateY, {
        toValue: 0, friction: 8, tension: 40, delay: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePickPhoto = async () => {
    const camStatus = await ImagePicker.requestCameraPermissionsAsync();
    setModal({
      visible: true,
      title: '📷 Ifoto yawe',
      message: 'Hitamo aho ifoto iva.',
      type: 'info',
      icon: '📷',
      cancelText: '📁 Galerie',
      confirmText: '📸 Kamera',
      showCancel: true,
      onConfirm: async () => {
        setModal(defaultModal);
        if (camStatus.status !== 'granted') {
          const s2 = await ImagePicker.requestCameraPermissionsAsync();
          if (s2.status !== 'granted') return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
        }
      },
    });
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      setModal({ visible: true, title: 'Ibisabwa', message: 'Shyiramo izina ryawe.', type: 'error', icon: '👤', showCancel: false, confirmText: 'Sawe' });
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 4 || Number(age) > 120) {
      setModal({ visible: true, title: 'Ibisabwa', message: 'Shyiramo imyaka yawe (4-120).', type: 'error', icon: '📅', showCancel: false, confirmText: 'Sawe' });
      return;
    }
    if (!photoUri) {
      setModal({ visible: true, title: 'Ifoto Irakenewe', message: 'Shyiramo ifoto yawe. Ifoto izagaragara ku mpamyabumenyi (certificate).', type: 'error', icon: '📷', showCancel: false, confirmText: 'Sawe' });
      return;
    }
    if (!email.trim()) {
      setModal({ visible: true, title: 'Ibisabwa', message: 'Shyiramo email.', type: 'error', icon: '📧', showCancel: false, confirmText: 'Sawe' });
      return;
    }
    // Basic password check — Firebase requires at least 6 characters
    if (password.length < 6) {
      setModal({ visible: true, title: 'Ijambo banga', message: 'Ijambo banga rigomba kuba rifite nibura inyuguti 6 (6+ characters).', type: 'error', icon: '🔒', showCancel: false, confirmText: 'Sawe' });
      return;
    }

    setLoading(true);
    // Create a real Firebase email/password account so progress is saved
    // to the account — the client can continue on any new phone
    try {
      if (!firebaseAuth) throw new Error('Firebase not initialized');
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email.trim().toLowerCase(), password);
      await updateProfile(userCredential.user, { displayName: name.trim() });
      // Clear ALL stale data from any previous user on this device
      await AsyncStorage.multiRemove([
        'menya_user', 'menya_progress', 'menya_certificate',
        'menya_progress_backup', 'menya_certificate_backup',
      ]);

      // Copy photo to a permanent location so it survives cache clears
      let permanentPhotoUri: string | null = null;
      if (photoUri) {
        try {
          const FileSystem = require('expo-file-system/legacy');
          const ext = photoUri.split('.').pop()?.toLowerCase() || 'jpg';
          const destPath = `${FileSystem.documentDirectory}profile_${userCredential.user.uid}.${ext}`;
          await FileSystem.copyAsync({ from: photoUri, to: destPath });
          permanentPhotoUri = destPath;
        } catch {
          permanentPhotoUri = photoUri; // fallback to original URI
        }
      }

      // Reset the store to clean defaults FIRST — prevents stale lessons from
      // a previous user on this device leaking into the new account
      const { logout: resetStore } = useAppStore.getState();
      // Directly reset state without signing out from Firebase (already signed in)
      useAppStore.setState({
        progress: {
          completedLessons: [],
          perfectLessons: [],
          xp: 0,
          streak: 0,
          lastActiveDate: null,
          hearts: 5,
          level: 1,
        },
        certificate: { earned: false },
      });

      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email || email.trim(),
        displayName: name.trim(),
        age: Number(age),
        avatar: 'gorilla',
        photoUri: permanentPhotoUri,
        isLoggedIn: true,
      });
      // setPhoto is now handled above via permanentPhotoUri in setUser
    } catch (e: any) {
      setModal({
        visible: true,
        title: 'Byanze',
        message: getAuthErrorMessage(e?.code || ''),
        type: 'error',
        icon: '📧',
        showCancel: false,
        confirmText: 'Sawe',
      });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.background, { opacity: bgOpacity }]}>
        <LinearGradient
          colors={['#1a3a5c', '#2c5f7c', '#4a7c5c', '#3d6b4a', '#2d5a3a']}
          style={styles.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <HillSilhouettes />
        <AnimatedSun opacity={bgOpacity} />
      </Animated.View>

      <View style={styles.brandingArea}>
        <Animated.View style={[styles.brandingInner, { opacity: brandOpacity, transform: [{ translateY: brandTranslateY }] }]}>
          <View style={styles.gorillaContainer}>
            <Text style={styles.gorillaEmoji}>🦍</Text>
          </View>
          <Text style={styles.appName}>Menya</Text>
          <Text style={styles.tagline}>Tangira Kwiga! Start Learning!</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View style={styles.dragHandle} />

        <ScrollView contentContainerStyle={[styles.sheetContent, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>Iyandikishe</Text>
            <Text style={styles.sheetSubtitle}>Fungura konti yawe.</Text>

            {/* Name */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}><AppIcon name="userSquare" size={18} color="#FFFFFF" /></View>
              <TextInput style={styles.input} placeholder="Izina ryawe / Your name *" placeholderTextColor="#999" value={name} onChangeText={setName} autoCapitalize="words" />
            </View>

            {/* Age — required */}
            <View style={[styles.inputContainer, !age.trim() && { borderWidth: 1.5, borderColor: '#E74C3C' }]}>
              <View style={styles.inputIconBox}><AppIcon name="calendar" size={18} color="#FFFFFF" /></View>
              <TextInput style={styles.input} placeholder="Imyaka / Age *  (irakenewe)" placeholderTextColor="#E74C3C" value={age} onChangeText={setAge} keyboardType="numeric" />
              {!age.trim() && <Text style={{ color: '#E74C3C', paddingRight: 10, fontSize: 18 }}>*</Text>}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}><AppIcon name="mail" size={18} color="#FFFFFF" /></View>
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}><AppIcon name="lock" size={18} color="#FFFFFF" /></View>
              <TextInput style={styles.input} placeholder="Ijambo banga / Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <AppIcon name="eye" size={18} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Password hint */}
            <View style={{ marginBottom: 12, marginTop: -4, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, color: '#666', lineHeight: 18 }}>
                🔒 Ijambo banga rigomba kuba rifite nibura inyuguti 6 (6+ characters)
              </Text>
            </View>

            {/* Profile Photo Picker — required for certificate */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: !photoUri ? '#E74C3C' : '#333' }}>
                📷 Ifoto yawe *
              </Text>
              <Text style={{ fontSize: 12, color: '#E74C3C', marginLeft: 6 }}>
                {!photoUri ? '(Irakenewe — Required)' : '✅ Ifoto yashyizwe'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={handlePickFromGallery}
                style={{
                  flex: 1, borderWidth: 2,
                  borderColor: photoUri ? '#20603D' : '#E74C3C',
                  borderStyle: photoUri ? 'solid' : 'dashed',
                  borderRadius: 12, padding: 12,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: photoUri ? '#20603D11' : '#FFF5F5',
                  minHeight: 90,
                }}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: 70, height: 70, borderRadius: 35 }} />
                ) : (
                  <>
                    <Text style={{ fontSize: 28 }}>🖼️</Text>
                    <Text style={{ fontSize: 11, color: '#E74C3C', marginTop: 4, fontWeight: '700' }}>Galerie *</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickPhoto}
                style={{
                  flex: 1, borderWidth: 2,
                  borderColor: '#E74C3C',
                  borderStyle: 'dashed', borderRadius: 12, padding: 12,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#FFF5F5',
                  minHeight: 90,
                }}
              >
                <Text style={{ fontSize: 28 }}>📸</Text>
                <Text style={{ fontSize: 11, color: '#E74C3C', marginTop: 4, fontWeight: '700' }}>Kamera *</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <Text style={styles.loginBtnText}>Kwandikisha...</Text>
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Iyandikishe / Register</Text>
                  <AppIcon name="arrowRight" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>cyangwa / or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={() => handleGoogleSignIn(setUser, setLoading, setModal)} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Iyandikishe na Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerLink} onPress={() => navigation.goBack()}>
              <Text style={styles.registerText}>
                Ufite konti? <Text style={styles.registerHighlight}>Injira</Text>
              </Text>
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => Linking.openURL('https://sites.google.com/view/menya-ikinyarwanda')}
            >
              <Text style={[styles.registerText, { fontSize: 11, opacity: 0.6 }]}>
                🔒 By registering, you agree to our Privacy Policy
              </Text>
            </TouchableOpacity>
          </ScrollView>
      </Animated.View>

      {/* Modal */}
      <AppModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        icon={modal.icon}
        cancelText={modal.cancelText}
        confirmText={modal.confirmText || 'Sawe'}
        confirmColor={modal.confirmColor}
        showCancel={modal.showCancel}
        onCancel={() => setModal(defaultModal)}
        onConfirm={() => {
          modal.onConfirm?.();
          if (!modal.onConfirm) setModal(defaultModal);
        }}
      />
    </KeyboardAvoidingView>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  bgGradient: {
    ...StyleSheet.absoluteFill,
  },
  // Sun
  sunContainer: {
    position: 'absolute',
    top: 50,
    right: -20,
    width: 160,
    height: 160,
  },
  sunInner: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRay: {
    position: 'absolute',
    width: 4,
    height: 50,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    top: 10,
  },
  sunCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
  },
  // Hills
  hillsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  hill: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 200,
  },
  hill1: {
    width: 400,
    height: 180,
    backgroundColor: 'rgba(30, 80, 50, 0.6)',
    left: -80,
  },
  hill2: {
    width: 350,
    height: 150,
    backgroundColor: 'rgba(35, 90, 55, 0.5)',
    right: -60,
  },
  hill3: {
    width: 300,
    height: 120,
    backgroundColor: 'rgba(40, 100, 60, 0.4)',
    left: 50,
  },
  brandingInner: {
    alignItems: 'center',
  },
  // Branding area (flexible — shrinks when keyboard opens, never overlaps form)
  brandingArea: {
    flex: 1,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gorillaContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gorillaEmoji: {
    fontSize: 55,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  // Bottom Sheet (normal flex flow — adapts to available height, scrolls inside)
  bottomSheet: {
    flexShrink: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  sheetTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F5',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  inputIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#20603D',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  eyeBtn: {
    padding: 10,
  },
  // Login Button
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20603D',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
    gap: 8,
    shadowColor: '#20603D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
  },
  // Google Button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  // Register Link
  registerLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#888',
  },
  registerHighlight: {
    color: '#20603D',
    fontWeight: '800',
  },
});
