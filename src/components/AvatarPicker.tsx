import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { AppIcon } from './ui/AppIcon';
import { Colors, Radius, Shadow } from '../theme/colors';
import { AvatarId, useAppStore } from '../store/useAppStore';

export const AVATARS: { id: AvatarId; emoji: string; label: string; unlockXP: number; description: string }[] = [
  // Free avatars
  { id: 'gorilla', emoji: '🦍', label: 'Gorilla', unlockXP: 0, description: 'Default avatar' },
  { id: 'flag', emoji: '🇷🇼', label: 'Rwanda Flag', unlockXP: 0, description: 'Pride of Rwanda' },
  { id: 'heart', emoji: '💚', label: 'Green Heart', unlockXP: 0, description: 'Love Rwanda' },
  
  // XP unlock avatars (progressive)
  { id: 'hills', emoji: '🌄', label: 'Rwanda Hills', unlockXP: 50, description: 'Beautiful hills' },
  { id: 'lake', emoji: '🏞️', label: 'Lake Kivu', unlockXP: 100, description: 'Serene lake' },
  { id: 'mountain', emoji: '🏔️', label: 'Volcanoes', unlockXP: 200, description: 'Mountain gorillas' },
  { id: 'sun', emoji: '☀️', label: 'Rwanda Sun', unlockXP: 300, description: 'Warm sunshine' },
  { id: 'drum', emoji: '🥁', label: 'Inzomba Drum', unlockXP: 500, description: 'Traditional drums' },
  
  // High XP avatars
  { id: 'coffee', emoji: '☕', label: 'Rwandan Coffee', unlockXP: 750, description: 'World-class coffee' },
  { id: 'basket', emoji: '🧺', label: 'Agaseke Basket', unlockXP: 1000, description: 'Traditional craft' },
  { id: 'cow', emoji: '🐄', label: 'Inyambo Cow', unlockXP: 1500, description: 'Sacred long-horn cow' },
  { id: 'champion', emoji: '🏆', label: 'Champion', unlockXP: 2000, description: 'True champion' },
  { id: 'king', emoji: '👑', label: 'Umwanzi', unlockXP: 3000, description: 'King of learning' },
  { id: 'diamond', emoji: '💎', label: 'Diamond', unlockXP: 5000, description: 'Rare & precious' },
  { id: 'rocket', emoji: '🚀', label: 'Mushya', unlockXP: 7000, description: 'To the moon!' },
  { id: 'legend', emoji: '🌟', label: 'Legend', unlockXP: 10000, description: 'Living legend' },
];

export const getAvatarEmoji = (id: AvatarId): string =>
  AVATARS.find((a) => a.id === id)?.emoji ?? '🦍';

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ visible, onClose }) => {
  const { progress, user, setAvatar } = useAppStore();

  // Calculate XP bonus based on total XP
  const getXPBonus = (xp: number): number => {
    if (xp >= 10000) return 50; // 50 XP bonus per lesson
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
            <Text style={styles.title}>Hitamo Ifoto / Choose Avatar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={22} color={Colors.textMid} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Unlock more avatars by earning XP! 🌟
          </Text>

          {/* XP Bonus Display */}
          {xpBonus > 0 && (
            <View style={styles.bonusCard}>
              <AppIcon name="star1" size={16} color={Colors.yellow} />
              <Text style={styles.bonusText}>
                🎉 XP Bonus: +{xpBonus} XP per lesson!
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {AVATARS.map((av) => {
                const unlocked = progress.xp >= av.unlockXP;
                const selected = user.avatar === av.id;
                const nextUnlock = !unlocked && av.unlockXP;
                
                return (
                  <TouchableOpacity
                    key={av.id}
                    style={[
                      styles.avatarCard,
                      selected && styles.avatarSelected,
                      !unlocked && styles.avatarLocked,
                    ]}
                    onPress={() => {
                      if (unlocked) {
                        setAvatar(av.id);
                        onClose();
                      }
                    }}
                    disabled={!unlocked}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    <Text style={[styles.avatarLabel, !unlocked && { color: Colors.textLight }]}>
                      {av.label}
                    </Text>
                    <Text style={styles.avatarDesc} numberOfLines={1}>
                      {av.description}
                    </Text>
                    
                    {!unlocked && (
                      <View style={styles.lockBadge}>
                        <AppIcon name="lock" size={10} color={Colors.textDark} />
                        <Text style={styles.lockText}>{av.unlockXP} XP</Text>
                      </View>
                    )}
                    
                    {selected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                    
                    {/* Show progress to next unlock */}
                    {!unlocked && nextUnlock && (
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${Math.min((progress.xp / nextUnlock) * 100, 100)}%` }
                          ]} 
                        />
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    borderColor: Colors.green,
    backgroundColor: Colors.correctLight,
  },
  avatarLocked: { opacity: 0.6 },
  avatarEmoji: { fontSize: 36, marginBottom: 4 },
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
    backgroundColor: Colors.green,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: { fontSize: 10, color: Colors.white, fontWeight: '900' },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 2,
  },
});
