import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { AppModal } from '../components/AppModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = width * 0.72;

interface CertData {
  name: string;
  age: number;
  certId: string;
  date: string;
  photoUri?: string; // loaded from local AsyncStorage
  hasPhoto?: boolean;
}

const parseMenyaQR = (raw: string): CertData | null => {
  try {
    const obj = JSON.parse(raw);
    if (!obj.menya) return null;
    return {
      name: obj.name || 'Unknown',
      age: obj.age || 0,
      certId: obj.certId || '',
      date: obj.date || '',
      // photo field contains base64 data URI if it was small enough to embed
      photoUri: obj.photo || undefined,
      hasPhoto: !!(obj.photo || obj.hasPhoto),
    };
  } catch {
    return null;
  }
};

// ── Try to load expo-camera ────────────────────────────────────
let CameraView: any = null;
let useCameraPermissions: any = null;
try {
  const cam = require('expo-camera');
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
} catch {
  // expo-camera not installed
}

export const QRScannerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions
    ? useCameraPermissions()
    : [null, async () => {}];
  const [scanned, setScanned] = useState(false);
  const [certData, setCertData] = useState<CertData | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animate scan line
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_SIZE - 4],
  });

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const cert = parseMenyaQR(data);
    if (!cert) {
      setShowInvalid(true);
    } else {
      // If photo was NOT embedded in QR, try loading from local AsyncStorage
      // (works only when scanning on the same device that registered)
      if (!cert.photoUri && cert.hasPhoto && cert.certId) {
        try {
          const storedUri = await AsyncStorage.getItem(`menya_cert_photo_${cert.certId}`);
          if (storedUri) cert.photoUri = storedUri;
        } catch { /* skip */ }
      }
      setCertData(cert);
    }
  };

  // ── No expo-camera ──
  if (!CameraView) {
    return (
      <View style={styles.bg}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}><AppIcon name="camera" size={30} color="#FFFFFF" /></View>
          <Text style={styles.errorTitle}>Kamera ntiboneka</Text>
          <Text style={styles.errorMsg}>
            Serivisi ya kamera ntabwo yashyizwe ahazaza. Ongera ubike application.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Subira</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── No permission ──
  if (!permission?.granted) {
    return (
      <View style={styles.bg}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}><AppIcon name="lock" size={30} color="#FFFFFF" /></View>
          <Text style={styles.errorTitle}>Uburenganzira bwa Kamera</Text>
          <Text style={styles.errorMsg}>
            Tugusaba uburenganzira bwo gukoresha kamera kugira ngo uscanye QR code.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Emeza Uburenganzira</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.backBtn, { marginTop: 12 }]} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Subira</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Certificate result ──
  if (certData) {
    return (
      <View style={styles.bg}>
        <View style={styles.resultContainer}>
          <View style={styles.resultTitleRow}><AppIcon name="checkCircle" size={24} color="#4CC38A" /><Text style={styles.resultTitle}>Impamyabumenyi Nyayo!</Text></View>
          <Text style={styles.resultSubtitle}>Valid Menya Certificate</Text>

          {/* Profile photo */}
          {certData.photoUri ? (
            <Image
              source={{ uri: certData.photoUri }}
              style={styles.resultPhoto}
            />
          ) : (
            <View style={[styles.resultPhoto, styles.resultPhotoPlaceholder]}>
              <AppIcon name="user" size={48} color="rgba(255,255,255,0.5)" />
              {certData.hasPhoto && (
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  Photo on this device only
                </Text>
              )}
            </View>
          )}

          <View style={styles.resultCard}>
            <Row label="Amazina" value={certData.name} />
            <Row label="Imyaka / Age" value={`${certData.age} years`} />
            <Row label="Certificate ID" value={certData.certId} mono />
            <Row label="Itariki / Date" value={certData.date} />
          </View>

          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedRow}><AppIcon name="shield" size={14} color="#2F9E6E" /><Text style={styles.verifiedText}>Verified by Menya App</Text></View>
          </View>

          <TouchableOpacity
            style={styles.scanAgainBtn}
            onPress={() => { setCertData(null); setScanned(false); }}
          >
            <AppIcon name="refresh" size={16} color="#FFFFFF" /><Text style={styles.scanAgainText}>Scan Another</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Subira</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Camera scanner ──
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark overlay with transparent hole */}
      <View style={styles.overlay}>
        {/* Top dark area */}
        <View style={[styles.overlaySegment, { height: (height - SCAN_SIZE) / 2 }]} />

        {/* Middle row */}
        <View style={styles.overlayMiddle}>
          <View style={[styles.overlaySegment, { width: (width - SCAN_SIZE) / 2 }]} />
          {/* Scan window */}
          <View style={styles.scanWindow}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
          </View>
          <View style={[styles.overlaySegment, { width: (width - SCAN_SIZE) / 2 }]} />
        </View>

        {/* Bottom dark area */}
        <View style={[styles.overlaySegment, { flex: 1 }]}>
          <View style={styles.scanLabelRow}><AppIcon name="qrCode" size={18} color="#FFFFFF" /><Text style={styles.scanLabel}>Scan Menya Certificate QR Code</Text></View>
          <Text style={styles.scanSub}>Menya certificates only • Other QR codes will be rejected</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invalid QR modal */}
      <AppModal
        visible={showInvalid}
        title="QR Code Siyo"
        message="Iyi QR code si iya Menya Certificate. Scan gusa impamyabumenyi za Menya App."
        type="error"
        icon="closeCircle"
        showCancel={false}
        confirmText="Gerageza Nanone"
        onConfirm={() => { setShowInvalid(false); setScanned(false); }}
      />
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, mono && styles.rowMono]}>{value}</Text>
  </View>
);

const CORNER_SIZE = 22;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  cameraContainer: { flex: 1 },

  // Overlay
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column' },
  overlaySegment: { backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayMiddle: { flexDirection: 'row', height: SCAN_SIZE },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    overflow: 'hidden',
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0B6E84',
    opacity: 0.9,
    shadowColor: '#0B6E84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#D9A441',
    borderWidth: CORNER_WIDTH,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },

  // Labels
  scanLabel: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  scanSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
  cancelBtn: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // Error / no camera
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  errorTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 10 },
  errorMsg: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  permBtn: { backgroundColor: '#0B6E84', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  permBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 8 },
  backBtnText: { color: '#FFFFFF', fontWeight: '700' },

  // Result
  resultContainer: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  resultTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  resultSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontStyle: 'italic' },
  resultPhoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#C9A84C',
    marginBottom: 20,
  },
  resultPhotoPlaceholder: { backgroundColor: '#1a2a4a', alignItems: 'center', justifyContent: 'center' },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  rowValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  rowMono: { fontSize: 11, fontFamily: 'monospace', color: '#D9A441' },
  verifiedBadge: {
    backgroundColor: '#0B6E8433',
    borderWidth: 1,
    borderColor: '#0B6E84',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  verifiedText: { color: '#2F9E6E', fontWeight: '800', fontSize: 13 },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#0B6E84',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 10,
  },
  scanAgainText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  scanLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 20, paddingHorizontal: 20 },
});
