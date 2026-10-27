import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Text } from './ui/AppText';
import { AppIcon } from './ui/AppIcon';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/themeContext';
import { AvatarId, useAppStore, getXPBonus } from '../store/useAppStore';

export const AVATARS: {
  id: AvatarId;
  emoji: string;
  icon: string;
  tint: string;
  color: string;
  label: string;
  unlockXP: number;
  description: string;
}[] = [
  { id: 'gorilla', emoji: '🦍', icon: 'smile', tint: '#E4F2F6', color: '#0B6E84', label: 'Gorilla', unlockXP: 0, description: 'Default avatar' },
  { id: 'flag', emoji: '🇷🇼', icon: 'flag', tint: '#E6F6EE', color: '#2F9E6E', label: 'Rwanda Flag', unlockXP: 0, description: 'Pride of Rwanda' },
  { id: 'heart', emoji: '💚', icon: 'heart', tint: '#FCEAEA', color: '#D64545', label: 'Green Heart', unlockXP: 0, description: 'Love Rwanda' },
  { id: 'hills', emoji: '⛰️', icon: 'mountain', tint: '#FBF3E3', color: '#C9891C', label: 'Rwanda Hills', unlockXP: 50, description: 'Beautiful hills' },
  { id: 'lake', emoji: '🌊', icon: 'waves', tint: '#E8F1FA', color: '#2B6CB0', label: 'Lake Kivu', unlockXP: 100, description: 'Serene lake' },
  { id: 'mountain', emoji: '🌋', icon: 'mountainSnow', tint: '#F1ECFA', color: '#7C5CBF', label: 'Volcanoes', unlockXP: 200, description: 'Mountain gorillas' },
  { id: 'sun', emoji: '☀️', icon: 'sun', tint: '#FBF3E3', color: '#C9891C', label: 'Rwanda Sun', unlockXP: 300, description: 'Warm sunshine' },
  { id: 'drum', emoji: '🥁', icon: 'music', tint: '#F9EAF1', color: '#C05C8A', label: 'Ingoma Drum', unlockXP: 500, description: 'Traditional drums' },
  { id: 'coffee', emoji: '☕', icon: 'coffee', tint: '#FBF1E3', color: '#A56B2A', label: 'Rwandan Coffee', unlockXP: 750, description: 'World-class coffee' },
  { id: 'basket', emoji: '🧺', icon: 'shoppingBag', tint: '#FBF3E3', color: '#C9891C', label: 'Agaseke Basket', unlockXP: 1000, description: 'Traditional craft' },
  { id: 'cow', emoji: '🐄', icon: 'milk', tint: '#E4F2F6', color: '#0B6E84', label: 'Inyambo Cow', unlockXP: 1500, description: 'Sacred long-horn cow' },
  { id: 'champion', emoji: '🏆', icon: 'trophy', tint: '#FBF3E3', color: '#C9891C', label: 'Champion', unlockXP: 2000, description: 'True champion' },
  { id: 'king', emoji: '👑', icon: 'crown', tint: '#FBF3E3', color: '#C9891C', label: 'Umwami', unlockXP: 3000, description: 'King of learning' },
  { id: 'diamond', emoji: '💎', icon: 'gem', tint: '#E8F1FA', color: '#2B6CB0', label: 'Diamond', unlockXP: 5000, description: 'Rare & precious' },
  { id: 'rocket', emoji: '🚀', icon: 'rocket', tint: '#F1ECFA', color: '#7C5CBF', label: 'Mushya', unlockXP: 7000, description: 'To the moon!' },
  { id: 'legend', emoji: '🌟', icon: 'star', tint: '#FBF3E3', color: '#C9891C', label: 'Legend', unlockXP: 10000, description: 'Living legend' },
];

export const QUICK_EMOJIS: { id: string; emoji: string; label: string; tint: string }[] = [
  { id: 'emoji_lion', emoji: '🦁', label: 'Intare', tint: '#FBF3E3' },
  { id: 'emoji_smile', emoji: '😊', label: 'Ibyishimo', tint: '#E6F6EE' },
  { id: 'emoji_fire', emoji: '🔥', label: 'Umuriro', tint: '#FCEAEA' },
  { id: 'emoji_book', emoji: '📚', label: 'Igitabo', tint: '#E8F1FA' },
  { id: 'emoji_target', emoji: '🎯', label: 'Intego', tint: '#F9EAF1' },
  { id: 'emoji_earth', emoji: '🌍', label: 'Isi', tint: '#E4F2F6' },
  { id: 'emoji_eagle', emoji: '🦅', label: 'Kagoma', tint: '#FBF1E3' },
  { id: 'emoji_flower', emoji: '🌺', label: 'Ururabo', tint: '#F9EAF1' },
  { id: 'emoji_bolt', emoji: '⚡', label: 'Imbaraga', tint: '#FBF3E3' },
  { id: 'emoji_grad', emoji: '🎓', label: 'Umunyeshuri', tint: '#F1ECFA' },
  { id: 'emoji_music', emoji: '🎶', label: 'Indirimbo', tint: '#E8F1FA' },
  { id: 'emoji_strong', emoji: '💪', label: 'Komera', tint: '#E6F6EE' },
];

export const getAvatarIcon = (id: AvatarId): string =>
  AVATARS.find((avatar) => avatar.id === id)?.icon ?? 'smile';

export const getAvatarEmoji = (id: AvatarId): string => {
  const foundAvatar = AVATARS.find((avatar) => avatar.id === id);
  if (foundAvatar) return foundAvatar.emoji;
  const foundQuick = QUICK_EMOJIS.find((item) => item.id === id || item.emoji === id);
  if (foundQuick) return foundQuick.emoji;
  // If id itself is a raw emoji character, return it directly
  if (id && !/^[a-z0-9_]+$/i.test(id)) return id;
  return '🦍';
};

export const getAvatarTint = (id: AvatarId): string => {
  const foundAvatar = AVATARS.find((avatar) => avatar.id === id);
  if (foundAvatar) return foundAvatar.tint;
  const foundQuick = QUICK_EMOJIS.find((item) => item.id === id || item.emoji === id);
  if (foundQuick) return foundQuick.tint;
  return '#E4F2F6';
};

export const getAvatarColor = (id: AvatarId): string =>
  AVATARS.find((avatar) => avatar.id === id)?.color ?? '#0B6E84';

export const persistAvatarPhotoUri = async (
  rawUri: string,
  uid?: string | null
): Promise<string> => {
  try {
    if (!FileSystem.documentDirectory) return rawUri;
    const cleanPath = rawUri.split('?')[0];
    const extCandidate = cleanPath.split('.').pop()?.toLowerCase();
    const extension =
      extCandidate && ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extCandidate)
        ? extCandidate
        : 'jpg';
    const destination = `${FileSystem.documentDirectory}avatar_${uid || 'user'}_${Date.now()}.${extension}`;
    await FileSystem.copyAsync({ from: rawUri, to: destination });
    return destination;
  } catch {
    return rawUri;
  }
};

interface AvatarBadgeProps {
  id?: AvatarId;
  photoUri?: string | null;
  size?: number;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  id = 'gorilla',
  photoUri,
  size = 40,
}) => {
  const [imageError, setImageError] = useState(false);

  if (photoUri && !imageError) {
    return (
      <Image
        key={photoUri}
        source={{ uri: photoUri }}
        onError={() => setImageError(true)}
        style={[
          styles.avatarImage,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  const emoji = getAvatarEmoji(id);

  return (
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
      <Text
        style={{
          fontSize: Math.round(size * 0.52),
          lineHeight: Math.round(size * 0.64),
          textAlign: 'center',
        }}
      >
        {emoji}
      </Text>
    </View>
  );
};

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ visible, onClose }) => {
  const { progress, user, setAvatar, setPhotoUri } = useAppStore();
  const { colors } = useTheme();
  const xpBonus = getXPBonus(progress.xp);
  const [busyPhoto, setBusyPhoto] = useState(false);

  const handlePickImage = async (source: 'camera' | 'library') => {
    if (busyPhoto) return;
    setBusyPhoto(true);
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== 'granted') {
          setBusyPhoto(false);
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          const savedUri = await persistAvatarPhotoUri(result.assets[0].uri, user.uid);
          setPhotoUri(savedUri);
          setBusyPhoto(false);
          onClose();
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') {
          setBusyPhoto(false);
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          const savedUri = await persistAvatarPhotoUri(result.assets[0].uri, user.uid);
          setPhotoUri(savedUri);
          setBusyPhoto(false);
          onClose();
          return;
        }
      }
    } catch {
      // Ignore picker cancellation/errors
    }
    setBusyPhoto(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View style={styles.headerPreviewRow}>
              <AvatarBadge id={user.avatar} photoUri={user.photoUri} size={44} />
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Choose your avatar</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Pick a photo or emoji — shown across all screens
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
              <AppIcon name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. Custom Image Avatar Picker (Gallery / Camera) */}
            <View
              style={[
                styles.photoSectionCard,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              <View style={styles.photoSectionHeader}>
                <AppIcon name="camera" size={18} color={colors.primary} />
                <Text style={[styles.sectionHeading, { color: colors.text }]}>
                  Custom Photo Avatar
                </Text>
                {user.photoUri && (
                  <View style={[styles.activeTag, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.activeTagText, { color: colors.success }]}>Active</Text>
                  </View>
                )}
              </View>
              <View style={styles.photoButtonsRow}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handlePickImage('library')}
                  disabled={busyPhoto}
                  activeOpacity={0.8}
                >
                  <AppIcon name="image" size={16} color="#FFFFFF" />
                  <Text style={styles.photoActionBtnText}>Pick from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.photoActionBtn,
                    {
                      backgroundColor: colors.card,
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handlePickImage('camera')}
                  disabled={busyPhoto}
                  activeOpacity={0.8}
                >
                  <AppIcon name="camera" size={16} color={colors.primary} />
                  <Text style={[styles.photoActionBtnText, { color: colors.primary }]}>
                    Take Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Instant Emoji Avatars */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Emoji Avatars
            </Text>
            <View style={styles.quickEmojiGrid}>
              {QUICK_EMOJIS.map((item) => {
                const isSelected = !user.photoUri && user.avatar === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.quickEmojiChip,
                      {
                        backgroundColor: isSelected ? colors.primaryLight : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setAvatar(item.id);
                      onClose();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.quickEmojiText}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.quickEmojiLabel,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Rwandan Cultural & XP Avatars */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 18 }]}>
              Rwanda Cultural Avatars (Unlock with XP)
            </Text>

            {xpBonus > 0 && (
              <View style={[styles.bonusCard, { backgroundColor: colors.secondary + '18' }]}>
                <AppIcon name="star1" size={16} color={colors.secondary} />
                <Text style={[styles.bonusText, { color: colors.text }]}>
                  XP bonus: +{xpBonus} XP per lesson
                </Text>
              </View>
            )}

            <View style={styles.grid}>
              {AVATARS.map((avatar) => {
                const unlocked = progress.xp >= avatar.unlockXP;
                const selected = !user.photoUri && user.avatar === avatar.id;

                return (
                  <TouchableOpacity
                    key={avatar.id}
                    style={[
                      styles.avatarCard,
                      {
                        backgroundColor: selected ? colors.primaryLight : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
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
                      <Text style={styles.avatarEmojiText}>{avatar.emoji}</Text>
                    </View>
                    <Text
                      style={[
                        styles.avatarLabel,
                        { color: unlocked ? colors.text : colors.textMuted },
                      ]}
                    >
                      {avatar.label}
                    </Text>
                    <Text
                      style={[styles.avatarDesc, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {avatar.description}
                    </Text>

                    {!unlocked && (
                      <View style={[styles.lockBadge, { backgroundColor: colors.secondary + '22' }]}>
                        <AppIcon name="lock" size={10} color={colors.secondary} />
                        <Text style={[styles.lockText, { color: colors.secondary }]}>
                          {avatar.unlockXP} XP
                        </Text>
                      </View>
                    )}

                    {selected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                        <AppIcon name="check" size={11} color="#FFFFFF" />
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
    overflow: 'hidden',
  },
  avatarImage: {
    resizeMode: 'cover',
    borderWidth: 1.5,
    borderColor: 'rgba(11,110,132,0.28)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12,28,36,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: { fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 4 },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  photoSectionCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTagText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  photoActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  quickEmojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  quickEmojiChip: {
    width: '23%',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  quickEmojiText: {
    fontSize: 24,
    lineHeight: 29,
  },
  quickEmojiLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.sm,
    marginBottom: 12,
    gap: 8,
  },
  bonusText: { fontSize: 13, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '31%',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
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
  avatarEmojiText: {
    fontSize: 25,
    lineHeight: 30,
  },
  avatarLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  avatarDesc: { fontSize: 9, textAlign: 'center', marginTop: 2 },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 3,
  },
  lockText: { fontSize: 9, fontWeight: '700' },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
