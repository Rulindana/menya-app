import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Text } from './ui/AppText';
import { AppIcon } from './ui/AppIcon';
import { Colors, Radius } from '../theme/colors';
import { AvatarId, useAppStore } from '../store/useAppStore';

export const AVATARS: {
  id: AvatarId;
  icon: string;
  tint: string;
  color: string;
  label: string;
  unlockXP: number;
  description: string;
}[] = [
  { id: 'gorilla', icon: 'smile', tint: '#E4F2F6', color: '#0B6E84', label: 'Gorilla', unlockXP: 0, description: 'Default avatar' },
  { id: 'flag', icon: 'flag', tint: '#E6F6EE', color: '#2F9E6E', label: 'Rwanda Flag', unlockXP: 0, description: 'Pride of Rwanda' },
  { id: 'heart', icon: 'heart', tint: '#FCEAEA', color: '#D64545', label: 'Green Heart', unlockXP: 0, description: 'Love Rwanda' },
  { id: 'hills', icon: 'mountain', tint: '#FBF3E3', color: '#C9891C', label: 'Rwanda Hills', unlockXP: 50, description: 'Beautiful hills' },
  { id: 'lake', icon: 'waves', tint: '#E8F1FA', color: '#2B6CB0', label: 'Lake Kivu', unlockXP: 100, description: 'Serene lake' },
  { id: 'mountain', icon: 'mountainSnow', tint: '#F1ECFA', color: '#7C5CBF', label: 'Volcanoes', unlockXP: 200, description: 'Mountain gorillas' },
  { id: 'sun', icon: 'sun', tint: '#FBF3E3', color: '#C9891C', label: 'Rwanda Sun', unlockXP: 300, description: 'Warm sunshine' },
  { id: 'drum', icon: 'music', tint: '#F9EAF1', color: '#C05C8A', label: 'Inzomba Drum', unlockXP: 500, description: 'Traditional drums' },
  { id: 'coffee', icon: 'coffee', tint: '#FBF1E3', color: '#A56B2A', label: 'Rwandan Coffee', unlockXP: 750, description: 'World-class coffee' },
  { id: 'basket', icon: 'shoppingBag', tint: '#FBF3E3', color: '#C9891C', label: 'Agaseke Basket', unlockXP: 1000, description: 'Traditional craft' },
  { id: 'cow', icon: 'milk', tint: '#E4F2F6', color: '#0B6E84', label: 'Inyambo Cow', unlockXP: 1500, description: 'Sacred long-horn cow' },
  { id: 'champion', icon: 'trophy', tint: '#FBF3E3', color: '#C9891C', label: 'Champion', unlockXP: 2000, description: 'True champion' },
  { id: 'king', icon: 'crown', tint: '#FBF3E3', color: '#C9891C', label: 'Umwanzi', unlockXP: 3000, description: 'King of learning' },
  { id: 'diamond', icon: 'gem', tint: '#E8F1FA', color: '#2B6CB0', label: 'Diamond', unlockXP: 5000, description: 'Rare & precious' },
  { id: 'rocket', icon: 'rocket', tint: '#F1ECFA', color: '#7C5CBF', label: 'Mushya', unlockXP: 7000, description: 'To the moon!' },
  { id: 'legend', icon: 'star', tint: '#FBF3E3', color: '#C9891C', label: 'Legend', unlockXP: 10000, description: 'Living legend' },
];

export const getAvatarIcon = (id: AvatarId): string =>
  AVATARS.find((avatar) => avatar.id === id)?.icon ?? 'smile';

export const getAvatarTint = (id: AvatarId): string =>
  AVATARS.find((avatar) => avatar.id === id)?.tint ?? '#E4F2F6';

export const getAvatarColor = (id: AvatarId): string =>
  AVATARS.find((avatar) => avatar.id === id)?.color ?? '#0B6E84';

interface AvatarBadgeProps {
  id: AvatarId;
  size?: number;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({ id, size = 40 }) => (
  <View
    style={[
      styles.avatarBadge,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: getAvatarTint(id),
      },
    ]}
  >
    <AppIcon name={getAvatarIcon(id)} size={size * 0.5} color={getAvatarColor(id)} />
  </View>
);

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ visible, onClose }) => {
  const { progress, user, setAvatar } = useAppStore();

  const getXPBonus = (xp: number): number => {
    if (xp >= 10000) return 50;
    if (xp >= 5000) return 30;
    if (xp >= 3000) return 20;
    if (xp >= 2000) return 15;
    if (xp >= 1500) return 10;
    if (xp >= 1000) return 5;
    if (xp >= 500) return 3;
    return 0;
  };

  const xpBonus = getXPBonus(progress.xp);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose your avatar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
              <AppIcon name="close" size={22} color={Colors.textMid} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Unlock more avatars by earning XP.
          </Text>

          {xpBonus > 0 && (
            <View style={styles.bonusCard}>
              <AppIcon name="star1" size={16} color={Colors.yellow} />
              <Text style={styles.bonusText}>XP bonus: +{xpBonus} XP per lesson</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {AVATARS.map((avatar) => {
                const unlocked = progress.xp >= avatar.unlockXP;
                const selected = user.avatar === avatar.id;

                return (
                  <TouchableOpacity
                    key={avatar.id}
                    style={[
                      styles.avatarCard,
                      selected && styles.avatarSelected,
                      !unlocked && styles.avatarLocked,
                    ]}
                    onPress={() => {
                      if (unlocked) {
                        setAvatar(avatar.id);
                        onClose();
                      }
                    }}
                    disabled={!unlocked}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.avatarIcon, { backgroundColor: avatar.tint }]}>
                      <AppIcon name={avatar.icon} size={28} color={avatar.color} />
                    </View>
                    <Text style={[styles.avatarLabel, !unlocked && { color: Colors.textLight }]}>
                      {avatar.label}
                    </Text>
                    <Text style={styles.avatarDesc} numberOfLines={1}>
                      {avatar.description}
                    </Text>

                    {!unlocked && (
                      <View style={styles.lockBadge}>
                        <AppIcon name="lock" size={10} color={Colors.textDark} />
                        <Text style={styles.lockText}>{avatar.unlockXP} XP</Text>
                      </View>
                    )}

                    {selected && (
                      <View style={styles.selectedBadge}>
                        <AppIcon name="check" size={11} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  avatarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12,28,36,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  closeBtn: { padding: 4 },
  subtitle: { fontSize: 13, color: Colors.textMid, marginBottom: 12 },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.yellowLight,
    padding: 10,
    borderRadius: Radius.sm,
    marginBottom: 16,
    gap: 8,
  },
  bonusText: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '31%',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  avatarSelected: {
    borderColor: Colors.teal,
    backgroundColor: Colors.tealLight,
  },
  avatarLocked: { opacity: 0.6 },
  avatarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarLabel: { fontSize: 11, fontWeight: '700', color: Colors.textDark, textAlign: 'center' },
  avatarDesc: { fontSize: 9, color: Colors.textMid, textAlign: 'center', marginTop: 2 },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: Colors.yellowLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 3,
  },
  lockText: { fontSize: 9, fontWeight: '600', color: Colors.textDark },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.teal,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
