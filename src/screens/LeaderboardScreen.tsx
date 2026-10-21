import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { RwandaSun } from '../components/RwandaSun';
import { useAppStore } from '../store/useAppStore';
import { subscribeToLeaderboard, LeaderboardEntry } from '../firebase/syncService';
import { getAvatarEmoji } from '../components/AvatarPicker';

const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const podiumIcons = ['🥇', '🥈', '🥉'];

// Get avatar based on XP
const getAvatarByXP = (xp: number): string => {
  if (xp >= 10000) return '🦍';
  if (xp >= 5000) return '🏆';
  if (xp >= 3000) return '👑';
  if (xp >= 2000) return '💎';
  if (xp >= 1500) return '🚀';
  if (xp >= 1000) return '🌟';
  if (xp >= 500) return '☕';
  if (xp >= 300) return '🧺';
  if (xp >= 200) return '🐄';
  if (xp >= 100) return '🥁';
  return '🇷🇼';
};

// Get rank title based on XP
const getRankTitle = (xp: number): string => {
  if (xp >= 10000) return 'Living Legend';
  if (xp >= 5000) return 'Diamond Master';
  if (xp >= 3000) return 'Champion';
  if (xp >= 2000) return 'Rising Star';
  if (xp >= 1000) return 'Expert';
  if (xp >= 500) return 'Skilled';
  if (xp >= 200) return 'Intermediate';
  return 'Beginner';
};

interface RowUser {
  uid: string;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  isMe: boolean;
}

export const LeaderboardScreen: React.FC = () => {
  const { user, progress } = useAppStore();
  const { colors } = useTheme();
  const [remoteUsers, setRemoteUsers] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!user.isLoggedIn) return;
    const unsub = subscribeToLeaderboard((entries) => setRemoteUsers(entries));
    return () => unsub();
  }, [user.isLoggedIn, user.uid]);

  const allUsers: RowUser[] = [
    ...remoteUsers
      .filter((r) => r.uid !== user.uid)
      .map((r) => ({ uid: r.uid, name: r.name, xp: r.xp, streak: r.streak, avatar: r.avatar || 'gorilla', isMe: false })),
    {
      uid: user.uid || 'me',
      name: user.displayName || 'You',
      xp: progress.xp,
      streak: progress.streak,
      avatar: user.avatar,
      isMe: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  const meRank = allUsers.findIndex((u) => u.isMe) + 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#FFD700', '#FF6B35']} style={styles.header}>
        <RwandaSun size={50} animated opacity={0.2} />
        <Text style={styles.headerTitle}>🏆 Urutonde</Text>
        <Text style={styles.headerSub}>Leaderboard • No XP Limit!</Text>

        {/* Top 3 podium */}
        <View style={styles.podium}>
          {allUsers.slice(0, 3).map((u, i) => (
            <View key={i} style={[styles.podiumItem, i === 0 && styles.podiumFirst]}>
              <Text style={styles.podiumMedal}>{podiumIcons[i]}</Text>
              <View style={[styles.podiumAvatar, { backgroundColor: podiumColors[i] }]}>
                <Text style={styles.podiumAvatarText}>{getAvatarEmoji(u.avatar as any)}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {u.isMe ? 'You' : u.name.split(' ')[0]}
              </Text>
              <Text style={styles.podiumXP}>{u.xp.toLocaleString()} XP</Text>
              <Text style={styles.podiumTitle}>{getRankTitle(u.xp)}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current user rank */}
        <View style={[styles.myRankCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.myRankLabel, { color: colors.text }]}>Your Rank</Text>
          <View style={styles.myRankInfo}>
            <Text style={[styles.myRankNumber, { color: colors.primary }]}>
              #{meRank}
            </Text>
            <View style={styles.myRankDetails}>
              <Text style={[styles.myRankName, { color: colors.text }]}>
                {user.displayName || 'You'}
              </Text>
              <Text style={[styles.myRankXP, { color: colors.xpOrange }]}>
                ⭐ {progress.xp.toLocaleString()} XP
              </Text>
            </View>
            <Text style={styles.myRankAvatar}>{getAvatarEmoji(user.avatar)}</Text>
          </View>
        </View>

        <Text style={[styles.listTitle, { color: colors.textSecondary }]}>
          All Learners • Ranked by XP (No Limit)
        </Text>

        {allUsers.length === 1 && (
          <View style={[styles.row, { backgroundColor: colors.card }]}>
            <Text style={[styles.rowName, { color: colors.text }]}>
              🌱 Nta munyeshuri undi ku rutonde gihe cyo he! Koresha ibyigwa ubone XP — nabo bakaza.
            </Text>
          </View>
        )}

        {allUsers.map((u, i) => (
          <View
            key={i}
            style={[
              styles.row, 
              { backgroundColor: colors.card },
              u.isMe && { borderColor: colors.primary, borderWidth: 2 }
            ]}
          >
            <Text style={[styles.rank, { color: i < 3 ? '#FFD700' : colors.textMuted }]}>
              #{i + 1}
            </Text>
            <View style={[styles.avatar, { 
              backgroundColor: i < 3 ? podiumColors[i] : colors.border 
            }]}>
              <Text style={styles.avatarText}>{getAvatarEmoji(u.avatar as any)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowName, { color: u.isMe ? colors.primary : colors.text }]}>
                {u.isMe ? `${u.name} (You)` : u.name}
              </Text>
              <Text style={[styles.rowStreak, { color: colors.textMuted }]}>
                🔥 {u.streak} day streak • {getRankTitle(u.xp)}
              </Text>
            </View>
            <View style={styles.rowXPContainer}>
              <Text style={[styles.rowXP, { color: colors.xpOrange }]}>
                ⭐ {u.xp.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(0,0,0,0.6)', marginBottom: 20 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  podiumItem: { alignItems: 'center', width: 85 },
  podiumFirst: { marginBottom: 10 },
  podiumMedal: { fontSize: 24, marginBottom: 4 },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarText: { fontSize: 26 },
  podiumName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginTop: 4 },
  podiumXP: { fontSize: 11, fontWeight: '700', color: '#1A1A1A' },
  podiumTitle: { fontSize: 9, color: 'rgba(0,0,0,0.6)', marginTop: 2 },
  scroll: { flex: 1 },
  myRankCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  myRankLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  myRankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  myRankNumber: { fontSize: 28, fontWeight: '900' },
  myRankDetails: { flex: 1 },
  myRankName: { fontSize: 16, fontWeight: '700' },
  myRankXP: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  myRankAvatar: { fontSize: 36 },
  listTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  rank: { width: 32, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },
  rowName: { fontSize: 14, fontWeight: '700' },
  rowStreak: { fontSize: 11, marginTop: 2 },
  rowXPContainer: {
    alignItems: 'flex-end',
  },
  rowXP: { fontSize: 14, fontWeight: '800' },
});
