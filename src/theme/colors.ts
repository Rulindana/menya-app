// Menya App — Rwanda flag colors theme
import { GOOGLE_SANS } from './typography';

export const Colors = {
  // Brand — deep teal with a muted gold accent
  green: '#2F9E6E',
  greenLight: '#E6F6EE',
  greenMid: '#257A57',
  yellow: '#D9A441',
  yellowLight: '#FBF3E3',
  blue: '#2B6CB0',
  blueLight: '#E8F1FA',
  blueDark: '#22578C',
  white: '#FFFFFF',
  teal: '#0B6E84',
  tealDark: '#085468',
  tealLight: '#D9EEF3',

  // UI Colors
  background: '#F4F7F9',
  cardBg: '#FFFFFF',
  border: '#DCE5EA',

  // Text
  textDark: '#14212B',
  textMid: '#536471',
  textLight: '#83919D',

  // Feedback
  correct: '#2F9E6E',
  correctLight: '#E6F6EE',
  wrong: '#D64545',
  wrongLight: '#FCEAEA',

  // XP / Progress
  xpOrange: '#C9891C',
  streakRed: '#D64545',
  heartRed: '#D64545',

  // Lesson path node colors
  node1: '#0B6E84',
  node2: '#D9A441',
  node3: '#2B6CB0',
  nodeLocked: '#DCE5EA',

  // Tab bar
  tabActive: '#0B6E84',
  tabInactive: '#8A99A5',
  tabBg: '#FFFFFF',
};

export const Fonts = {
  regular: GOOGLE_SANS.regular,
  medium: GOOGLE_SANS.medium,
  semibold: GOOGLE_SANS.semibold,
  bold: GOOGLE_SANS.bold,
  size: {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
  },
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 30,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
};
