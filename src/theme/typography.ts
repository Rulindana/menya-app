export const GOOGLE_SANS = {
  regular: 'GoogleSans_400Regular',
  medium: 'GoogleSans_500Medium',
  semibold: 'GoogleSans_600SemiBold',
  bold: 'GoogleSans_700Bold',
  regularItalic: 'GoogleSans_400Regular_Italic',
  mediumItalic: 'GoogleSans_500Medium_Italic',
  semiboldItalic: 'GoogleSans_600SemiBold_Italic',
  boldItalic: 'GoogleSans_700Bold_Italic',
} as const;

export type GoogleSansWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export const normalizeFontWeight = (weight?: string | number | null): number => {
  if (weight === 'bold') return 700;
  if (weight === 'normal' || weight == null) return 400;

  const parsed = typeof weight === 'number' ? weight : parseInt(weight, 10);
  if (!Number.isFinite(parsed)) return 400;
  return Math.min(900, Math.max(100, parsed));
};

export const googleSansForWeight = (weight?: string | number | null, italic = false): string => {
  const normalized = normalizeFontWeight(weight);

  if (italic) {
    if (normalized >= 700) return GOOGLE_SANS.boldItalic;
    if (normalized >= 600) return GOOGLE_SANS.semiboldItalic;
    if (normalized >= 500) return GOOGLE_SANS.mediumItalic;
    return GOOGLE_SANS.regularItalic;
  }

  if (normalized >= 700) return GOOGLE_SANS.bold;
  if (normalized >= 600) return GOOGLE_SANS.semibold;
  if (normalized >= 500) return GOOGLE_SANS.medium;
  return GOOGLE_SANS.regular;
};
