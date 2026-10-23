import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { TextInput } from '../components/ui/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { AppIcon } from '../components/ui/AppIcon';
import { MenyaMascot } from '../components/MenyaMascot';
import { GoogleMark } from '../components/GoogleMark';
import { useAppStore, defaultProgress } from '../store/useAppStore';
import {
  auth as firebaseAuth,
  isFirebaseConfigured,
  GOOGLE_WEB_CLIENT_ID,
} from '../firebase/config';
import { loadUserData } from '../firebase/syncService';

const PRIVACY_URL = 'https://sites.google.com/view/menya-ikinyarwanda';

const AUTH = {
  background: '#EAF3F7',
  surface: '#FFFFFF',
  ink: '#14212B',
  muted: '#5C6B76',
  border: '#CBDCE4',
  primary: '#0B6E84',
  primaryDark: '#085468',
  primarySoft: '#D9EEF3',
  error: '#D64545',
  errorSoft: '#FCEAEA',
  inputBg: '#F7FAFB',
  white: '#FFFFFF',
};

let GoogleSignin: any = null;
let googleStatusCodes: any = null;
try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  googleStatusCodes = googleSigninModule.statusCodes;
  if (GoogleSignin) {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    } else {
      GoogleSignin = null;
    }
  }
} catch {
  // Google Sign-In is unavailable in Expo Go and on web.
}

const getAuthErrorMessage = (code: string): string => {
  if (code.includes('email-already-in-use')) return 'An account already exists with this email. Try logging in instead.';
  if (code.includes('invalid-email')) return 'That email address is not valid.';
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.';
  if (code.includes('user-not-found')) return 'No account was found for this email. Create an account first.';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'The email or password is incorrect.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait a moment and try again.';
  if (code.includes('network')) return 'No internet connection. Check your network and try again.';
  return 'Something went wrong. Please try again.';
};

const fetchProfile = async (uid: string) => {
  try {
    const data = await loadUserData(uid);
    return data?.profile ?? null;
  } catch {
    return null;
  }
};

const performGoogleSignIn = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error('SERVICE_UNAVAILABLE');
  }

  if (Platform.OS === 'web') {
    if (!firebaseAuth) throw new Error('FIREBASE_UNAVAILABLE');
    return signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  }

  if (!GoogleSignin) {
    throw new Error('GOOGLE_UNAVAILABLE');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result?.data?.idToken ?? result?.idToken ?? null;
  if (!idToken) throw new Error('NO_ID_TOKEN');
  if (!firebaseAuth) throw new Error('FIREBASE_UNAVAILABLE');

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(firebaseAuth, credential);
};

const LogoMark: React.FC = () => (
  <View style={styles.logoRow}>
    <View style={styles.logoBadge}>
      <AppIcon name="graduationCap" size={18} color={AUTH.white} />
    </View>
    <Text style={styles.logoText}>MENYA</Text>
  </View>
);

interface AuthScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const setUser = useAppStore((s) => s.setUser);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setError('');
    try {
      const userCredential = await performGoogleSignIn();
      if (!userCredential) throw new Error('GOOGLE_UNAVAILABLE');
      const profile = await fetchProfile(userCredential.user.uid);

      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'Learner',
        age: null,
        avatar: 'gorilla',
        photoUri: null,
        isLoggedIn: true,
        nativeLanguage: profile?.nativeLanguage ?? null,
        onboardingCompleted: profile?.onboardingCompleted ?? false,
      });
    } catch (e: any) {
      if (
        e?.code === googleStatusCodes?.SIGN_IN_CANCELLED ||
        e?.code === 'auth/popup-closed-by-user' ||
        e?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (e?.code === googleStatusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services is not available on this device. Please use email.');
      } else if (e?.message === 'SERVICE_UNAVAILABLE') {
        setError('Sign-in is unavailable right now. Please use email.');
      } else if (e?.message === 'GOOGLE_UNAVAILABLE') {
        setError('Google sign-in is unavailable in this build. Please use email.');
      } else {
        setError('Google sign-in failed. Please use email instead.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.welcomeContent}
        showsVerticalScrollIndicator={false}
      >
        <LogoMark />

        <View style={styles.mascotStage}>
          <View style={styles.mascotHalo} />
          <View style={styles.mascotArt}>
            <MenyaMascot size={216} />
          </View>
        </View>

        <Text style={styles.welcomeTitle}>
          Sign up to view your{'\n'}personalized{' '}
          <Text style={styles.welcomeTitleAccent}>study plan!</Text>
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Save your progress across devices and build a daily Kinyarwanda habit.
        </Text>

        {!!error && (
          <View style={styles.errorBanner}>
            <AppIcon name="circleAlert" size={16} color={AUTH.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.authButtons}>
          {(Platform.OS === 'web' || GoogleSignin) && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              disabled={loadingGoogle}
            >
              {loadingGoogle ? (
                <ActivityIndicator size="small" color={AUTH.primary} />
              ) : (
                <>
                  <GoogleMark size={20} />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('EmailAuth', { mode: 'signup' })}
            activeOpacity={0.85}
          >
            <AppIcon name="mail" size={19} color={AUTH.white} />
            <Text style={styles.primaryButtonText}>Continue with email</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to Menya's{' '}
          <Text style={styles.termsLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
            Privacy Policy
          </Text>
          .
        </Text>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('EmailAuth', { mode: 'login' })}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginHighlight}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

interface EmailAuthScreenProps extends AuthScreenProps {
  route: { params?: { mode?: 'signup' | 'login' } };
}

export const EmailAuthScreen: React.FC<EmailAuthScreenProps> = ({ navigation, route }) => {
  const initialMode = route?.params?.mode === 'login' ? 'login' : 'signup';
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';
  const setUser = useAppStore((s) => s.setUser);

  const switchMode = (next: 'signup' | 'login') => {
    setMode(next);
    setError('');
  };

  const validate = (): string | null => {
    if (isSignup && name.trim().length < 2) return 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Your password must be at least 6 characters.';
    if (isSignup && age.trim()) {
      const parsedAge = Number(age);
      if (!Number.isFinite(parsedAge) || parsedAge < 4 || parsedAge > 120) {
        return 'Please enter a valid age between 4 and 120.';
      }
    }
    return null;
  };

  const handleEmailAuth = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (!firebaseAuth) throw new Error('Firebase is not initialized.');

      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          firebaseAuth,
          email.trim().toLowerCase(),
          password,
        );
        await updateProfile(userCredential.user, { displayName: name.trim() });

        await AsyncStorage.multiRemove([
          'menya_user', 'menya_progress', 'menya_certificate',
          'menya_progress_backup', 'menya_certificate_backup',
        ]);

        useAppStore.setState({
          progress: { ...defaultProgress },
          certificate: { earned: false },
        });

        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || email.trim(),
          displayName: name.trim(),
          age: age.trim() ? Number(age) : null,
          avatar: 'gorilla',
          photoUri: null,
          isLoggedIn: true,
          nativeLanguage: null,
          onboardingCompleted: false,
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          email.trim().toLowerCase(),
          password,
        );
        const profile = await fetchProfile(userCredential.user.uid);

        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || email.trim(),
          displayName: userCredential.user.displayName || email.split('@')[0],
          age: profile?.age ?? null,
          avatar: profile?.avatar ?? 'gorilla',
          photoUri: profile?.photoUri ?? null,
          isLoggedIn: true,
          nativeLanguage: profile?.nativeLanguage ?? null,
          onboardingCompleted: profile?.onboardingCompleted ?? true,
        });
      }
    } catch (e: any) {
      setError(getAuthErrorMessage(e?.code || e?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setError('');
    try {
      const userCredential = await performGoogleSignIn();
      if (!userCredential) throw new Error('GOOGLE_UNAVAILABLE');
      const profile = await fetchProfile(userCredential.user.uid);

      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'Learner',
        age: profile?.age ?? null,
        avatar: profile?.avatar ?? 'gorilla',
        photoUri: profile?.photoUri ?? null,
        isLoggedIn: true,
        nativeLanguage: profile?.nativeLanguage ?? null,
        onboardingCompleted: profile?.onboardingCompleted ?? false,
      });
    } catch (e: any) {
      if (
        e?.code === googleStatusCodes?.SIGN_IN_CANCELLED ||
        e?.code === 'auth/popup-closed-by-user' ||
        e?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (e?.code === googleStatusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services is not available on this device. Please use email.');
      } else if (e?.message === 'SERVICE_UNAVAILABLE') {
        setError('Sign-in is unavailable right now. Please use email.');
      } else if (e?.message === 'GOOGLE_UNAVAILABLE') {
        setError('Google sign-in is unavailable in this build. Please use email.');
      } else {
        setError('Google sign-in failed. Please use email instead.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.emailContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emailHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <AppIcon name="chevronLeft" size={22} color={AUTH.ink} />
            </TouchableOpacity>
            <LogoMark />
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isSignup ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isSignup
                ? 'Start learning Kinyarwanda in a few minutes a day.'
                : 'Log in to keep your streak and progress going.'}
            </Text>

            {!!error && (
              <View style={styles.errorBanner}>
                <AppIcon name="circleAlert" size={16} color={AUTH.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {isSignup && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <View style={styles.inputWrap}>
                  <AppIcon name="user" size={18} color={AUTH.muted} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor="#8A99A5"
                    autoCapitalize="words"
                    autoComplete="name"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <AppIcon name="mail" size={18} color={AUTH.muted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#8A99A5"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
            </View>

            {isSignup && (
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <Text style={styles.optionalLabel}>Optional</Text>
                </View>
                <View style={styles.inputWrap}>
                  <AppIcon name="calendar" size={18} color={AUTH.muted} />
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="e.g. 24"
                    placeholderTextColor="#8A99A5"
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <AppIcon name="lock" size={18} color={AUTH.muted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#8A99A5"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  returnKeyType="done"
                  onSubmitEditing={handleEmailAuth}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((visible) => !visible)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <AppIcon
                    name={showPassword ? 'eyeOff' : 'eye'}
                    size={18}
                    color={AUTH.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleEmailAuth}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={AUTH.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {isSignup ? 'Create account' : 'Log in'}
                  </Text>
                  <AppIcon name="arrowRight" size={19} color={AUTH.white} />
                </>
              )}
            </TouchableOpacity>

            {(Platform.OS === 'web' || GoogleSignin) && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.8}
                  disabled={loadingGoogle}
                >
                  {loadingGoogle ? (
                    <ActivityIndicator size="small" color={AUTH.primary} />
                  ) : (
                    <>
                      <GoogleMark size={20} />
                      <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.switchLink}
              onPress={() => switchMode(isSignup ? 'login' : 'signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>
                {isSignup ? 'Already have an account? ' : 'New to Menya? '}
                <Text style={styles.loginHighlight}>
                  {isSignup ? 'Log in' : 'Sign up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to Menya's{' '}
            <Text style={styles.termsLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
              Privacy Policy
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AUTH.background,
  },
  flex: {
    flex: 1,
  },
  welcomeContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: AUTH.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: AUTH.ink,
  },
  mascotStage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    marginTop: 8,
    marginBottom: 4,
  },
  mascotHalo: {
    position: 'absolute',
    width: 226,
    height: 226,
    borderRadius: 113,
    backgroundColor: '#DFEDF2',
    zIndex: 0,
  },
  mascotArt: {
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '800',
    color: AUTH.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeTitleAccent: {
    color: AUTH.primary,
  },
  welcomeSubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: AUTH.muted,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: AUTH.errorSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: AUTH.error,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  authButtons: {
    gap: 12,
  },
  socialButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: AUTH.border,
    backgroundColor: AUTH.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: AUTH.ink,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: AUTH.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: AUTH.white,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  termsText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: AUTH.muted,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 10,
  },
  termsLink: {
    color: AUTH.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 2,
  },
  loginText: {
    fontSize: 13.5,
    color: AUTH.muted,
    textAlign: 'center',
  },
  loginHighlight: {
    color: AUTH.primary,
    fontWeight: '800',
  },
  emailContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AUTH.surface,
    borderWidth: 1,
    borderColor: AUTH.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  formCard: {
    backgroundColor: AUTH.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AUTH.border,
    padding: 20,
    shadowColor: AUTH.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  formTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: AUTH.ink,
    letterSpacing: -0.4,
  },
  formSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: AUTH.muted,
    marginTop: 6,
    marginBottom: 20,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AUTH.ink,
    marginBottom: 7,
    marginLeft: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AUTH.muted,
    marginBottom: 7,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH.border,
    backgroundColor: AUTH.inputBg,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AUTH.ink,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AUTH.border,
  },
  dividerText: {
    fontSize: 12,
    color: AUTH.muted,
  },
  switchLink: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 2,
  },
});
