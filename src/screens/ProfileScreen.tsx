import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { AppModal } from '../components/AppModal';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { AvatarPicker, getAvatarEmoji } from '../components/AvatarPicker';
import { AnimatedButton } from '../components/AnimatedButton';
import { XPBar } from '../components/XPBar';
import { RwandaSun } from '../components/RwandaSun';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { units, getTotalLessons } from '../data/lessons';
import { Footer } from '../components/Footer';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

// Dynamic launcher icon based on streak
const getStreakIcon = (streak: number): string => {
  if (streak >= 30) return '🦍'; // Champion gorilla
  if (streak >= 14) return '🏔️'; // Mountains
  if (streak >= 7) return '🏞️'; // Lake Kivu
  if (streak >= 3) return '🌄'; // Rwanda Hills
  return '🇷🇼'; // Flag
};

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, progress, certificate, logout, setUser } = useAppStore();
  const { colors, isDark } = useTheme();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.displayName || '');

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
      const badgeEmoji = progress.xp >= 5000 ? '🥇' : progress.xp >= 2000 ? '🥈' : progress.xp >= 500 ? '🥉' : '🌱';
      const streakFire = progress.streak >= 7 ? '🔥🔥' : progress.streak >= 3 ? '🔥' : '✨';
      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { margin: 0; padding: 0; background: #0d3320; font-family: Arial, sans-serif; width: 400px; height: 300px; overflow: hidden; }
  .card { width: 400px; height: 300px; background: linear-gradient(135deg, #0d3320 0%, #20603D 50%, #1a5c3a 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .flag-stripe { position: absolute; top: 0; left: 0; right: 0; height: 8px; display: flex; }
  .flag-blue { flex: 1; background: #00A1DE; }
  .flag-yellow { flex: 0.5; background: #FAD201; }
  .flag-green { flex: 1; background: #20603D; }
  .app-name { font-size: 14px; color: rgba(255,255,255,0.6); letter-spacing: 3px; margin-bottom: 6px; }
  .gorilla { font-size: 48px; margin-bottom: 8px; }
  .name { font-size: 22px; font-weight: 900; color: #FFD700; margin-bottom: 4px; }
  .stats { display: flex; gap: 20px; margin: 12px 0; }
  .stat { text-align: center; }
  .stat-val { font-size: 22px; font-weight: 900; color: #FFFFFF; }
  .stat-label { font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 2px; }
  .badge { background: rgba(255,215,0,0.2); border: 1px solid #FFD700; border-radius: 20px; padding: 6px 16px; font-size: 13px; color: #FFD700; font-weight: 700; }
  .footer { position: absolute; bottom: 10px; font-size: 10px; color: rgba(255,255,255,0.4); }
  .flag-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 8px; display: flex; }
</style>
</head>
<body>
<div class="card">
  <div class="flag-stripe"><div class="flag-blue"></div><div class="flag-yellow"></div><div class="flag-green"></div></div>
  <div class="app-name">MENYA IKINYARWANDA</div>
  <div class="gorilla">🦍</div>
  <div class="name">${user.displayName || 'Umunyeshuri'}</div>
  <div class="stats">
    <div class="stat"><div class="stat-val">${badgeEmoji} ${progress.xp}</div><div class="stat-label">XP Earned</div></div>
    <div class="stat"><div class="stat-val">${streakFire} ${progress.streak}</div><div class="stat-label">Day Streak</div></div>
    <div class="stat"><div class="stat-val">⭐ ${progress.level}</div><div class="stat-label">Level</div></div>
  </div>
  <div class="badge">🇷🇼 ${progress.completedLessons.length} Lessons Completed</div>
  <div class="footer">menya.app • Learn Kinyarwanda</div>
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
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <RwandaSun size={50} animated opacity={0.2} />
        
        {/* Avatar with edit button */}
        <TouchableOpacity 
          style={styles.avatarWrapper}
          onPress={() => setShowAvatarPicker(true)}
        >
          <Text style={styles.avatarEmoji}>{getAvatarEmoji(user.avatar)}</Text>
          <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
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
        
        <View style={[styles.levelBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.levelText, { color: colors.text }]}>🏆 Level {progress.level}</Text>
        </View>

        {/* Streak Champion Badge */}
        {progress.streak >= 3 && (
          <View style={styles.championBadge}>
            <Text style={styles.championIcon}>{streakIcon}</Text>
            <Text style={styles.championText}>
              {progress.streak >= 30 ? 'Champion!' : 
               progress.streak >= 14 ? 'Mountain Master' :
               progress.streak >= 7 ? 'Lake Explorer' : 'Hills Walker'}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* XP Bar */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingufu / Progress</Text>
          <XPBar xp={progress.xp} level={progress.level} />
        </View>

        {/* Share Progress Card */}
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: '#25D366' }]}
          onPress={handleShareProgress}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 18 }}>📤</Text>
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Share Progress Card</Text>
        </TouchableOpacity>

        {/* Theme Settings Button */}
        <AnimatedButton 
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('ThemeSettings')}
        >
          <AppIcon name="palette" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeBtnTitle, { color: colors.text }]}>🎨 Theme / Ibara</Text>
            <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Text>
          </View>
          <AppIcon name="arrowRight" size={20} color={colors.textMuted} />
        </AnimatedButton>

        {/* QR Scanner Button */}
        <AnimatedButton
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <AppIcon name="scan" size={22} color="#00A1DE" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeBtnTitle, { color: colors.text }]}>🔍 Scan Certificate QR</Text>
            <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
              Verify a Menya certificate
            </Text>
          </View>
          <AppIcon name="arrowRight" size={20} color={colors.textMuted} />
        </AnimatedButton>

        {/* My Certificate Button — only if ALL lessons completed */}
        {allLessonsDone && (
          <AnimatedButton
            style={[styles.themeBtn, { backgroundColor: '#FFD70022', borderWidth: 1.5, borderColor: '#FFD700' }]}
            onPress={() => navigation.navigate('Certificate')}
          >
            <Text style={{ fontSize: 22 }}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.themeBtnTitle, { color: '#FFD700' }]}>My Certificate</Text>
              <Text style={[styles.themeBtnSubtitle, { color: colors.textSecondary }]}>
                Download or share your PDF
              </Text>
            </View>
            <AppIcon name="arrowRight" size={20} color="#FFD700" />
          </AnimatedButton>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight + '20' }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>🔥 {progress.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.xpOrange + '20' }]}>
            <Text style={[styles.statValue, { color: colors.xpOrange }]}>⭐ {progress.xp}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.heartRed + '20' }]}>
            <Text style={[styles.statValue, { color: colors.heartRed }]}>❤️ {progress.hearts}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hearts</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ibihembo / Achievements</Text>
          <View style={styles.achievementGrid}>
            <AchievementBadge
              icon="🦍"
              title="Gori Fan"
              desc="Started learning"
              unlocked={true}
              colors={colors}
            />
            <AchievementBadge
              icon="🔥"
              title="On Fire"
              desc="3-day streak"
              unlocked={progress.streak >= 3}
              colors={colors}
            />
            <AchievementBadge
              icon="📚"
              title="Scholar"
              desc="Complete 3 lessons"
              unlocked={completedLessons >= 3}
              colors={colors}
            />
            <AchievementBadge
              icon="⭐"
              title="XP Hunter"
              desc="Earn 50 XP"
              unlocked={progress.xp >= 50}
              colors={colors}
            />
            <AchievementBadge
              icon="🇷🇼"
              title="Umunyarwanda"
              desc="Complete all units"
              unlocked={completedLessons >= totalLessons}
              colors={colors}
            />
            <AchievementBadge
              icon="🏔️"
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
          <Text style={[styles.logoutText, { color: colors.error }]}>🚪 Siga Konti / Logout</Text>
        </AnimatedButton>

        <Footer />
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPicker visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />

      {/* Logout Confirmation */}
      <AppModal
        visible={showLogoutModal}
        title="Siga Konti"
        message="Urashaka gusiga konti yawe?"
        type="warning"
        icon="🚪"
        cancelText="Oya"
        confirmText="Yego"
        confirmColor="#E74C3C"
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
    <Text style={[styles.badgeIcon, !unlocked && { opacity: 0.3 }]}>{icon}</Text>
    <Text style={[styles.badgeTitle, { color: unlocked ? colors.text : colors.textMuted }]}>{title}</Text>
    <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{desc}</Text>
    {!unlocked && <View style={[styles.badgeLock, { backgroundColor: colors.background }]}><Text>🔒</Text></View>}
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
  avatarEmoji: {
    fontSize: 80,
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
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  levelText: { fontSize: 14, fontWeight: '800' },
  championBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    gap: 6,
  },
  championIcon: { fontSize: 16 },
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
  statValue: { fontSize: 18, fontWeight: '900' },
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
  badgeIcon: { fontSize: 28, marginBottom: 4 },
  badgeTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  badgeLock: { position: 'absolute', top: 4, right: 4 },
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
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
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
