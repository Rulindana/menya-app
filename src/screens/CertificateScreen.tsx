import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAppStore } from '../store/useAppStore';
import { getTotalLessons } from '../data/lessons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import QRCode from 'react-native-qrcode-svg';
import { buildCertificateHtml } from '../utils/certificateHtml';

// ── Generate a unique cert ID from uid + date ──
const makeCertId = (uid: string | null, earnedAt: string | undefined): string => {
  const base = uid ? uid.slice(0, 8).toUpperCase() : 'GUEST001';
  const year = earnedAt ? new Date(earnedAt).getFullYear() : new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000 + 10000);
  return `MK${year}${base}${random}`;
};

// ── Convert local image URI to base64 data URI ──
const uriToBase64 = async (uri: string | null): Promise<string> => {
  if (!uri) return '';
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return '';
  }
};

export const CertificateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, progress, certificate } = useAppStore();
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [qrSvgRef, setQrSvgRef] = useState<any>(null);

  const totalLessons = getTotalLessons();
  const completedLessons = progress.completedLessons.length;
  // Strict gate: ALL lessons must be done — ignore certificate.earned flag
  const allDone = completedLessons >= totalLessons;

  // ── Badge tier based on % of lessons completed perfectly ──
  const perfectCount = progress.perfectLessons?.length ?? 0;
  const perfectPct = totalLessons > 0 ? (perfectCount / totalLessons) * 100 : 0;
  type BadgeTier = { label: string; color: string; description: string };
  const getBadgeTier = (): BadgeTier => {
    if (perfectPct >= 100) return { label: 'GOLD', color: '#D9A441', description: 'Perfect Score — All lessons mastered!' };
    if (perfectPct >= 80)  return { label: 'SILVER', color: '#8A99A5', description: 'Excellent — 80%+ lessons mastered!' };
    if (perfectPct >= 60)  return { label: 'BRONZE', color: '#A67C52', description: 'Good — 60%+ lessons mastered!' };
    return { label: 'REPEAT', color: '#D64545', description: 'Keep practising — repeat to earn a higher badge!' };
  };
  const badge = getBadgeTier();

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Stable cert ID — stored in certificate.earnedAt timestamp
  const [certId] = useState(() => makeCertId(user.uid, certificate.earnedAt));

  // QR code content — self-contained Menya cert data (no external URL needed)
  // Encoded as JSON so the in-app QR scanner can verify and display it
  const [qrValue, setQrValue] = useState(`{"menya":true,"name":"${user.displayName || 'Umunyeshuri'}","age":${user.age || 0},"certId":"${certId}","date":"${today}"}`);

  // Store photo URI locally so QR scanner can retrieve full photo by certId
  useEffect(() => {
    if (user.photoUri && certId) {
      // Save mapping: certId -> photoUri for local QR verification
      const key = `menya_cert_photo_${certId}`;
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem(key, user.photoUri!).catch(() => {});
      });
    }
  }, [certId, user.photoUri]);

  // If we have a photo, embed a small thumbnail as base64 in the QR data.
  // We keep it tiny (60x60, quality 0.3) so the QR stays scannable.
  useEffect(() => {
    const buildQR = async () => {
      const data: Record<string, any> = {
        menya: true,
        name: user.displayName || 'Umunyeshuri',
        age: user.age || 0,
        certId,
        date: today,
      };

      if (user.photoUri) {
        try {
          // Read photo and embed as compact base64 (no resize lib needed —
          // we just read the file; the photo was already saved at 0.8 quality
          // and 1:1 crop so it is already reasonable in size)
          const base64 = await FileSystem.readAsStringAsync(user.photoUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // Only embed if small enough (< 1500 chars) to keep QR scannable
          if (base64.length < 1500) {
            const ext = user.photoUri.split('.').pop()?.toLowerCase() || 'jpeg';
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
            data.photo = `data:${mime};base64,${base64}`;
          } else {
            data.hasPhoto = true;
          }
        } catch {
          data.hasPhoto = !!user.photoUri;
        }
      }

      setQrValue(JSON.stringify(data));
    };
    buildQR();
  }, [user.displayName, certId, user.photoUri]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Generate and save/share PDF ──
  const generatePdf = async (): Promise<string | null> => {
    try {
      // Convert profile photo to base64
      const photoBase64 = await uriToBase64(user.photoUri || null);

      // Get QR code as base64 PNG via SVG ref
      let qrDataUrl = '';
      if (qrSvgRef) {
        await new Promise<void>((resolve) => {
          qrSvgRef.toDataURL((dataUrl: string) => {
            qrDataUrl = `data:image/png;base64,${dataUrl}`;
            resolve();
          });
        });
      }

      const html = await buildCertificateHtml({
        name: user.displayName || 'Umunyeshuri',
        certId,
        dateIssued: today,
        xp: progress.xp,
        level: progress.level,
        streak: progress.streak,
        lessonsCompleted: completedLessons,
        totalLessons,
        perfectCount,
        perfectPct,
        badgeLabel: badge.label,
        badgeColor: badge.color,
        badgeDescription: badge.description,
        photoBase64,
        qrDataUrl,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        width: 595,   // A4 portrait width in pts (210mm)
        height: 842,  // A4 portrait height in pts (297mm)
        base64: false,
      });

      return uri;
    } catch (e) {
      console.error('PDF generation error:', e);
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const pdfUri = await generatePdf();
      if (!pdfUri) throw new Error('PDF generation failed');

      // Copy to a named permanent file
      const fileName = `Menya_Certificate_${certId}.pdf`;
      const destUri = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: pdfUri, to: destUri });

      // Share the file (this opens Save/Share dialog on Android)
      await Sharing.shareAsync(destUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Certificate PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (e: any) {
      console.error('Save error:', e);
      Alert.alert('Byanze', 'Ntashobora kubika PDF.\n' + (e?.message || ''));
    }
    setSaving(false);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const pdfUri = await generatePdf();
      if (!pdfUri) throw new Error('PDF generation failed');

      // shareAsync shares the ACTUAL FILE, not text
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Menya Certificate — ${user.displayName}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (e: any) {
      console.error('Share error:', e);
      Alert.alert('Byanze', 'Ntashobora gusangira PDF.\n' + (e?.message || ''));
    }
    setSharing(false);
  };

  // ── Locked screen if not all lessons done ──
  if (!allDone) {
    return (
      <View style={[styles.bg, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.lockedContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.lockedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.lockIconWrap, { backgroundColor: colors.primaryLight }]}>
              <AppIcon name="lock" size={30} color={colors.primary} />
            </View>
            <Text style={[styles.lockTitle, { color: colors.text }]}>
              Your certificate is almost here
            </Text>
            <Text style={[styles.lockMsg, { color: colors.textSecondary }]}>
              Complete every lesson in the learning journey to unlock your Menya certificate.
            </Text>
            <View style={[styles.lockProgressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.lockProgressFill,
                  {
                    width: `${(completedLessons / totalLessons) * 100}%` as any,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.lockProgressText, { color: colors.textMuted }]}>
              {completedLessons} of {totalLessons} lessons complete
            </Text>
            <TouchableOpacity
              style={[styles.lockButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <AppIcon name="arrowLeft" size={17} color="#FFFFFF" />
              <Text style={styles.lockButtonText}>Back to your journey</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const badgeIcon =
    badge.label === 'GOLD'
      ? 'trophy'
      : badge.label === 'SILVER'
        ? 'medal'
        : badge.label === 'BRONZE'
          ? 'award'
          : 'refresh';
  const initial = (user.displayName || 'Umunyeshuri').trim().charAt(0).toUpperCase();
  const certificateStats = [
    { label: 'TOTAL XP', value: progress.xp.toLocaleString() },
    { label: 'PERFECT', value: `${perfectCount}` },
    { label: 'DAY STREAK', value: `${progress.streak}` },
    { label: 'LEVEL', value: `${progress.level}` },
  ];

  return (
    <View style={[styles.bg, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <View style={[styles.pageIcon, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="award" size={21} color={colors.primary} />
          </View>
          <View style={styles.pageHeaderCopy}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Your certificate</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
              A record of your Kinyarwanda journey.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.badgeBanner,
            { borderColor: badge.color + '55', backgroundColor: badge.color + '10' },
          ]}
        >
          <View style={[styles.badgeIcon, { backgroundColor: badge.color + '1C' }]}>
            <AppIcon name={badgeIcon} size={22} color={badge.color} />
          </View>
          <View style={styles.badgeCopy}>
            <Text style={[styles.badgeBannerLabel, { color: badge.color }]}>
              {badge.label} CERTIFICATE
            </Text>
            <Text style={[styles.badgeBannerDesc, { color: colors.textSecondary }]}>
              {badge.description}
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.certPreview,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={styles.accentRow}>
            <View style={[styles.accentBar, { backgroundColor: '#2B6CB0' }]} />
            <View style={[styles.accentBar, styles.accentGold, { backgroundColor: '#D9A441' }]} />
            <View style={[styles.accentBar, { backgroundColor: '#2F9E6E' }]} />
          </View>

          <View style={styles.paperInner}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <AppIcon name="graduationCap" size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.brandName}>MENYA</Text>
            </View>
            <Text style={styles.paperEyebrow}>KINYARWANDA LANGUAGE PROGRAM</Text>
            <Text style={styles.paperTitle}>CERTIFICATE OF{'\n'}COMPLETION</Text>
            <View style={styles.paperRule} />
            <Text style={styles.paperCertify}>This certifies that</Text>
            <Text style={styles.paperName}>{user.displayName || 'Umunyeshuri'}</Text>
            <Text style={styles.paperStatement}>
              has successfully completed the Menya Kinyarwanda course, demonstrating
              commitment to learning the language and culture of Rwanda.
            </Text>
            <Text style={styles.paperCourse}>
              Kinyarwanda · {completedLessons}/{totalLessons} lessons
            </Text>

            <View style={styles.statsRow}>
              {certificateStats.map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.tierLine, { color: badge.color }]}>
              {badge.label} CERTIFICATE{' '}
              <Text style={styles.tierDescription}>· {badge.description}</Text>
            </Text>

            <View style={styles.sealWrap}>
              <View style={[styles.seal, { borderColor: badge.color }]}>
                <View style={[styles.sealInner, { borderColor: badge.color + '66' }]}>
                  <AppIcon name={badgeIcon} size={20} color={badge.color} />
                  <Text style={[styles.sealTier, { color: badge.color }]}>{badge.label}</Text>
                  <Text style={styles.sealLabel}>OFFICIAL MENYA</Text>
                </View>
              </View>
            </View>

            <View style={styles.paperDivider} />

            <View style={styles.bottomRow}>
              <View style={styles.photoBlock}>
                {user.photoUri ? (
                  <Image source={{ uri: user.photoUri }} style={styles.paperPhoto} />
                ) : (
                  <View style={styles.paperPhotoPlaceholder}>
                    <Text style={styles.paperPhotoInitial}>{initial}</Text>
                  </View>
                )}
                <Text style={styles.photoCaption}>STUDENT</Text>
              </View>

              <View style={styles.signatureBlock}>
                <Text style={styles.signatureName}>Runi RW</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureRole}>Menya App · runirw.com</Text>
              </View>

              <View style={styles.qrBlock}>
                <QRCode
                  value={qrValue}
                  size={52}
                  getRef={(ref) => setQrSvgRef(ref)}
                  backgroundColor="#FBF8F1"
                  color="#14212B"
                />
                <Text style={styles.qrLabel}>SCAN TO VERIFY</Text>
              </View>
            </View>

            <View style={styles.paperMetaRow}>
              <Text style={styles.paperMeta}>ID: {certId}</Text>
              <Text style={styles.paperMeta}>{today}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.pdfNoteRow}>
          <AppIcon name="fileText" size={13} color={colors.textMuted} />
          <Text style={[styles.pdfNote, { color: colors.textMuted }]}>
            A4 portrait · print-ready PDF · scannable verification
          </Text>
        </View>

        <View style={styles.actions}>
          <AnimatedButton
            style={[styles.actionBtn, { backgroundColor: colors.primary }, saving && styles.btnDisabled]}
            onPress={handleSave}
          >
            <AppIcon name="documentDownload" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>
              {saving ? 'Preparing…' : 'Save PDF'}
            </Text>
          </AnimatedButton>

          <AnimatedButton
            style={[
              styles.actionBtn,
              styles.secondaryAction,
              { backgroundColor: colors.card, borderColor: colors.border },
              sharing && styles.btnDisabled,
            ]}
            onPress={handleShare}
          >
            <AppIcon name="share" size={18} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>
              {sharing ? 'Preparing…' : 'Share PDF'}
            </Text>
          </AnimatedButton>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.7}
          >
            <AppIcon name="arrowLeft" size={15} color={colors.textSecondary} />
            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerTxt, { color: colors.textMuted }]}>
          Menya · Learn Kinyarwanda
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 36,
    alignItems: 'center',
  },

  // Locked state
  lockedContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockedCard: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  lockIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  lockMsg: {
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  lockProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  lockProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  lockProgressText: {
    fontSize: 11.5,
    marginTop: 8,
    marginBottom: 22,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 22,
    width: '100%',
  },
  lockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Page header
  pageHeader: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 14,
  },
  pageIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeaderCopy: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  pageSubtitle: { fontSize: 12.5, marginTop: 2 },

  // Badge summary
  badgeBanner: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCopy: { flex: 1 },
  badgeBannerLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  badgeBannerDesc: { fontSize: 11, lineHeight: 15, marginTop: 2 },

  // Certificate paper
  certPreview: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FBF8F1',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D9A441',
    overflow: 'hidden',
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 7,
    marginBottom: 14,
  },
  accentRow: { flexDirection: 'row', height: 5 },
  accentBar: { flex: 1 },
  accentGold: { flex: 0.55 },
  paperInner: { padding: 18 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0B6E84',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.6,
    color: '#0B6E84',
  },
  paperEyebrow: {
    fontSize: 7.5,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: '#83919D',
    textAlign: 'center',
    marginTop: 12,
  },
  paperTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#14212B',
    textAlign: 'center',
    marginTop: 4,
  },
  paperRule: {
    width: 52,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D9A441',
    alignSelf: 'center',
    marginVertical: 12,
  },
  paperCertify: {
    fontSize: 10,
    color: '#83919D',
    textAlign: 'center',
  },
  paperName: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    color: '#0B6E84',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 6,
  },
  paperStatement: {
    fontSize: 10.5,
    lineHeight: 16,
    color: '#536471',
    textAlign: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  paperCourse: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#14212B',
    textAlign: 'center',
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E3DCCB',
    marginTop: 14,
    paddingVertical: 10,
  },
  statItem: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#0B6E84' },
  statLabel: {
    fontSize: 6.5,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#83919D',
    textAlign: 'center',
    marginTop: 3,
  },
  tierLine: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 11,
    lineHeight: 13,
  },
  tierDescription: { color: '#536471', fontWeight: '500' },
  sealWrap: { alignItems: 'center', marginTop: 12 },
  seal: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  sealTier: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.8 },
  sealLabel: { fontSize: 5.5, letterSpacing: 0.8, color: '#83919D' },
  paperDivider: {
    height: 0.5,
    backgroundColor: '#E3DCCB',
    marginTop: 16,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  photoBlock: { width: 64, alignItems: 'center' },
  paperPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0B6E84',
  },
  paperPhotoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0B6E84',
    backgroundColor: '#F2F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperPhotoInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B6E84',
  },
  photoCaption: {
    fontSize: 5.5,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#83919D',
    marginTop: 4,
  },
  signatureBlock: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  signatureName: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#14212B',
  },
  signatureLine: {
    width: '86%',
    height: 0.5,
    backgroundColor: '#83919D',
    marginTop: 4,
    marginBottom: 3,
  },
  signatureRole: {
    fontSize: 6,
    color: '#536471',
    textAlign: 'center',
  },
  qrBlock: { width: 64, alignItems: 'center' },
  qrLabel: {
    fontSize: 5.5,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#83919D',
    marginTop: 3,
  },
  paperMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  paperMeta: { fontSize: 6.5, color: '#83919D' },

  pdfNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  pdfNote: { fontSize: 11, textAlign: 'center' },

  // Actions
  actions: {
    width: '100%',
    maxWidth: 440,
    gap: 10,
  },
  actionBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  secondaryAction: { borderWidth: 1 },
  btnDisabled: { opacity: 0.6 },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  backLinkText: { fontSize: 12.5, fontWeight: '600' },
  footerTxt: { fontSize: 10.5, marginTop: 12 },
});
