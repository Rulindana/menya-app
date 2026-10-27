export const APP_FONT = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  regularItalic: 'PlusJakartaSans_400Regular_Italic',
  mediumItalic: 'PlusJakartaSans_500Medium_Italic',
  semiboldItalic: 'PlusJakartaSans_600SemiBold_Italic',
  boldItalic: 'PlusJakartaSans_700Bold_Italic',
  extraboldItalic: 'PlusJakartaSans_800ExtraBold_Italic',
} as const;

// Backwards-compatible alias
export const GOOGLE_SANS = APP_FONT;

export type AppFontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

// Central Typography Scale for Menya
export const Typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  lineHeight: {
    xs: 17,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 30,
    xxl: 36,
    display: 42,
  },
  presets: {
    headerTitle: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '800' as const,
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600' as const,
    },
    lessonPrompt: {
      fontSize: 22,
      lineHeight: 31,
      fontWeight: '800' as const,
      letterSpacing: -0.3,
    },
    optionText: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '700' as const,
    },
    buttonText: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '800' as const,
      letterSpacing: 0.2,
    },
    progressLabel: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700' as const,
    },
    feedbackTitle: {
      fontSize: 19,
      lineHeight: 25,
      fontWeight: '800' as const,
    },
    feedbackBody: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '600' as const,
    },
  },
} as const;

export const normalizeFontWeight = (weight?: string | number | null): number => {
  if (weight === 'bold') return 700;
  if (weight === 'normal' || weight == null) return 400;

  const parsed = typeof weight === 'number' ? weight : parseInt(weight, 10);
  if (!Number.isFinite(parsed)) return 400;
  return Math.min(900, Math.max(100, parsed));
};

export const fontForWeight = (weight?: string | number | null, italic = false): string => {
  const normalized = normalizeFontWeight(weight);

  if (italic) {
    if (normalized >= 800) return APP_FONT.extraboldItalic;
    if (normalized >= 700) return APP_FONT.boldItalic;
    if (normalized >= 600) return APP_FONT.semiboldItalic;
    if (normalized >= 500) return APP_FONT.mediumItalic;
    return APP_FONT.regularItalic;
  }

  if (normalized >= 800) return APP_FONT.extrabold;
  if (normalized >= 700) return APP_FONT.bold;
  if (normalized >= 600) return APP_FONT.semibold;
  if (normalized >= 500) return APP_FONT.medium;
  return APP_FONT.regular;
};

// Backwards-compatible alias
export const googleSansForWeight = fontForWeight;

/**
 * Scales font sizes up across the app for comfortable readability
 * while keeping large display titles proportional.
 */
export const scaleFontSize = (size?: number): number => {
  const raw = typeof size === 'number' ? size : 15;
  if (raw <= 8) return raw; // preserve tiny print-preview micro-labels on A4 paper preview
  if (raw <= 11) return raw + 2;
  if (raw <= 15) return raw + 2;
  if (raw <= 22) return raw + 2;
  return raw + 1;
};

export const scaleLineHeight = (
  lineHeight: number | undefined,
  rawFontSize: number | undefined,
  scaledFontSize: number
): number | undefined => {
  if (typeof lineHeight !== 'number') return undefined;
  const base = typeof rawFontSize === 'number' && rawFontSize > 0 ? rawFontSize : 15;
  const ratio = scaledFontSize / base;
  return Math.round(lineHeight * Math.max(1, ratio));
};
