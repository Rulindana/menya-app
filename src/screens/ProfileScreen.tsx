import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { TextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/AppModal';
import { AppIcon } from '../components/ui/AppIcon';
import { AvatarPicker, AvatarBadge } from '../components/AvatarPicker';
import { AnimatedButton } from '../components/AnimatedButton';
import { XPBar } from '../components/XPBar';
import { RwandaSun } from '../components/RwandaSun';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { units, getTotalLessons } from '../data/lessons';
import { Footer } from '../components/Footer';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import {
  cancelNotifications,
  enableNotifications,
  getNotificationSettings,
} from '../utils/notifications';

// Dynamic launcher icon based on streak
const getStreakIcon = (streak: number): string => {
  if (streak >= 30) return 'award';
  if (streak >= 14) return 'mountainSnow';
  if (streak >= 7) return 'waves';
  if (streak >= 3) return 'mountain';
  return 'flag';
};

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, progress, certificate, logout, setUser, setPhotoUri } = useAppStore();
  const { colors, isDark } = useTheme();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [showNotificationsError, setShowNotificationsError] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.displayName || '');

  useEffect(() => {
    getNotificationSettings().then((settings) => setNotificationsEnabled(settings.enabled));
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationsBusy) return;
    setNotificationsBusy(true);
    if (notificationsEnabled) {
      await cancelNotifications();
      setNotificationsEnabled(false);
    } else {
      const result = await enableNotifications(user.uid, 20);
      setNotificationsEnabled(result.enabled);
      if (!result.enabled) setShowNotificationsError(true);
    }
    setNotificationsBusy(false);
  };

  const totalLessons = getTotalLessons();
  const completedLessons = progress.completedLessons.length;
  const completionPercent = Math.round((completedLessons / totalLessons) * 100);
  const allLessonsDone = completedLessons >= totalLessons;

  const streakIcon = getStreakIcon(progress.streak);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNameErrorModal, setShowNameErrorModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleShareProgress = async () => {
    try {
      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { margin: 0; padding: 0; background: #F4F7F9; font-family: Arial, sans-serif; width: 400px; height: 300px; overflow: hidden; }
  .card { width: 400px; height: 300px; background: #0B6E84; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .flag-stripe { position: absolute; top: 0; left: 0; right: 0; height: 6px; display: flex; }
  .flag-blue { flex: 1; background: #2B6CB0; }
  .flag-yellow { flex: 0.5; background: #D9A441; }
  .flag-green { flex: 1; background: #2F9E6E; }
  .app-name { font-size: 12px; color: rgba(255,255,255,0.65); letter-spacing: 3px; margin-bottom: 10px; }
  .mark { width: 46px; height: 46px; border-radius: 14px; background: rgba(255,255,255,0.15); color: #FFFFFF; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
  .name { font-size: 22px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; }
  .stats { display: flex; gap: 22px; margin: 14px 0; }
  .stat { text-align: center; }
  .stat-val { font-size: 22px; font-weight: 800; color: #FFFFFF; }
  .stat-label { font-size: 9px; letter-spacing: 0.6px; color: rgba(255,255,255,0.6); margin-top: 2px; }
  .badge { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 6px 16px; font-size: 12px; color: #FFFFFF; font-weight: 700; }
  .footer { position: absolute; bottom: 10px; font-size: 10px; color: rgba(255,255,255,0.45); }
  .flag-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 6px; display: flex; }
</style>
</head>
<body>
<div class="card">
  <div class="flag-stripe"><div class="flag-blue"></div><div class="flag-yellow"></div><div class="flag-green"></div></div>
  <div class="app-name">MENYA IKINYARWANDA</div>
  <div class="mark">M</div>
  <div class="name">${user.displayName || 'Umunyeshuri'}</div>
  <div class="stats">
    <div class="stat"><div class="stat-val">${progress.xp}</div><div class="stat-label">XP EARNED</div></div>
    <div class="stat"><div class="stat-val">${progress.streak}</div><div class="stat-label">DAY STREAK</div></div>
    <div class="stat"><div class="stat-val">${progress.level}</div><div class="stat-label">LEVEL</div></div>
  </div>
  <div class="badge">${progress.completedLessons.length} Lessons Completed</div>
  <div class="footer">menya.app · Learn Kinyarwanda</div>
  <div class="flag-bottom"><div class="flag-green"></div><div class="flag-yellow"></div><div class="flag-blue"></div></div>
</div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html, width: 400, height: 300, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share your Menya progress!',
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const persistPhoto = async (uri: string) => {
    try {
      const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const destination = `${FileSystem.documentDirectory}profile_${user.uid || 'user'}.${extension}`;
      await FileSystem.copyAsync({ from: uri, to: destination });
      setPhotoUri(destination);
    } catch {
      setPhotoUri(uri);
    }
  };

  const handlePickPhoto = async (source: 'camera' | 'library') => {
    setShowPhotoModal(false);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') return;
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
        });
        if (!result.canceled && result.assets[0]) {
          await persistPhoto(result.assets[0].uri);
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
        });
        if (!result.canceled && result.assets[0]) {
          await persistPhoto(result.assets[0].uri);
        }
      }
    } catch {
      // The user can retry from Profile at any time.
    }
  };

  const handleSaveName = () => {
    if (nameInput.trim().length < 2) {
      setShowNameErrorModal(true);
      return;
    }
    setUser({ displayName: nameInput.trim() });
    setEditingName(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <RwandaSun size={50} animated opacity={0.12} />
        
        {/* Avatar with edit button */}
        <TouchableOpacity 
          style={styles.avatarWrapper}
          onPress={() => setShowAvatarPicker(true)}
        >
          {user.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.profilePhoto} />
          ) : (
            <AvatarBadge id={user.avatar} size={80} />
          )}
          <View style={[styles.avatarEditBadge, { backgroundColor: colors.primaryDark }]}>
            <AppIcon name="edit" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Name with edit */}
        <View style={styles.nameRow}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={[styles.nameInput, { borderBottomColor: colors.secondary }]}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                placeholder="Izina ryawe"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.nameSaveBtn}>
                <AppIcon name="save" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={styles.nameCancelBtn}>
                <AppIcon name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.nameRow}
              onPress={() => {
                setNameInput(user.displayName || '');
                setEditingName(true);
              }}
            >
              <Text style={styles.userName}>{user.displayName || 'Umunyeshuri'}</Text>
              <AppIcon name="edit" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.userEmail}>{user.email || ''}</Text>
        
        <View style={[styles.levelBadge, { backgroundColor: colors.secondary + '22', borderColor: colors.secondary + '55' }]}>
          <AppIcon name="trophy" size={14} color={colors.secondary} />
          <Text style={[styles.levelText, { color: colors.secondary }]}>Level {progress.level}</Text>
        </View>

        {/* Streak Champion Badge */}
        {progress.streak >= 3 && (
          <View style={styles.championBadge}>
            <AppIcon name={streakIcon} size={15} color="#FFFFFF" />
            <Text style={styles.championText}>
              {progress.streak >= 30 ? 'Champion!' : 
               progress.streak >= 14 ? 'Mountain Master' :
               progress.streak >= 7 ? 'Lake Explorer' : 'Hills Walker'}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* XP Bar */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingufu / Progress</Text>
          <XPBar xp={progress.xp} level={progress.level} />
        </View>

        {/* Share Progress Card */}
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
          onPress={handleShareProgress}
          activeOpacity={0.85}
        >
          <AppIcon name="share" size={18} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Share Progress Card</Text>
        </TouchableOpacity>

        {/* Profile photo */}
        <AnimatedButton
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={() => setShowPhotoModal(true)}
        >
          <AppIcon name="camera" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeBtnTitle, { color: colors.text }]}>Profile photo</Text>
            <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
              {user.photoUri ? 'Update your certificate photo' : 'Add a photo for your certificate'}
            </Text>
          </View>
          <AppIcon name="arrowRight" size={20} color={colors.textMuted} />
        </AnimatedButton>

        {/* Notifications */}
        <AnimatedButton
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={handleToggleNotifications}
        >
          <AppIcon name="bell" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeBtnTitle, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
              {notificationsEnabled
                ? 'Daily practice reminder at 8:00 PM'
                : 'Get practice reminders and Menya updates'}
            </Text>
          </View>
          <View
            style={[
              styles.notificationState,
              {
                backgroundColor: notificationsEnabled
                  ? colors.success + '18'
                  : colors.background,
              },
            ]}
          >
            <Text
              style={[
                styles.notificationStateText,
                { color: notificationsEnabled ? colors.success : colors.textMuted },
              ]}
            >
              {notificationsBusy ? '…' : notificationsEnabled ? 'On' : 'Off'}
            </Text>
          </View>
        </AnimatedButton>

        {/* Theme Settings Button */}
        <AnimatedButton 
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('ThemeSettings')}
        >
          <AppIcon name="palette" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeBtnTitle, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
              {isDark ? 'Dark mode' : 'Light mode'}
            </Text>
          </View>
          <AppIcon name="arrowRight" size={20} color={colors.textMuted} />
        </AnimatedButton>

        {/* QR Scanner Button */}
        <AnimatedButton
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <AppIcon name="scan" size={22} color="#2B6CB0" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeBtnTitle, { color: colors.text }]}>Scan Certificate QR</Text>
            <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
              Verify a Menya certificate
            </Text>
          </View>
          <AppIcon name="arrowRight" size={20} color={colors.textMuted} />
        </AnimatedButton>

        {/* My Certificate Button — only if ALL lessons completed */}
        {allLessonsDone && (
          <AnimatedButton
            style={[styles.themeBtn, { backgroundColor: colors.secondary + '18', borderWidth: 1, borderColor: colors.secondary + '55' }]}
            onPress={() => navigation.navigate('Certificate')}
          >
            <AppIcon name="award" size={22} color={colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.themeBtnTitle, { color: colors.text }]}>My Certificate</Text>
              <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
                Download or share your PDF
              </Text>
            </View>
            <AppIcon name="arrowRight" size={20} color={colors.textMuted} />
          </AnimatedButton>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight + '60' }]}>
            <View style={styles.statValueRow}>
              <AppIcon name="flame" size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>{progress.streak}</Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.xpOrange + '18' }]}>
            <View style={styles.statValueRow}>
              <AppIcon name="star" size={16} color={colors.xpOrange} />
              <Text style={[styles.statValue, { color: colors.xpOrange }]}>{progress.xp}</Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.heartRed + '14' }]}>
            <View style={styles.statValueRow}>
              <AppIcon name="heart" size={16} color={colors.heartRed} />
              <Text style={[styles.statValue, { color: colors.heartRed }]}>{progress.hearts}</Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hearts</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ibihembo / Achievements</Text>
          <View style={styles.achievementGrid}>
            <AchievementBadge
              icon="smile"
              title="Gori Fan"
              desc="Started learning"
              unlocked={true}
              colors={colors}
            />
            <AchievementBadge
              icon="flame"
              title="On Fire"
              desc="3-day streak"
              unlocked={progress.streak >= 3}
              colors={colors}
            />
            <AchievementBadge
              icon="bookOpen"
              title="Scholar"
              desc="Complete 3 lessons"
              unlocked={completedLessons >= 3}
              colors={colors}
            />
            <AchievementBadge
              icon="star"
              title="XP Hunter"
              desc="Earn 50 XP"
              unlocked={progress.xp >= 50}
              colors={colors}
            />
            <AchievementBadge
              icon="flag"
              title="Umunyarwanda"
              desc="Complete all units"
              unlocked={completedLessons >= totalLessons}
              colors={colors}
            />
            <AchievementBadge
              icon="mountainSnow"
              title="Champion"
              desc="30-day streak"
              unlocked={progress.streak >= 30}
              colors={colors}
            />
          </View>
        </View>

        {/* Course Progress */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Iterambere ry'isomo</Text>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{completedLessons}/{totalLessons} Lessons</Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>{completionPercent}%</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: `${completionPercent}%`, backgroundColor: colors.primary }]} />
          </View>

          {units.map((unit) => {
            const unitCompleted = unit.lessons.filter((l) =>
              progress.completedLessons.includes(l.id)
            ).length;
            const unitFullyDone = unitCompleted === unit.lessons.length;
            return (
              <View key={unit.id} style={[styles.unitRow, { borderTopColor: colors.border }]}>
                <View style={[styles.unitDot, { backgroundColor: unit.color }]} />
                <Text style={[styles.unitRowTitle, { color: colors.text }]}>{unit.title}</Text>
                <Text style={[styles.unitRowCount, { color: unitFullyDone ? colors.success : colors.textMuted }]}>{unitCompleted}/{unit.lessons.length}</Text>
                {unitFullyDone && (
                  <View style={[styles.unitCheck, { backgroundColor: colors.success }]}>
                    <AppIcon name="check" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Logout */}
        <AnimatedButton 
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.error }]} 
          onPress={handleLogout}
        >
          <AppIcon name="logout" size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
        </AnimatedButton>

        <Footer />
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPicker visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />

      {/* Profile photo source */}
      <AppModal
        visible={showPhotoModal}
        title="Profile photo"
        message="Choose a source for the photo on your certificate."
        type="info"
        icon="camera"
        cancelText="Gallery"
        confirmText="Camera"
        onCancel={() => handlePickPhoto('library')}
        onConfirm={() => handlePickPhoto('camera')}
      />

      {/* Notification permission */}
      <AppModal
        visible={showNotificationsError}
        title="Notifications are off"
        message="Allow notifications in your device settings, then try again from Profile."
        type="warning"
        icon="bell"
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setShowNotificationsError(false)}
      />

      {/* Logout Confirmation */}
      <AppModal
        visible={showLogoutModal}
        title="Siga Konti"
        message="Urashaka gusiga konti yawe?"
        type="warning"
        icon="logout"
        cancelText="Oya"
        confirmText="Yego"
        confirmColor={colors.error}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />

      {/* Name Error */}
      <AppModal
        visible={showNameErrorModal}
        title="Ibisabwa"
        message="Izina rigomba kuba rifite inyuguti 2."
        type="error"
        showCancel={false}
        confirmText="Sawe"
        onConfirm={() => setShowNameErrorModal(false)}
      />
    </View>
  );
};

const AchievementBadge: React.FC<{
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
  colors: any;
}> = ({ icon, title, desc, unlocked, colors }) => (
  <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }, !unlocked && styles.badgeLocked]}>
    <View style={[styles.badgeIconWrap, { backgroundColor: unlocked ? colors.primaryLight : colors.border }]}>
      <AppIcon name={icon} size={22} color={unlocked ? colors.primary : colors.textMuted} />
    </View>
    <Text style={[styles.badgeTitle, { color: unlocked ? colors.text : colors.textMuted }]}>{title}</Text>
    <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{desc}</Text>
    {!unlocked && (
      <View style={[styles.badgeLock, { backgroundColor: colors.background }]}>
        <AppIcon name="lock" size={12} color={colors.textMuted} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    borderBottomWidth: 2,
    paddingVertical: 4,
    minWidth: 150,
  },
  nameSaveBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  nameCancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  levelText: { fontSize: 13, fontWeight: '800' },
  championBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    gap: 6,
  },
  championText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  themeBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeBtnSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  notificationState: {
    minWidth: 36,
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  notificationStateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themeBtnArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4 },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    width: '30%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  badgeLocked: { opacity: 0.6 },
  badgeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  badgeLock: { position: 'absolute', top: 4, right: 4, padding: 2, borderRadius: 6 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13 },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  unitDot: { width: 12, height: 12, borderRadius: 6 },
  unitRowTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  unitRowCount: { fontSize: 13 },
  unitCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 12,
  },
});
