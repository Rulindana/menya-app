import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth, waitForAuthReady } from '../firebase/config';
import { getTotalLessons } from '../data/lessons';
import {
  saveUserData,
  loadUserData,
  subscribeToUserData,
  updateStreakInFirestore,
  updateXPInFirestore,
  completeLessonInFirestore,
  updateCertificateInFirestore,
  updateUserProfileInFirestore,
  updateLeaderboardEntry,
  updateHeartsInFirestore,
} from '../firebase/syncService';

export const MAX_HEARTS = 5;
// Duolingo's refill interval is server-driven; 30 minutes keeps the loop
// practical for a 26-lesson course while preserving the same mechanic.
export const HEART_REFILL_MS = 30 * 60 * 1000;

export const formatHeartCountdown = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export type AvatarId =
  | 'gorilla'
  | 'flag'
  | 'hills'
  | 'lake'
  | 'mountain'
  | 'sun'
  | 'drum'
  | 'heart'
  | 'coffee'
  | 'basket'
  | 'cow'
  | 'champion'
  | 'king'
  | 'diamond'
  | 'rocket'
  | 'legend'
  | (string & {});

export interface UserProgress {
  completedLessons: string[];
  perfectLessons: string[];   // lessons completed with 0 mistakes
  xp: number;
  streak: number;
  longestStreak?: number;
  lastActiveDate: string | null;
  hearts: number;
  nextHeartAt: number | null; // epoch ms of the next scheduled heart
  level: number;
}

export interface UserProfile {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  age: number | null;
  avatar: AvatarId;
  photoUri: string | null;   // local URI of the user's profile photo
  isLoggedIn: boolean;
  nativeLanguage: string | null;
  onboardingCompleted: boolean;
}

export interface SyncMutation {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface AppState {
  user: UserProfile;
  progress: UserProgress;
  certificate: { earned: boolean; earnedAt?: string };
  isOnline: boolean;
  pendingSyncQueue: SyncMutation[];
  setUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
  completeLesson: (lessonId: string, xpEarned: number, isPerfect?: boolean) => void;
  addXP: (amount: number) => void;
  loseHeart: () => void;
  earnHeart: () => void;
  applyHeartRegen: () => void;
  updateStreak: () => void;
  setAvatar: (avatar: AvatarId) => void;
  updateDisplayName: (name: string) => void;
  setPhotoUri: (uri: string | null) => void;
  completeOnboarding: (nativeLanguage: string | null) => void;
  earnCertificate: () => void;
  enqueueSyncMutation: (mutation: { id?: string; type: string; payload?: any; timestamp?: number }) => SyncMutation;
  clearSyncQueue: () => void;
  getPendingSyncCount: () => number;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  syncWithFirestore: () => Promise<void>;
}

export const defaultProgress: UserProgress = {
  completedLessons: [],
  perfectLessons: [],
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  hearts: MAX_HEARTS,
  nextHeartAt: null,
  level: 1,
};

const defaultUser: UserProfile = {
  uid: null,
  email: null,
  displayName: null,
  age: null,
  avatar: 'gorilla',
  photoUri: null,
  isLoggedIn: false,
  nativeLanguage: null,
  onboardingCompleted: false,
};

// Track active Firestore user listener so we never leak duplicate subscriptions
let userUnsubscribe: (() => void) | null = null;

// XP thresholds per level (cumulative total XP needed to reach that level)
// Designed to match the ~312 total XP available across all 14 units / 26 lessons.
// Level 1: 0 XP (start)
// Level 2: 30 XP  — finish Unit 1 (Greetings, 35 XP)
// Level 3: 70 XP  — finish Unit 2 (Numbers, +45 XP = 80 XP)
// Level 4: 95 XP  — finish Unit 3 (Colors, +22 XP = 102 XP)
// Level 5: 115 XP — finish Unit 4 (Family, +10 XP = 112 XP)
// Level 6: 150 XP — finish Unit 5 (Food, +34 XP = 146 XP)
// Level 7: 175 XP — finish Unit 6 (Animals, +20 XP = 166 XP)
// Level 8: 210 XP — finish Unit 7+8 (Body+Time, +47 XP = 213 XP)
// Level 9: 250 XP — finish Unit 9+10 (Verbs+Travel, +36 XP = 249 XP)
// Level 10: 285 XP — finish Unit 11-14 (Culture+Phrases+Home, +63 XP = 312 XP)
export const LEVEL_XP_THRESHOLDS = [0, 30, 70, 95, 115, 150, 175, 210, 250, 285, 320];

export const getLevel = (xp: number): number => {
  let level = 1;
  for (let i = 1; i < LEVEL_XP_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_XP_THRESHOLDS.length); // cap at max level
};

export const getLevelProgress = (xp: number): { current: number; needed: number; percent: number } => {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[level] ?? LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const needed = nextThreshold - currentThreshold;
  const earned = Math.max(0, xp - currentThreshold);
  const percent = needed <= 0 ? 1 : Math.min(earned / needed, 1);
  return { current: earned, needed, percent };
};

// XP Bonus based on total XP earned
export const getXPBonus = (totalXP: number): number => {
  if (totalXP >= 10000) return 50; // 50 XP bonus per lesson
  if (totalXP >= 5000) return 30;
  if (totalXP >= 3000) return 20;
  if (totalXP >= 2000) return 15;
  if (totalXP >= 1500) return 10;
  if (totalXP >= 1000) return 5;
  if (totalXP >= 500) return 3;
  return 0;
};

// Streak multiplier for XP
export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 2.0; // Double XP
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
};

const applyRegen = (progress: UserProgress): UserProgress => {
  if (progress.hearts >= MAX_HEARTS) {
    return progress.nextHeartAt === null ? progress : { ...progress, nextHeartAt: null };
  }

  const now = Date.now();
  if (!progress.nextHeartAt) {
    return { ...progress, nextHeartAt: now + HEART_REFILL_MS };
  }

  let hearts = progress.hearts;
  let nextHeartAt = progress.nextHeartAt;
  while (hearts < MAX_HEARTS && now >= nextHeartAt) {
    hearts += 1;
    nextHeartAt += HEART_REFILL_MS;
  }

  if (hearts >= MAX_HEARTS) {
    return { ...progress, hearts: MAX_HEARTS, nextHeartAt: null };
  }
  return hearts === progress.hearts ? progress : { ...progress, hearts, nextHeartAt };
};

const syncHeartsToCloud = (user: UserProfile, progress: UserProgress) => {
  if (user.uid && user.isLoggedIn) {
    updateHeartsInFirestore(user.uid, progress.hearts, progress.nextHeartAt);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  user: defaultUser,
  progress: defaultProgress,
  certificate: { earned: false },
  isOnline: false,
  pendingSyncQueue: [],

  enqueueSyncMutation: (mutation) => {
    const item: SyncMutation = {
      id: mutation.id || `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: mutation.type,
      payload: mutation.payload ?? {},
      timestamp: mutation.timestamp || Date.now(),
    };
    set((state) => ({
      pendingSyncQueue: [...state.pendingSyncQueue, item],
    }));
    return item;
  },

  clearSyncQueue: () => {
    set({ pendingSyncQueue: [] });
  },

  getPendingSyncCount: () => {
    return get().pendingSyncQueue.length;
  },

  setUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
    get().saveToStorage();
    // Sync to Firestore for ALL logged-in users (including anonymous)
    const uid = get().user.uid;
    if (uid && get().user.isLoggedIn) {
      get().syncWithFirestore();
    }
  },

  logout: async () => {
    if (userUnsubscribe) {
      userUnsubscribe();
      userUnsubscribe = null;
    }

    // Sign out from Firebase Auth first
    try {
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      }
    } catch (e) { /* ignore */ }

    // Clear ALL local data — no backup or secondary progress that could leak to the next user
    set({ user: defaultUser, progress: { ...defaultProgress }, certificate: { earned: false } });
    try {
      await AsyncStorage.multiRemove([
        'menya_user',
        'menya_progress',
        'menya_certificate',
        'menya_progress_backup',
        'menya_certificate_backup',
        'menya_completed_stories',
        'menya_daily_challenge',
      ]);
    } catch (e) { /* ignore */ }
  },

  completeLesson: (lessonId, xpEarned, isPerfect = false) => {
    const totalLessonsCount = getTotalLessons();
    let unlockedCertNow = false;

    set((state) => {
      const already = state.progress.completedLessons.includes(lessonId);
      const base = already ? Math.floor(xpEarned / 2) : xpEarned;

      // +4 XP bonus for perfect lesson (0 mistakes), first time only
      const perfectBonus = (isPerfect && !already && !state.progress.perfectLessons.includes(lessonId)) ? 4 : 0;

      const newCompleted = already
        ? state.progress.completedLessons
        : [...state.progress.completedLessons, lessonId];

      const newPerfect = (isPerfect && !state.progress.perfectLessons.includes(lessonId))
        ? [...state.progress.perfectLessons, lessonId]
        : state.progress.perfectLessons;

      // +20 XP bonus if ALL lessons are now perfect (first time)
      const allPerfectBonus = (isPerfect && newPerfect.length >= totalLessonsCount && state.progress.perfectLessons.length < totalLessonsCount) ? 20 : 0;

      // Include XP tier bonus
      const tierBonus = getXPBonus(state.progress.xp);

      const newXP = state.progress.xp + base + perfectBonus + allPerfectBonus + tierBonus;

      if (newCompleted.length >= totalLessonsCount && !state.certificate.earned) {
        unlockedCertNow = true;
      }

      return {
        progress: {
          ...state.progress,
          xp: newXP,
          level: getLevel(newXP),
          completedLessons: newCompleted,
          perfectLessons: newPerfect,
        },
        certificate: unlockedCertNow
          ? { earned: true, earnedAt: new Date().toISOString() }
          : state.certificate,
      };
    });
    get().updateStreak();
    get().saveToStorage();

    // Sync to Firestore for ALL users
    const uid = get().user.uid;
    if (uid && get().user.isLoggedIn) {
      const { progress, user } = get();
      completeLessonInFirestore(uid, lessonId, progress);
      updateLeaderboardEntry(uid, user.displayName || 'Anonymous', progress, user.avatar);
      if (unlockedCertNow) {
        updateCertificateInFirestore(uid, true);
      }
    }
  },

  addXP: (amount) => {
    set((state) => {
      const newXP = state.progress.xp + amount;
      return {
        progress: { ...state.progress, xp: newXP, level: getLevel(newXP) },
      };
    });
    if (amount > 0) {
      get().updateStreak();
    }
    get().saveToStorage();
    
    // Sync to Firestore
    if (get().user.uid && get().user.isLoggedIn) {
      const { progress, user } = get();
      updateXPInFirestore(get().user.uid!, progress.xp, progress.level);
      updateLeaderboardEntry(get().user.uid!, user.displayName || 'Anonymous', progress, user.avatar);
    }
  },

  loseHeart: () => {
    const current = applyRegen(get().progress);
    if (current.hearts <= 0) return;

    const now = Date.now();
    const hearts = current.hearts - 1;
    const nextHeartAt = current.hearts >= MAX_HEARTS
      ? now + HEART_REFILL_MS
      : current.nextHeartAt ?? now + HEART_REFILL_MS;

    set({
      progress: { ...current, hearts, nextHeartAt },
    });
    get().saveToStorage();
    syncHeartsToCloud(get().user, get().progress);
  },

  earnHeart: () => {
    const current = applyRegen(get().progress);
    const hearts = Math.min(MAX_HEARTS, current.hearts + 1);
    set({
      progress: {
        ...current,
        hearts,
        nextHeartAt: hearts >= MAX_HEARTS ? null : current.nextHeartAt,
      },
    });
    get().saveToStorage();
    syncHeartsToCloud(get().user, get().progress);
  },

  applyHeartRegen: () => {
    const current = get().progress;
    const updated = applyRegen(current);
    if (updated === current) return;

    set({ progress: updated });
    get().saveToStorage();
    syncHeartsToCloud(get().user, updated);
  },

  updateStreak: () => {
    const today = new Date().toDateString();
    set((state) => {
      const last = state.progress.lastActiveDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let newStreak = state.progress.streak;
      if (last === today) {
        // already active today
      } else if (last === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1; // broken streak — restart
      }
      const longestStreak = Math.max(state.progress.longestStreak ?? 0, state.progress.streak, newStreak);
      return {
        progress: {
          ...state.progress,
          streak: newStreak,
          longestStreak,
          lastActiveDate: today,
        },
      };
    });
    
    // Sync streak to Firestore
    const { progress } = get();
    if (get().user.uid && get().user.isLoggedIn) {
      updateStreakInFirestore(
        get().user.uid!,
        progress.streak,
        progress.lastActiveDate || '',
        progress.longestStreak
      );
    }
  },

  setAvatar: (avatar) => {
    set((state) => ({ user: { ...state.user, avatar, photoUri: null } }));
    get().saveToStorage();
    
    // Sync to Firestore
    if (get().user.uid && get().user.isLoggedIn) {
      updateUserProfileInFirestore(get().user.uid!, { avatar, photoUri: null });
      // Also update leaderboard so friends see the new avatar immediately
      const { progress, user } = get();
      updateLeaderboardEntry(get().user.uid!, user.displayName || 'Anonymous', progress, avatar);
    }
  },

  updateDisplayName: (name) => {
    set((state) => ({ user: { ...state.user, displayName: name } }));
    get().saveToStorage();
    
    // Sync to Firestore and Leaderboard
    if (get().user.uid && get().user.isLoggedIn) {
      updateUserProfileInFirestore(get().user.uid!, { displayName: name });
      const { progress, user } = get();
      updateLeaderboardEntry(get().user.uid!, name || 'Anonymous', progress, user.avatar);
    }
  },

  setPhotoUri: (uri) => {
    set((state) => ({ user: { ...state.user, photoUri: uri } }));
    get().saveToStorage();

    if (get().user.uid && get().user.isLoggedIn) {
      updateUserProfileInFirestore(get().user.uid!, { photoUri: uri });
    }
  },

  completeOnboarding: (nativeLanguage) => {
    set((state) => ({
      user: {
        ...state.user,
        nativeLanguage,
        onboardingCompleted: true,
      },
    }));
    get().saveToStorage();

    if (get().user.uid && get().user.isLoggedIn) {
      updateUserProfileInFirestore(get().user.uid!, {
        nativeLanguage,
        onboardingCompleted: true,
      });
    }
  },

  earnCertificate: () => {
    set({ certificate: { earned: true, earnedAt: new Date().toISOString() } });
    get().saveToStorage();
    
    // Sync to Firestore
    if (get().user.uid && get().user.isLoggedIn) {
      updateCertificateInFirestore(get().user.uid!, true);
    }
  },

  loadFromStorage: async () => {
    try {
      const userStr = await AsyncStorage.getItem('menya_user');
      const progressStr = await AsyncStorage.getItem('menya_progress');
      const certStr = await AsyncStorage.getItem('menya_certificate');

      // Parse user first
      const parsedUser = userStr ? JSON.parse(userStr) : null;

      // If no logged-in user stored, wipe everything and start fresh
      // This prevents old user's data leaking to a new registration
      if (!parsedUser || !parsedUser.isLoggedIn || !parsedUser.uid) {
        await AsyncStorage.multiRemove([
          'menya_user', 'menya_progress', 'menya_certificate',
          'menya_progress_backup', 'menya_certificate_backup',
          'menya_completed_stories', 'menya_daily_challenge',
        ]);
        set({ user: defaultUser, progress: { ...defaultProgress }, certificate: { earned: false } });
        return;
      }

      // Valid logged-in user — load their data
      set({ user: { ...defaultUser, ...parsedUser } });

      if (progressStr) {
        const parsed = JSON.parse(progressStr);
        const recalculated = {
          ...defaultProgress,
          ...parsed,
          level: getLevel(parsed.xp ?? 0),
          perfectLessons: parsed.perfectLessons ?? [],
          longestStreak: Math.max(parsed.longestStreak ?? 0, parsed.streak ?? 0),
          nextHeartAt: parsed.nextHeartAt ?? null,
        };
        set({ progress: applyRegen(recalculated) });
      }
      if (certStr) {
        const parsed = JSON.parse(certStr);
        set({ certificate: parsed });
      }

      // Sync from Firestore for logged-in user
      get().syncWithFirestore();
    } catch (e) {
      console.log('Storage load error:', e);
      // On any error, reset to safe defaults
      set({ user: defaultUser, progress: { ...defaultProgress }, certificate: { earned: false } });
    }
  },

  saveToStorage: async () => {
    try {
      const { user, progress, certificate } = get();
      await AsyncStorage.setItem('menya_user', JSON.stringify(user));
      await AsyncStorage.setItem('menya_progress', JSON.stringify(progress));
      await AsyncStorage.setItem('menya_certificate', JSON.stringify(certificate));
    } catch (e) {
      console.log('Storage save error:', e);
    }
  },

  syncWithFirestore: async () => {
    // Wait for persisted Firebase Auth session to restore before checking currentUser
    await waitForAuthReady();

    const { user, progress, certificate } = get();
    if (!user.uid || !user.isLoggedIn) return;
    
    try {
      // Try to load existing data from Firestore
      const firestoreData = await loadUserData(user.uid);
      
      if (firestoreData) {
        // Always restore Firestore data when logging in.
        // Merge: always take the higher of local vs cloud values so no progress is lost.
        const keepLocalHearts = progress.hearts < MAX_HEARTS && progress.nextHeartAt != null;
        const mergedProgress: UserProgress = {
          ...progress,
          xp: Math.max(progress.xp, firestoreData.progress.xp),
          streak: Math.max(progress.streak, firestoreData.progress.streak),
          longestStreak: Math.max(
            progress.longestStreak ?? 0,
            progress.streak,
            firestoreData.progress.longestStreak ?? 0,
            firestoreData.stats?.longestStreak ?? 0,
            firestoreData.progress.streak
          ),
          hearts: keepLocalHearts
            ? progress.hearts
            : Math.max(progress.hearts, firestoreData.progress.hearts),
          nextHeartAt: keepLocalHearts
            ? progress.nextHeartAt
            : firestoreData.progress.hearts > progress.hearts
              ? firestoreData.progress.nextHeartAt ?? null
              : progress.nextHeartAt,
          completedLessons: [
            ...new Set([...progress.completedLessons, ...firestoreData.progress.completedLessons]),
          ],
          perfectLessons: [
            ...new Set([...(progress.perfectLessons || []), ...(firestoreData.progress.perfectLessons || [])]),
          ],
        };
        mergedProgress.level = getLevel(mergedProgress.xp);
        if (mergedProgress.hearts >= MAX_HEARTS) mergedProgress.nextHeartAt = null;

        set({
          progress: mergedProgress,
          certificate: firestoreData.certificate?.earned ? firestoreData.certificate : certificate,
        });
      }
      
      // Save current state to Firestore (re-read after merge)
      const current = get();
      await saveUserData(user.uid, current.user, current.progress, current.certificate);
      // Publish the user's entry on the global leaderboard (including their current avatar)
      await updateLeaderboardEntry(
        user.uid,
        current.user.displayName || 'Anonymous',
        current.progress,
        current.user.avatar
      );
      
      // Clean up any existing subscription before attaching a new one
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }

      // Subscribe to real-time updates
      userUnsubscribe = subscribeToUserData(user.uid, (data) => {
        if (data) {
          set((state) => ({
            progress: applyRegen({
              ...state.progress,
              ...data.progress,
              longestStreak: Math.max(
                state.progress.longestStreak ?? 0,
                data.progress.longestStreak ?? 0,
                data.stats?.longestStreak ?? 0,
                data.progress.streak ?? 0
              ),
              nextHeartAt: data.progress.nextHeartAt ?? state.progress.nextHeartAt ?? null,
              level: getLevel(data.progress.xp),
            }),
            certificate: data.certificate || state.certificate,
          }));
        }
      });
      
      set({ isOnline: true });
    } catch (error: any) {
      // Silently handle offline errors - app still works without Firestore
      if (error?.message?.includes('offline') || error?.code === 'unavailable') {
        console.log('Firestore offline - using local storage only');
      } else {
        console.log('Firestore sync error:', error?.message || error);
      }
      set({ isOnline: false });
    }
  },
}));
