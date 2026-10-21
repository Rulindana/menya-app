import { doc, setDoc, getDoc, onSnapshot, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from './config';
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
  try {
    const userRef = doc(db, 'users', uid);
    
    // Get existing data to merge
    const existingDoc = await getDoc(userRef);
    const existingData = existingDoc.exists() ? existingDoc.data() as FirestoreUserData : null;

    const userData: FirestoreUserData = {
      profile,
      progress,
      certificate: certificate || existingData?.certificate || { earned: false },
      stats: {
        totalLessonsCompleted: progress.completedLessons.length,
        totalTimeSpent: existingData?.stats.totalTimeSpent || 0,
        longestStreak: Math.max(progress.streak, existingData?.stats.longestStreak || 0),
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
    console.log('✅ User data saved to Firestore');
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

// Update streak in Firestore
export const updateStreakInFirestore = async (uid: string, streak: number, lastActiveDate: string): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'progress.streak': streak,
      'progress.lastActiveDate': lastActiveDate,
      'stats.longestStreak': streak,
      'updatedAt': new Date().toISOString(),
    });
  } catch (error) {
    // Silent
  }
};

// Update XP in Firestore
export const updateXPInFirestore = async (uid: string, xp: number, level: number): Promise<void> => {
  if (!isAuthenticated(uid)) return;
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
  if (!auth || auth.currentUser === null) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => d.data() as LeaderboardEntry));
    },
    (error) => {
      console.log('Leaderboard listener error:', error?.code || error?.message);
      callback([]);
    }
  );
};

// Update user profile
export const updateUserProfileInFirestore = async (
  uid: string, profile: Partial<UserProfile>
): Promise<void> => {
  if (!isAuthenticated(uid)) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'profile': profile,
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
  try {
    await updateDoc(doc(db, 'gameRooms', code), {
      status: 'playing',
    });
  } catch (error) {
    // Silent
  }
};
