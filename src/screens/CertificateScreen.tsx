import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAppStore } from '../store/useAppStore';
import { getTotalLessons } from '../data/lessons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

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

// ── Build the landscape HTML certificate ──
const buildCertificateHtml = async (params: {
  name: string;
  certId: string;
  dateIssued: string;
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  perfectCount: number;
  perfectPct: number;
  badgeEmoji: string;
  badgeLabel: string;
  badgeColor: string;
  badgeDescription: string;
  photoBase64: string;
  qrDataUrl: string;
}): Promise<string> => {
  const {
    name, certId, dateIssued, xp, level, streak,
    lessonsCompleted, totalLessons, perfectCount, perfectPct,
    badgeEmoji, badgeLabel, badgeColor, badgeDescription,
    photoBase64, qrDataUrl,
  } = params;

  const photoHtml = photoBase64
    ? `<img src="${photoBase64}" class="photo" alt="Student Photo" />`
    : `<div class="photo-placeholder">👤</div>`;

  const qrHtml = qrDataUrl
    ? `<img src="${qrDataUrl}" class="qr" alt="QR Code" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 297mm;
    height: 210mm;
    background: #ffffff;
    font-family: Georgia, 'Times New Roman', serif;
    overflow: hidden;
  }
  .outer-border {
    position: absolute;
    inset: 6mm;
    border: 3px solid #C9A84C;
    border-radius: 4px;
  }
  .inner-border {
    position: absolute;
    inset: 10mm;
    border: 1.5px solid #C9A84C;
    border-radius: 3px;
  }
  /* Rwanda flag stripe top */
  .flag-top, .flag-bottom {
    position: absolute;
    left: 10mm;
    right: 10mm;
    height: 5mm;
    display: flex;
    flex-direction: row;
  }
  .flag-top { top: 10mm; }
  .flag-bottom { bottom: 10mm; }
  .flag-blue  { flex: 1; background: #00A1DE; }
  .flag-yellow{ flex: 0.5; background: #FAD201; }
  .flag-green { flex: 1; background: #20603D; }
  .flag-bottom .flag-green { order: -1; }
  .flag-bottom .flag-yellow { order: 0; }
  .flag-bottom .flag-blue { order: 1; }

  /* Main content area */
  .content {
    position: absolute;
    top: 17mm;
    left: 14mm;
    right: 14mm;
    bottom: 17mm;
    display: flex;
    flex-direction: row;
    gap: 10mm;
  }

  /* Left column */
  .left-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .logo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4mm;
  }
  .logo-emoji { font-size: 22pt; line-height: 1; }
  .app-name {
    font-size: 20pt;
    font-weight: bold;
    color: #20603D;
    font-family: Arial, sans-serif;
    letter-spacing: 2px;
  }
  .cert-title {
    font-size: 18pt;
    font-weight: bold;
    color: #1a1a1a;
    letter-spacing: 1px;
    text-transform: uppercase;
    line-height: 1.3;
    margin-bottom: 3mm;
  }
  .sub-title {
    font-size: 10pt;
    color: #555;
    font-style: italic;
    margin-bottom: 3mm;
  }
  .divider {
    width: 70%;
    height: 1px;
    background: linear-gradient(to right, transparent, #C9A84C, transparent);
    margin: 2mm auto;
  }
  .student-name {
    font-size: 22pt;
    color: #20603D;
    font-style: italic;
    font-weight: bold;
    margin: 2mm 0;
  }
  .has-completed {
    font-size: 10pt;
    color: #555;
    margin-bottom: 2mm;
  }
  .course-name {
    font-size: 16pt;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 4mm;
  }

  /* Achievements */
  .achievements {
    width: 85%;
    text-align: left;
    margin-bottom: 4mm;
  }
  .ach-title {
    font-size: 11pt;
    font-weight: bold;
    color: #20603D;
    margin-bottom: 2mm;
    font-family: Arial, sans-serif;
  }
  .ach-item {
    font-size: 9pt;
    color: #333;
    line-height: 1.9;
    font-family: Arial, sans-serif;
  }
  .ach-item::before { content: "• "; color: #C9A84C; font-weight: bold; }

  /* Bottom row: signature + cert info + QR */
  .bottom-row {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    margin-top: auto;
    padding-top: 2mm;
    border-top: 1px solid #e0e0e0;
  }
  .sig-block { flex: 1; }
  .sig-name {
    font-family: 'Brush Script MT', cursive, Georgia;
    font-size: 16pt;
    color: #1a1a1a;
  }
  .sig-role { font-size: 8pt; color: #555; font-family: Arial; }
  .cert-meta { flex: 1.5; text-align: center; font-family: Arial; }
  .cert-id { font-size: 8pt; color: #333; margin-bottom: 2px; }
  .cert-date { font-size: 8pt; color: #333; }
  .qr-block { text-align: center; }
  .qr { width: 18mm; height: 18mm; }
  .qr-label { font-size: 6pt; color: #888; font-family: Arial; margin-top: 2px; }

  /* Right column — photo */
  .right-col {
    width: 45mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4mm;
  }
  .photo {
    width: 36mm;
    height: 36mm;
    border-radius: 18mm;
    object-fit: cover;
    border: 3px solid #C9A84C;
  }
  .photo-placeholder {
    width: 36mm;
    height: 36mm;
    border-radius: 18mm;
    border: 3px solid #C9A84C;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24pt;
    background: #f5f5f5;
  }
  .rwandan-sun {
    font-size: 28pt;
    color: #FAD201;
  }
  .official-seal {
    width: 28mm;
    height: 28mm;
    border: 3px double #20603D;
    border-radius: 14mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f9fff6;
  }
  .seal-text { font-size: 7pt; color: #20603D; font-weight: bold; font-family: Arial; text-align: center; line-height: 1.4; }

  /* Badge tier */
  .badge-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    border: 2px solid #FFD700;
    border-radius: 8px;
    padding: 4px 8px;
    margin-bottom: 4mm;
    background: rgba(255,255,255,0.6);
  }
  .badge-emoji { font-size: 16pt; line-height: 1; }
  .badge-label { font-size: 9pt; font-weight: bold; font-family: Arial; }
  .badge-desc { font-size: 7pt; color: #555; font-family: Arial; }
</style>
</head>
<body>
  <div class="outer-border"></div>
  <div class="inner-border"></div>
  <div class="flag-top">
    <div class="flag-blue"></div>
    <div class="flag-yellow"></div>
    <div class="flag-green"></div>
  </div>
  <div class="flag-bottom">
    <div class="flag-green"></div>
    <div class="flag-yellow"></div>
    <div class="flag-blue"></div>
  </div>

  <div class="content">
    <!-- LEFT: Main certificate text -->
    <div class="left-col">
      <div class="logo-row">
        <span class="logo-emoji">🦍</span>
        <span class="app-name">MENYA</span>
      </div>

      <div class="cert-title">Certificate of<br/>Language Proficiency</div>
      <div class="divider"></div>
      <div class="sub-title">This certifies that</div>
      <div class="student-name">${name}</div>
      <div class="has-completed">has successfully completed the full course of</div>
      <div class="course-name">Kinyarwanda — ${lessonsCompleted}/${totalLessons} Lessons</div>

      <div class="achievements">
        <div class="ach-title">Achievements</div>
        <div class="ach-item">Total XP Earned: ${xp} XP</div>
        <div class="ach-item">Proficiency Level: Level ${level}</div>
        <div class="ach-item">Longest Streak: ${streak} days</div>
        <div class="ach-item">Lessons Completed: ${lessonsCompleted} of ${totalLessons}</div>
        <div class="ach-item">Perfect Lessons: ${perfectCount}/${totalLessons} (${Math.round(perfectPct)}%)</div>
      </div>

      <!-- Badge tier -->
      <div class="badge-row" style="border-color: ${badgeColor};">
        <span class="badge-emoji">${badgeEmoji}</span>
        <div>
          <div class="badge-label" style="color: ${badgeColor};">${badgeLabel} CERTIFICATE</div>
          <div class="badge-desc">${badgeDescription}</div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="sig-block">
          <div class="sig-name">Runi RW</div>
          <div class="sig-role">Menya App • runirw.com</div>
        </div>
        <div class="cert-meta">
          <div class="cert-id"><b>Certificate ID:</b> ${certId}</div>
          <div class="cert-date"><b>Date Issued:</b> ${dateIssued}</div>
        </div>
        <div class="qr-block">
          ${qrHtml}
          <div class="qr-label">Scan to verify</div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Photo + seal -->
    <div class="right-col">
      ${photoHtml}
      <div class="official-seal">
        <div class="seal-text">🇷🇼<br/>OFFICIAL<br/>MENYA<br/>CERTIFICATE</div>
      </div>
    </div>
  </div>
</body>
</html>`;
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
  type BadgeTier = { label: string; emoji: string; color: string; description: string };
  const getBadgeTier = (): BadgeTier => {
    if (perfectPct >= 100) return { label: 'GOLD',   emoji: '🥇', color: '#FFD700', description: 'Perfect Score — All lessons mastered!' };
    if (perfectPct >= 80)  return { label: 'SILVER', emoji: '🥈', color: '#C0C0C0', description: 'Excellent — 80%+ lessons mastered!' };
    if (perfectPct >= 60)  return { label: 'BRONZE', emoji: '🥉', color: '#CD7F32', description: 'Good — 60%+ lessons mastered!' };
    return { label: 'REPEAT', emoji: '🔁', color: '#E74C3C', description: 'Keep practising — repeat to earn a higher badge!' };
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
        badgeEmoji: badge.emoji,
        badgeLabel: badge.label,
        badgeColor: badge.color,
        badgeDescription: badge.description,
        photoBase64,
        qrDataUrl,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        width: 842,   // A4 landscape width in pts (297mm)
        height: 595,  // A4 landscape height in pts (210mm)
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
      <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.bg}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.lockTitle}>Impamyabumenyi Iragikingwa</Text>
          <Text style={styles.lockMsg}>
            Rangiza amasomo yose kugira ngo ubone impamyabumenyi.{'\n\n'}
            Warangije: {completedLessons}/{totalLessons} amasomo
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(completedLessons / totalLessons) * 100}%` as any }]} />
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Subira Ahabanza</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>🏆 Congratulations!</Text>
        <Text style={styles.pageSubtitle}>Warangije Isomo Ryose! 🇷🇼</Text>

        {/* Badge tier banner */}
        <View style={[styles.badgeBanner, { borderColor: badge.color, backgroundColor: badge.color + '22' }]}>
          <Text style={styles.badgeBannerEmoji}>{badge.emoji}</Text>
          <View>
            <Text style={[styles.badgeBannerLabel, { color: badge.color }]}>{badge.label} CERTIFICATE</Text>
            <Text style={styles.badgeBannerDesc}>{badge.description}</Text>
            {badge.label === 'REPEAT' && (
              <Text style={styles.badgeBannerHint}>
                Complete lessons perfectly to earn Bronze or higher 🎯
              </Text>
            )}
          </View>
        </View>

        {/* Certificate preview card */}
        <Animated.View style={[styles.certPreview, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {/* Outer gold border */}
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              {/* Rwanda flag stripe */}
              <View style={styles.flagStripe}>
                <View style={[styles.stripe, { backgroundColor: '#00A1DE' }]} />
                <View style={[styles.stripe, { backgroundColor: '#FAD201', flex: 0.5 }]} />
                <View style={[styles.stripe, { backgroundColor: '#20603D' }]} />
              </View>

              <View style={styles.certBody}>
                {/* Left: text */}
                <View style={styles.certLeft}>
                  {/* Logo row */}
                  <View style={styles.logoRow}>
                    <Text style={styles.logoEmoji}>🦍</Text>
                    <Text style={styles.appNameText}>MENYA</Text>
                  </View>

                  <Text style={styles.certTitle}>CERTIFICATE OF{'\n'}LANGUAGE PROFICIENCY</Text>
                  <View style={styles.goldDivider} />
                  <Text style={styles.certSub}>This certifies that</Text>
                  <Text style={styles.certName}>{user.displayName || 'Umunyeshuri'}</Text>
                  <Text style={styles.certSub}>has successfully completed the full course of</Text>
                  <Text style={styles.certCourse}>Kinyarwanda</Text>

                  <View style={styles.achBox}>
                    <Text style={styles.achTitle}>Achievements</Text>
                    <Text style={styles.achItem}>• Total XP Earned: {progress.xp} XP</Text>
                    <Text style={styles.achItem}>• Proficiency Level: Level {progress.level}</Text>
                    <Text style={styles.achItem}>• Lessons Completed: {completedLessons}/{totalLessons}</Text>
                    <Text style={styles.achItem}>• Perfect Lessons: {perfectCount}/{totalLessons} ({Math.round(perfectPct)}%)</Text>
                    <Text style={styles.achItem}>• Streak: {progress.streak} days</Text>
                    {/* Badge tier */}
                    <View style={[styles.badgeRow, { borderColor: badge.color }]}>
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                      <View>
                        <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label} CERTIFICATE</Text>
                        <Text style={styles.badgeDesc}>{badge.description}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom row */}
                  <View style={styles.certFooter}>
                    <View style={styles.footerLeft}>
                      <Text style={styles.sigText}>Runi RW</Text>
                      <Text style={styles.sigRole}>Menya App • runirw.com</Text>
                      <Text style={styles.certIdText}>ID: {certId}</Text>
                      <Text style={styles.certIdText}>{today}</Text>
                    </View>
                    <View style={styles.qrWrapper}>
                      <QRCode
                        value={qrValue}
                        size={64}
                        getRef={(ref) => setQrSvgRef(ref)}
                        backgroundColor="white"
                        color="#000000"
                      />
                      <Text style={styles.qrLabel}>Scan to verify</Text>
                    </View>
                  </View>
                </View>

                {/* Right: photo + seal */}
                <View style={styles.certRight}>
                  {user.photoUri ? (
                    <Image source={{ uri: user.photoUri }} style={styles.photoCircle} />
                  ) : (
                    <View style={[styles.photoCircle, styles.photoPlaceholder]}>
                      <Text style={{ fontSize: 28 }}>👤</Text>
                    </View>
                  )}
                  <View style={styles.officialSeal}>
                    <Text style={styles.sealEmoji}>🇷🇼</Text>
                    <Text style={styles.sealText}>OFFICIAL{'\n'}MENYA</Text>
                  </View>
                </View>
              </View>

              {/* Bottom flag stripe */}
              <View style={styles.flagStripe}>
                <View style={[styles.stripe, { backgroundColor: '#20603D' }]} />
                <View style={[styles.stripe, { backgroundColor: '#FAD201', flex: 0.5 }]} />
                <View style={[styles.stripe, { backgroundColor: '#00A1DE' }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.pdfNote}>
          📄 PDF itarengwa · Landscape A4 · Scannable QR
        </Text>

        {/* Action buttons */}
        <AnimatedButton
          style={[styles.actionBtn, styles.saveBtnColor, saving && styles.btnDisabled]}
          onPress={handleSave}
        >
          <AppIcon name="document" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>
            {saving ? 'Birakora...' : 'Save PDF to Device'}
          </Text>
        </AnimatedButton>

        <AnimatedButton
          style={[styles.actionBtn, styles.shareBtnColor, sharing && styles.btnDisabled]}
          onPress={handleShare}
        >
          <AppIcon name="share" size={20} color="#1A1A1A" />
          <Text style={[styles.actionBtnText, { color: '#1A1A1A' }]}>
            {sharing ? 'Birakora...' : 'Share PDF'}
          </Text>
        </AnimatedButton>

        <AnimatedButton
          style={[styles.actionBtn, styles.homeBtnColor]}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <AppIcon name="home" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Back to Home</Text>
        </AnimatedButton>

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>Powered by <Text style={{ fontWeight: '800' }}>Runi RW</Text> • runirw.com</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flexGrow: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 16 },

  // Locked screen
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  lockEmoji: { fontSize: 60, marginBottom: 16 },
  lockTitle: { fontSize: 22, fontWeight: '900', color: '#FFD700', textAlign: 'center', marginBottom: 12 },
  lockMsg: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden', marginBottom: 28 },
  progressBarFill: { height: '100%', backgroundColor: '#20603D', borderRadius: 6 },
  backBtn: { backgroundColor: '#20603D', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  backBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  // Page header
  pageTitle: { fontSize: 30, fontWeight: '900', color: '#FFD700', textAlign: 'center' },
  pageSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 12, fontStyle: 'italic' },

  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    width: '100%',
  },
  badgeBannerEmoji: { fontSize: 36 },
  badgeBannerLabel: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  badgeBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  badgeBannerHint: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontStyle: 'italic' },

  // Certificate card — portrait preview of the landscape PDF
  certPreview: {
    width: width - 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    elevation: 12,
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    marginBottom: 12,
  },
  outerBorder: {
    margin: 4,
    borderWidth: 2.5,
    borderColor: '#C9A84C',
    borderRadius: 3,
  },
  innerBorder: {
    margin: 4,
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 2,
    overflow: 'hidden',
  },
  flagStripe: { flexDirection: 'row', height: 8 },
  stripe: { flex: 1 },

  certBody: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  certLeft: { flex: 1 },
  certRight: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 12,
  },

  // Logo
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  logoEmoji: { fontSize: 18 },
  appNameText: { fontSize: 16, fontWeight: '900', color: '#20603D', letterSpacing: 2 },

  certTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 18,
    marginBottom: 6,
  },
  goldDivider: { height: 1.5, backgroundColor: '#C9A84C', marginVertical: 6, width: '80%' },
  certSub: { fontSize: 10, color: '#666', fontStyle: 'italic', marginBottom: 3 },
  certName: { fontSize: 18, fontWeight: '900', color: '#20603D', fontStyle: 'italic', marginVertical: 4 },
  certCourse: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },

  achBox: { marginBottom: 10 },
  achTitle: { fontSize: 10, fontWeight: '900', color: '#20603D', marginBottom: 4 },
  achItem: { fontSize: 9, color: '#444', lineHeight: 16 },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  badgeEmoji: { fontSize: 18 },
  badgeLabel: { fontSize: 9, fontWeight: '900' },
  badgeDesc: { fontSize: 8, color: '#555', marginTop: 1 },

  certFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 8 },
  footerLeft: { flex: 1 },
  sigText: { fontSize: 13, fontStyle: 'italic', color: '#1a1a1a', fontWeight: '700' },
  sigRole: { fontSize: 8, color: '#666' },
  certIdText: { fontSize: 8, color: '#555', marginTop: 2 },

  qrWrapper: { alignItems: 'center' },
  qrLabel: { fontSize: 7, color: '#888', marginTop: 3 },

  photoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#C9A84C',
  },
  photoPlaceholder: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialSeal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#20603D',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fff6',
  },
  sealEmoji: { fontSize: 14 },
  sealText: { fontSize: 7, color: '#20603D', fontWeight: '800', textAlign: 'center', lineHeight: 11 },

  pdfNote: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 20, textAlign: 'center' },

  // Buttons
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
    marginBottom: 12,
    width: width - 32,
  },
  saveBtnColor: { backgroundColor: '#00A1DE' },
  shareBtnColor: { backgroundColor: '#FFD700' },
  homeBtnColor: { backgroundColor: '#20603D' },
  btnDisabled: { opacity: 0.6 },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  footer: { marginTop: 16, alignItems: 'center' },
  footerTxt: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
});
