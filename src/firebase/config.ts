import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBlesytAzSWqeskzXIPJKKXns_jKnm1Zlk',
  authDomain: 'menya-1308d.firebaseapp.com',
  projectId: 'menya-1308d',
  storageBucket: 'menya-1308d.firebasestorage.app',
  messagingSenderId: '609178588182',
  appId: '1:609178588182:android:e8db13f447e582593a5137',
};

// Initialize Firebase safely — wrapped to prevent module-level crashes
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization error:', error);
  // Don't crash — app works without Firebase
}

// Initialize services only if app was created
try {
  if (app) {
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('Firebase Auth init error:', error);
}

try {
  if (app) {
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase Firestore init error:', error);
}

export { auth, db };
export default app;

// Helper to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
};

// Google Sign-In Client IDs
export const GOOGLE_WEB_CLIENT_ID = '609178588182-c7jje0ta7v7ki1v1rh8vmk8tsrtoi2d9.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID = '609178588182-fo4ec7ufha46btn0u62enatt22js4tmm.apps.googleusercontent.com';

// Export configuration status
export const firebaseStatus = {
  isConfigured: isFirebaseConfigured(),
  projectId: firebaseConfig.projectId,
};
