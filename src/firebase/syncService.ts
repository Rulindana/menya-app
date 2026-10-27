import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, collection, query, orderBy, limit } from 'firebase/firestore';
import { db, auth, waitForAuthReady } from './config';
import { UserProfile, UserProgress } from '../store/useAppStore';

// Check if user is authenticated with Firebase (including anonymous)
const isAuthenticated = (uid?: string): boolean => {
  if (!uid) return false;
  if (!auth) return false;
  // Must have a real Firebase Auth user (anonymous or Google)
  if (auth.currentUser === null) return false;
  // UIDs must match
  if (auth.currentUser.uid !== uid) return false;
  return true;
};

// User data structure in Firestore
export interface FirestoreUserData {
  profile: UserProfile;
  progress: UserProgress;
  certificate?: {
    earned: boolean;
    earnedAt?: string;
  };
  stats: {
    totalLessonsCompleted: number;
    totalTimeSpent: number;
    longestStreak: number;
    totalXPEarned: number;
  };
  settings: {
    notifications: boolean;
    soundEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Save user data to Firestore
export const saveUserData = async (
  uid: string,
  profile: UserProfile,
  progress: UserProgress,
  certificate?: { earned: boolean; earnedAt?: string }
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    
    // Get existing data to merge
    const existingDoc = await getDoc(userRef);
    const existingData = existingDoc.exists() ? existingDoc.data() as FirestoreUserData : null;

    const longestStreak = Math.max(
      progress.streak,
      progress.longestStreak || 0,
      existingData?.stats?.longestStreak || 0
    );

    const userData: FirestoreUserData = {
      profile,
      progress: {
        ...progress,
        longestStreak,
      },
      certificate: certificate || existingData?.certificate || { earned: false },
      stats: {
        totalLessonsCompleted: progress.completedLessons.length,
        totalTimeSpent: existingData?.stats.totalTimeSpent || 0,
        longestStreak,
        totalXPEarned: progress.xp,
      },
      settings: existingData?.settings || {
        notifications: true,
        soundEnabled: true,
      },
      createdAt: existingData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, userData, { merge: true });
    console.log('User data saved to Firestore');
  } catch (error: any) {
    // Silently handle offline errors
    if (error?.message?.includes('offline') || error?.code === 'unavailable') {
      console.log('Firestore offline - data saved locally only');
    }
    // Don't throw - let app continue working offline
  }
};

// Load user data from Firestore
export const loadUserData = async (uid: string): Promise<FirestoreUserData | null> => {
  if (!isAuthenticated(uid)) return null;
  if (!db) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as FirestoreUserData;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Subscribe to real-time updates
export const subscribeToUserData = (
  uid: string,
  callback: (data: FirestoreUserData | null) => void
) => {
  if (!isAuthenticated(uid)) return () => {};
  if (!db) return () => {};
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as FirestoreUserData);
    } else {
      callback(null);
    }
  }, (error) => {
    // Handle permission-denied / offline errors gracefully —
    // don't crash the app, just stop listening
    console.log('Snapshot listener error:', error?.code || error?.message || error);
    callback(null);
  });
};

// Update hearts in Firestore
export const updateHeartsInFirestore = async (
  uid: string,
  hearts: number,
  nextHeartAt: number | null
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'progress.hearts': hearts,
      'progress.nextHeartAt': nextHeartAt,
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// Register a device push token on the user's profile.
export const savePushTokenToFirestore = async (
  uid: string,
  token: string,
): Promise<boolean> => {
  if (!isAuthenticated(uid)) return false;
  if (!db) return false;
  if (!token) return false;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'profile.pushTokens': arrayUnion(token),
      'profile.pushTokenUpdatedAt': new Date().toISOString(),
      'updatedAt': new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
};

// Update streak in Firestore while preserving historical longestStreak
export const updateStreakInFirestore = async (
  uid: string,
  streak: number,
  lastActiveDate: string,
  longestStreak?: number
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    const bestStreak = Math.max(streak, longestStreak ?? 0);
    await updateDoc(userRef, {
      'progress.streak': streak,
      'progress.longestStreak': bestStreak,
      'progress.lastActiveDate': lastActiveDate,
      'stats.longestStreak': bestStreak,
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// Update XP in Firestore
export const updateXPInFirestore = async (uid: string, xp: number, level: number): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'progress.xp': xp,
      'progress.level': level,
      'stats.totalXPEarned': xp,
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// Complete lesson in Firestore
export const completeLessonInFirestore = async (
  uid: string,
  lessonId: string,
  progress: UserProgress
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'progress': progress,
      'stats.totalLessonsCompleted': progress.completedLessons.length,
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// Update certificate status
export const updateCertificateInFirestore = async (
  uid: string, earned: boolean
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'certificate': {
        earned,
        earnedAt: earned ? new Date().toISOString() : null,
      },
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// ── Global Leaderboard (real users) ─────────────────────────────
export interface LeaderboardEntry {
  uid: string;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  updatedAt: string;
}

// Upsert the current user's public leaderboard entry (own doc only)
export const updateLeaderboardEntry = async (
  uid: string,
  name: string,
  progress: UserProgress,
  avatar?: string
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    await setDoc(
      doc(db, 'leaderboard', uid),
      {
        uid,
        name: name || 'Anonymous',
        xp: progress.xp,
        streak: progress.streak,
        avatar: avatar || 'gorilla',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    // Silent — offline or permission issue; app keeps working
  }
};

// Real-time subscription to the global leaderboard (top 50 by XP)
export const subscribeToLeaderboard = (
  callback: (entries: LeaderboardEntry[]) => void
): (() => void) => {
  if (!db || !auth) {
    callback([]);
    return () => {};
  }

  let innerUnsub: (() => void) | null = null;
  let cancelled = false;

  waitForAuthReady().then(() => {
    if (cancelled) return;
    if (!auth || auth.currentUser === null || !db) {
      callback([]);
      return;
    }
    const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(50));
    innerUnsub = onSnapshot(
      q,
      (snap) => {
        if (!cancelled) {
          callback(snap.docs.map((d) => d.data() as LeaderboardEntry));
        }
      },
      (error) => {
        console.log('Leaderboard listener error:', error?.code || error?.message);
        if (!cancelled) callback([]);
      }
    );
  });

  return () => {
    cancelled = true;
    if (innerUnsub) {
      innerUnsub();
      innerUnsub = null;
    }
  };
};

// Update user profile
export const updateUserProfileInFirestore = async (
  uid: string, profile: Partial<UserProfile>
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  if (!db) return;
  try {
    const userRef = doc(db, 'users', uid);
    const profileFields: Record<string, unknown> = {};
    Object.entries(profile).forEach(([key, value]) => {
      profileFields[`profile.${key}`] = value;
    });
    await updateDoc(userRef, {
      ...profileFields,
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// ── Game Room Sync ─────────────────────────────────────────────
export interface GameRoom {
  code: string;
  hostUid: string;
  hostName: string;
  joinerUid: string | null;
  joinerName: string | null;
  status: 'waiting' | 'joined' | 'playing';
  createdAt: string;
}

// Create a game room
export const createGameRoom = async (
  code: string,
  hostUid: string,
  hostName: string
): Promise<void> => {
  if (!db) return;
  try {
    await setDoc(doc(db, 'gameRooms', code), {
      code,
      hostUid,
      hostName,
      joinerUid: null,
      joinerName: null,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.log('Create room error:', error);
  }
};

// Join an existing game room
export const joinGameRoom = async (
  code: string,
  joinerUid: string,
  joinerName: string
): Promise<boolean> => {
  if (!db) return false;
  try {
    const roomRef = doc(db, 'gameRooms', code);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return false;
    const room = roomSnap.data() as GameRoom;
    if (room.status !== 'waiting') return false;
    await updateDoc(roomRef, {
      joinerUid,
      joinerName,
      status: 'joined',
    });
    return true;
  } catch (error) {
    console.log('Join room error:', error);
    return false;
  }
};

// Subscribe to room updates (real-time)
export const subscribeToGameRoom = (
  code: string,
  callback: (room: GameRoom | null) => void
): (() => void) => {
  if (!db) { callback(null); return () => {}; }
  const roomRef = doc(db, 'gameRooms', code);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GameRoom);
    } else {
      callback(null);
    }
  }, (error) => {
    console.log('Room listener error:', error?.code || error?.message);
    callback(null);
  });
};

// Update room status to playing
export const startGameRoom = async (code: string): Promise<void> => {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'gameRooms', code), {
      status: 'playing',
    });
  } catch (error) {
    // Silent
  }
};
