import React from 'react';
import { View } from 'react-native';
import {
  // Navigation
  Home,
  Home2,
  Medal,
  MedalStar,
  User,
  UserSquare,
  UserOctagon,
  Game,
  Gameboy,
  
  // Lesson categories
  Message,
  MessageCircle,
  Messages,
  Messages1,
  Messages2,
  Calculator,
  Colorfilter,
  People,
  Coffee,
  Pet,
  Activity,
  Location,
  Cloud,
  CloudSunny,
  Teacher,
  
  // Auth
  Sms,
  Lock,
  Lock1,
  Calendar,
  Calendar1,
  Google,
  ArrowRight,
  ArrowRight2,
  ArrowRight3,
  Login,
  
  // Lesson screen
  CloseCircle,
  CloseSquare,
  Heart,
  HeartAdd,
  Check,
  TickSquare,
  Star,
  Star1,
  MagicStar,
  Convert,
  Microphone,
  Microphone2,
  Volume,
  VolumeHigh,
  Book,
  Book1,
  BookSquare,
  Document,
  DocumentText,
  DocumentUpload,
  DocumentDownload,
  DocumentForward,
  DocumentPrevious,
  DocumentLike,
  ArrowDown,
  ArrowDown2,
  ArrowUp2,
  ArrowUp3,
  
  // Game screen
  Copy,
  Refresh,
  Refresh2,
  Profile2User,
  UserAdd,
  
  // Profile
  Edit,
  Edit2,
  Brush,
  
  // Leaderboard
  TrendUp,
  TrendDown,
  
  // Theme
  Sun1,
  Moon,
  Monitor,
  
  // Certificate
  Award,
  Share,
  Camera,
  
  // Status
  Information,
  InfoCircle,
  Danger,
  
  // Settings & Misc
  Setting,
  Setting2,
  Setting3,
  Notification,
  Category,
  Filter,
  FilterAdd,
  SearchNormal,
  Bookmark,
  Like,
  Dislike,
  Call,
  Video,
  Music,
  Headphone,
  Speaker,
  Play,
  Pause,
  StopCircle,
  Forward,
  Backward,
  Wifi,
  Bluetooth,
  BatteryFull,
  BatteryCharging,
  Key,
  Card,
  Wallet,
  DollarCircle,
  DollarSquare,
  Money,
  Coin,
  Bag,
  Box,
  Box1,
  Box2,
  Truck,
  Airplane,
  Bus,
  Car,
  Ruler,
  RulerPen,
  PenTool,
  Paintbucket,
  Triangle,
  Flash,
  FlashCircle,
  Flag,
  Crown,
  Cup,
  Gift,
  DiscountShape,
  Ticket,
  TicketStar,
  Link,
  Send,
  MessageAdd,
  MessageText,
  MessageEdit,
  MessageSearch,
  MessageNotif,
  Sort,
  Grid2,
  Menu,
  More,
  More2,
  MoreCircle,
  CloudSnow,
  CloudLightning,
  Wind,
  Drop,
  Map,
  Map1,
  Gps,
  Magicpen,
  Calendar2,
  Alarm,
  Timer,
  Clock,
  Chart,
  Chart1,
  Chart2,
  Diagram,
  Setting4,
  Setting5,
  Settings,
  NotificationBing,
  NotificationCircle,
  Notification1,
} from 'iconsax-react-native';

// ── Icon Name Mapping ──────────────────────────────────────────────

const iconMap: Record<string, any> = {
  // Navigation
  home: Home,
  home1: Home2,
  home2: Home2,
  trophy: MedalStar,
  trophy1: Medal,
  user: User,
  userSquare: UserSquare,
  game: Game,
  gamepad: Gameboy,
  
  // Lesson categories
  message: Message,
  messageCircle: MessageCircle,
  calculator: Calculator,
  colorfilter: Colorfilter,
  people: People,
  coffee: Coffee,
  pet: Pet,
  body: Activity,
  activity: Activity,
  location: Location,
  cloud: Cloud,
  cloudSunny: CloudSunny,
  teacher: Teacher,
  messages: Messages,
  
  // Auth
  mail: Sms,
  lock: Lock,
  lock1: Lock1,
  calendar: Calendar,
  calendar1: Calendar1,
  google: Google,
  arrowRight: ArrowRight,
  arrowRight1: ArrowRight2,
  arrowRight2: ArrowRight3,
  login: Login,
  
  // Lesson screen
  close: CloseCircle,
  closeCircle: CloseCircle,
  closeSquare: CloseSquare,
  heart: Heart,
  heartAdd: HeartAdd,
  check: Check,
  checkCircle: Check,
  checkSquare: TickSquare,
  star: Star,
  star1: Star1,
  magicStar: MagicStar,
  convert: Convert,
  microphone: Microphone,
  microphone1: Microphone2,
  volume: Volume,
  volumeHigh: VolumeHigh,
  book: Book,
  book1: Book1,
  bookSquare: BookSquare,
  document: Document,
  documentText: DocumentText,
  documentUpload: DocumentUpload,
  documentDownload: DocumentDownload,
  arrowDown: ArrowDown,
  arrowDown1: ArrowDown2,
  arrowUp: ArrowUp2,
  arrowUp1: ArrowUp3,
  
  // Game screen
  bot: UserOctagon,
  users: Profile2User,
  copy: Copy,
  refresh: Refresh,
  refresh1: Refresh2,
  
  // Profile
  edit: Edit,
  edit2: Edit2,
  save: DocumentUpload,
  palette: Brush,
  
  // Leaderboard
  trending: TrendUp,
  trendingUp: TrendUp,
  trendDown: TrendDown,
  flame: Flash,
  
  // Theme
  sun: Sun1,
  moon: Moon,
  monitor: Monitor,
  
  // Certificate
  award: Award,
  share: Share,
  camera: Camera,
  
  // Status
  info: Information,
  infoCircle: InfoCircle,
  danger: Danger,
  
  // Settings
  setting: Setting,
  setting2: Setting2,
  setting3: Setting3,
  setting4: Setting4,
  setting5: Setting5,
  settings: Settings,
  notification: Notification,
  notificationBing: NotificationBing,
  
  // Misc
  category: Category,
  filter: Filter,
  filterAdd: FilterAdd,
  search: SearchNormal,
  bookmark: Bookmark,
  like: Like,
  dislike: Dislike,
  call: Call,
  video: Video,
  music: Music,
  headphone: Headphone,
  speaker: Speaker,
  play: Play,
  pause: Pause,
  stop: StopCircle,
  forward: Forward,
  backward: Backward,
  wifi: Wifi,
  bluetooth: Bluetooth,
  battery: BatteryFull,
  batteryCharging: BatteryCharging,
  key: Key,
  card: Card,
  wallet: Wallet,
  dollar: DollarCircle,
  dollarCircle: DollarCircle,
  dollarSquare: DollarSquare,
  money: Money,
  coin: Coin,
  bag: Bag,
  box: Box,
  box1: Box1,
  box2: Box2,
  truck: Truck,
  air: Airplane,
  bus: Bus,
  car: Car,
  ruler: Ruler,
  rulerPen: RulerPen,
  penTool: PenTool,
  brush: Brush,
  paintBucket: Paintbucket,
  triangle: Triangle,
  flash: Flash,
  flashCircle: FlashCircle,
  flag: Flag,
  crown: Crown,
  medal: Medal,
  medalStar: MedalStar,
  cup: Cup,
  gift: Gift,
  discount: DiscountShape,
  ticket: Ticket,
  ticketStar: TicketStar,
  link: Link,
  send: Send,
  messageAdd: MessageAdd,
  messageText: MessageText,
  messageEdit: MessageEdit,
  messageSearch: MessageSearch,
  messageNotif: MessageNotif,
  messages1: Messages1,
  messages2: Messages2,
  documentForward: DocumentForward,
  documentPrevious: DocumentPrevious,
  documentLike: DocumentLike,
  sort: Sort,
  grid: Grid2,
  menu: Menu,
  more: More,
  more2: More2,
  moreCircle: MoreCircle,
  cloudSnow: CloudSnow,
  cloudLightning: CloudLightning,
  wind: Wind,
  drop: Drop,
  map: Map,
  map1: Map1,
  gps: Gps,
  compass: Magicpen,
  calendar2: Calendar2,
  alarm: Alarm,
  timer: Timer,
  clock: Clock,
  chart: Chart,
  chart1: Chart1,
  chart2: Chart2,
  diagram: Diagram,
};

// ── Color System ───────────────────────────────────────────────────

export const ICON_COLORS = {
  green: '#16834B',
  greenLight: '#E8F5E9',
  yellow: '#F9A825',
  yellowLight: '#FFF8E1',
  blue: '#1976D2',
  blueLight: '#E3F2FD',
  red: '#D32F2F',
  redLight: '#FFEBEE',
  purple: '#7B1FA2',
  purpleLight: '#F3E5F5',
  orange: '#F57C00',
  orangeLight: '#FFF3E0',
  teal: '#00897B',
  tealLight: '#E0F2F1',
  pink: '#C2185B',
  pinkLight: '#FCE4EC',
  gray: '#616161',
  grayLight: '#F5F5F5',
  gold: '#FFD700',
  goldLight: '#FFFDE7',
  darkGreen: '#0D3320',
  white: '#FFFFFF',
  black: '#1A1A1A',
} as const;

export const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
  greetings: { color: ICON_COLORS.green, bgColor: ICON_COLORS.greenLight },
  numbers: { color: ICON_COLORS.yellow, bgColor: ICON_COLORS.yellowLight },
  colors: { color: ICON_COLORS.blue, bgColor: ICON_COLORS.blueLight },
  family: { color: ICON_COLORS.green, bgColor: ICON_COLORS.greenLight },
  food: { color: ICON_COLORS.yellow, bgColor: ICON_COLORS.yellowLight },
  animals: { color: ICON_COLORS.blue, bgColor: ICON_COLORS.blueLight },
  body: { color: ICON_COLORS.green, bgColor: ICON_COLORS.greenLight },
  time: { color: ICON_COLORS.yellow, bgColor: ICON_COLORS.yellowLight },
  verbs: { color: ICON_COLORS.orange, bgColor: ICON_COLORS.orangeLight },
  travel: { color: ICON_COLORS.teal, bgColor: ICON_COLORS.tealLight },
  weather: { color: ICON_COLORS.blue, bgColor: ICON_COLORS.blueLight },
  culture: { color: ICON_COLORS.purple, bgColor: ICON_COLORS.purpleLight },
  phrases: { color: ICON_COLORS.pink, bgColor: ICON_COLORS.pinkLight },
  home: { color: ICON_COLORS.teal, bgColor: ICON_COLORS.tealLight },
};

// ── AppIcon Component ──────────────────────────────────────────────

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  variant?: 'bulk' | 'linear' | 'outline' | 'two-tone';
  style?: any;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = '#1A1A1A',
  variant = 'Bulk',
  style,
}) => {
  // Safe fallback - always return a valid component
  const IconComponent = iconMap[name?.toLowerCase?.() || ''] || iconMap[name || ''] || null;
  
  if (!IconComponent) {
    // Return a View placeholder if icon not found
    return (
      <View style={[{ width: size, height: size }, style]} />
    );
  }
  
  try {
    return (
      <IconComponent
        size={size}
        color={color}
        variant={variant}
        style={style}
      />
    );
  } catch (e) {
    return <View style={[{ width: size, height: size }, style]} />;
  }
};

// ── 3D Icon with Container ─────────────────────────────────────────

interface Icon3DProps {
  name: string;
  size?: number;
  color?: string;
  bgColor?: string;
  containerSize?: number;
  borderRadius?: number;
  showShadow?: boolean;
}

export const Icon3D: React.FC<Icon3DProps> = ({
  name,
  size = 24,
  color = '#FFFFFF',
  bgColor = '#16834B',
  containerSize = 44,
  borderRadius = 12,
  showShadow = true,
}) => {
  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: showShadow ? '#000' : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: showShadow ? 0.2 : 0,
        shadowRadius: showShadow ? 4 : 0,
        elevation: showShadow ? 4 : 0,
      }}
    >
      <AppIcon name={name} size={size} color={color} />
    </View>
  );
};

export { iconMap };
export type IconName = keyof typeof iconMap;
