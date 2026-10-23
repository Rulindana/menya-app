import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { AvatarBadge } from '../components/AvatarPicker';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { subscribeToLeaderboard, LeaderboardEntry } from '../firebase/syncService';

const podiumColors = ['#C9891C', '#8A99A5', '#A67C52'];

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
    const unsubscribe = subscribeToLeaderboard((entries) => setRemoteUsers(entries));
    return () => unsubscribe();
  }, [user.isLoggedIn, user.uid]);

  const allUsers: RowUser[] = [
    ...remoteUsers
      .filter((entry) => entry.uid !== user.uid)
      .map((entry) => ({
        uid: entry.uid,
        name: entry.name,
        xp: entry.xp,
        streak: entry.streak,
        avatar: entry.avatar || 'gorilla',
        isMe: false,
      })),
    {
      uid: user.uid || 'me',
      name: user.displayName || 'You',
      xp: progress.xp,
      streak: progress.streak,
      avatar: user.avatar,
      isMe: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  const meRank = allUsers.findIndex((entry) => entry.isMe) + 1;
  const podium = allUsers.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTitleRow}>
          <AppIcon name="trophy" size={22} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Urutonde</Text>
        </View>
        <Text style={styles.headerSub}>Leaderboard · ranked by XP</Text>

        <View style={styles.podium}>
          {podium.map((entry, index) => (
            <View
              key={entry.uid}
              style={[styles.podiumItem, index === 0 && styles.podiumFirst]}
            >
              <View style={[styles.podiumAvatarRing, { borderColor: podiumColors[index] }]}>
                <AvatarBadge id={entry.avatar as any} size={52} />
              </View>
              <View style={styles.medalRow}>
                <AppIcon name="medal" size={14} color={podiumColors[index]} />
                <Text style={styles.podiumPlace}>#{index + 1}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {entry.isMe ? 'You' : entry.name.split(' ')[0]}
              </Text>
              <Text style={styles.podiumXP}>{entry.xp.toLocaleString()} XP</Text>
              <Text style={styles.podiumTitle}>{getRankTitle(entry.xp)}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.myRankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.myRankLabel, { color: colors.textSecondary }]}>YOUR RANK</Text>
          <View style={styles.myRankInfo}>
            <Text style={[styles.myRankNumber, { color: colors.primary }]}>#{meRank}</Text>
            <AvatarBadge id={user.avatar} size={44} />
            <View style={styles.myRankDetails}>
              <Text style={[styles.myRankName, { color: colors.text }]}>
                {user.displayName || 'You'}
              </Text>
              <View style={styles.inlineStat}>
                <AppIcon name="star" size={13} color={colors.xpOrange} />
                <Text style={[styles.myRankXP, { color: colors.textSecondary }]}>
                  {progress.xp.toLocaleString()} XP
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.listTitle, { color: colors.textSecondary }]}>
          ALL LEARNERS
        </Text>

        {allUsers.length === 1 && (
          <View style={[styles.row, { backgroundColor: colors.card }]}>
            <AppIcon name="users" size={22} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No other learners yet. Practice today and invite a friend.
            </Text>
          </View>
        )}

        {allUsers.map((entry, index) => (
          <View
            key={entry.uid}
            style={[
              styles.row,
              { backgroundColor: colors.card },
              entry.isMe && { borderColor: colors.primary, borderWidth: 1.5 },
            ]}
          >
            <Text style={[styles.rank, { color: index < 3 ? colors.xpOrange : colors.textMuted }]}>
              #{index + 1}
            </Text>
            <AvatarBadge id={entry.avatar as any} size={42} />
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, { color: entry.isMe ? colors.primary : colors.text }]}>
                {entry.isMe ? `${entry.name} (You)` : entry.name}
              </Text>
              <View style={styles.inlineStat}>
                <AppIcon name="flame" size={12} color={colors.textMuted} />
                <Text style={[styles.rowStreak, { color: colors.textMuted }]}>
                  {entry.streak} day streak · {getRankTitle(entry.xp)}
                </Text>
              </View>
            </View>
            <View style={styles.rowXPContainer}>
              <AppIcon name="star" size={13} color={colors.xpOrange} />
              <Text style={[styles.rowXP, { color: colors.xpOrange }]}>
                {entry.xp.toLocaleString()}
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
  headerSub: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12 },
  podiumItem: { alignItems: 'center', width: 88 },
  podiumFirst: { marginBottom: 12 },
  podiumAvatarRing: {
    borderWidth: 2,
    borderRadius: 32,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  medalRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 7 },
  podiumPlace: { fontSize: 10.5, fontWeight: '800', color: '#FFFFFF' },
  podiumName: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginTop: 3 },
  podiumXP: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  podiumTitle: { fontSize: 9.5, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  scroll: { flex: 1 },
  myRankCard: {
    margin: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  myRankLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  myRankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  myRankNumber: { fontSize: 26, fontWeight: '900', minWidth: 48 },
  myRankDetails: { flex: 1 },
  myRankName: { fontSize: 16, fontWeight: '700' },
  myRankXP: { fontSize: 13, fontWeight: '600' },
  inlineStat: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  listTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rank: { width: 32, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '700' },
  rowStreak: { fontSize: 11 },
  rowXPContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowXP: { fontSize: 13.5, fontWeight: '800' },
  emptyText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
