import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './ui/AppText';
import { AppIcon } from './ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { AppUpdateInfo } from '../services/appUpdate';

interface UpdateModalProps {
  update: AppUpdateInfo | null;
  onUpdate: () => void;
  onLater: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ update, onUpdate, onLater }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!update) return null;

  return (
    <Modal
      transparent
      visible={!!update}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onLater}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onLater} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <AppIcon name="documentDownload" size={24} color={colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>Update available</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                A newer version of Menya is ready.
              </Text>
            </View>
            <View style={[styles.versionPill, { backgroundColor: colors.primary + '16' }]}>
              <Text style={[styles.versionText, { color: colors.primary }]}>v{update.version}</Text>
            </View>
          </View>

          <ScrollView
            style={[styles.notesBox, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.notesContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.notesLabel, { color: colors.textMuted }]}>WHAT'S NEW</Text>
            <Text style={[styles.notes, { color: colors.textSecondary }]}>{update.notes}</Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.primary }]}
            onPress={onUpdate}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.updateButtonText}>Update now</Text>
            <AppIcon name="arrowRight" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={onLater} activeOpacity={0.7}>
            <Text style={[styles.laterText, { color: colors.textSecondary }]}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(12,28,36,0.55)',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 3 },
  versionPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  versionText: { fontSize: 12, fontWeight: '700' },
  notesBox: {
    maxHeight: 200,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  notesContent: {
    padding: 14,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  notes: {
    fontSize: 12.5,
    lineHeight: 19,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 52,
    borderRadius: 26,
  },
  updateButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 13,
  },
  laterText: { fontSize: 13.5, fontWeight: '600' },
});
