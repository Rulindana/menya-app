import React from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Text } from './ui/AppText';
import { useTheme } from '../theme/themeContext';
import { AppIcon } from './ui/AppIcon';

const PRIVACY_POLICY_URL = 'https://sites.google.com/view/menya-ikinyarwanda';

export const Footer: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <TouchableOpacity onPress={() => Linking.openURL('https://runirw.com')} activeOpacity={0.7}>
        <Text style={[styles.text, { color: colors.textMuted }]}>
          Powered by{' '}
          <Text style={[styles.brand, { color: colors.primary }]}>Runi RW</Text>
        </Text>
        <Text style={[styles.url, { color: colors.textMuted }]}>runirw.com</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        activeOpacity={0.7}
        style={styles.privacyBtn}
      >
        <View style={styles.privacyRow}>
          <AppIcon name="lock" size={12} color={colors.textMuted} />
          <Text style={[styles.privacyText, { color: colors.textMuted }]}>
            Privacy Policy
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 20,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  brand: {
    fontWeight: '800',
    fontSize: 14,
  },
  url: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
    textAlign: 'center',
  },
  privacyBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  privacyText: {
    fontSize: 12,
    textDecorationLine: 'underline',
    opacity: 0.7,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
