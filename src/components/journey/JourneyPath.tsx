import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { Text } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { useTheme } from '../../theme/themeContext';
import { JourneySection } from '../../data/journey';
import { Lesson, Unit } from '../../data/lessons';

const NODE_SIZE = 66;
const TROPHY_SIZE = 78;
const NODE_GAP = 114;
const TOP_PAD = 102;
const BOTTOM_PAD = 76;
const OFFSETS = [0, 0.62, 0.24, -0.35, -0.78, -0.26, 0.48, 0.86, 0.32, -0.22, -0.66, 0.12, 0.72, 0.18];

const getUnitIcon = (unitId: string) => {
  const icons: Record<string, string> = {
    unit1: 'message',
    unit2: 'calculator',
    unit3: 'palette',
    unit4: 'people',
    unit5: 'coffee',
    unit6: 'pawPrint',
    unit7: 'body',
    unit8: 'clock',
    unit9: 'activity',
    unit10: 'location',
    unit11: 'cloud',
    unit12: 'teacher',
    unit13: 'messages',
    unit14: 'home',
  };
  return icons[unitId] || 'bookOpen';
};

const getContentWidth = (width: number) => Math.min(width - 32, 560);

export const SectionBanner: React.FC<{
  section: JourneySection;
  index: number;
  completedUnits: number;
  totalUnits: number;
  onGuidebook: () => void;
}> = ({ section, index, completedUnits, totalUnits, onGuidebook }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const contentWidth = getContentWidth(width);
  const percent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  return (
    <View style={[styles.sectionBanner, { width: contentWidth, backgroundColor: colors.primaryDark }]}>
      <View style={styles.sectionTopRow}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionEyebrow}>SECTION {index + 1}</Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.guideButton}
          onPress={onGuidebook}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`${section.title} guidebook`}
        >
          <AppIcon name="bookOpen" size={17} color="#FFFFFF" />
          <Text style={styles.guideButtonText}>Guide</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionProgressRow}>
        <Text style={styles.sectionProgressText}>
          {completedUnits}/{totalUnits} units
        </Text>
        <Text style={styles.sectionProgressText}>{percent}%</Text>
      </View>
      <View style={styles.sectionProgressTrack}>
        <View style={[styles.sectionProgressFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

export const UnitJourney: React.FC<{
  unit: Unit;
  unitNumber: number;
  unlocked: boolean;
  completedIds: string[];
  perfectIds: string[];
  onStartLesson: (lesson: Lesson) => void;
  onLockedLesson: (message: string) => void;
}> = ({ unit, unitNumber, unlocked, completedIds, perfectIds, onStartLesson, onLockedLesson }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const contentWidth = getContentWidth(width);
  const amplitude = Math.min(62, contentWidth / 2 - 58);

  const unitCompleted = unit.lessons.every((lesson) => completedIds.includes(lesson.id));
  const completedCount = unit.lessons.filter((lesson) => completedIds.includes(lesson.id)).length;
  const currentLesson = unit.lessons.find((lesson) => !completedIds.includes(lesson.id));
  const totalXp = unit.lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);

  const nodes: Array<{ kind: 'lesson'; lesson: Lesson; lessonIndex: number } | { kind: 'trophy' }> = [
    ...unit.lessons.map((lesson, lessonIndex) => ({ kind: 'lesson' as const, lesson, lessonIndex })),
    { kind: 'trophy' as const },
  ];
  const height = TOP_PAD + (nodes.length - 1) * NODE_GAP + BOTTOM_PAD;
  const centers = nodes.map((node, index) => {
    const size = node.kind === 'trophy' ? TROPHY_SIZE : NODE_SIZE;
    return {
      x: contentWidth / 2 + OFFSETS[index % OFFSETS.length] * amplitude,
      y: TOP_PAD + index * NODE_GAP,
      size,
    };
  });
  const pathD = centers
    .map((center, index) => {
      if (index === 0) return `M ${center.x} ${center.y}`;
      const previous = centers[index - 1];
      const middleY = (previous.y + center.y) / 2;
      return `C ${previous.x} ${middleY} ${center.x} ${middleY} ${center.x} ${center.y}`;
    })
    .join(' ');

  const unitHint = unitCompleted
    ? 'Unit complete — tap any lesson to review & practice again.'
    : unlocked
      ? currentLesson
        ? `Up next: ${currentLesson.title} · 4 steps (Learn → Practice → Reinforce → Assess)`
        : 'Unit complete.'
      : `Complete Unit ${unitNumber - 1} to unlock this unit.`;

  return (
    <View style={[styles.unitBlock, { width: contentWidth }]}>
      <View
        style={[
          styles.unitBanner,
          {
            backgroundColor: unlocked ? unit.colorDark : colors.card,
            borderBottomColor: unlocked ? 'rgba(0,0,0,0.18)' : colors.border,
          },
        ]}
      >
        <View style={styles.unitTopRow}>
          <View
            style={[
              styles.unitIcon,
              { backgroundColor: unlocked ? 'rgba(255,255,255,0.16)' : colors.border },
            ]}
          >
            <AppIcon
              name={unlocked ? getUnitIcon(unit.id) : 'lock'}
              size={21}
              color={unlocked ? '#FFFFFF' : colors.textMuted}
            />
          </View>
          <View style={styles.unitCopy}>
            <Text style={[styles.unitEyebrow, { color: unlocked ? 'rgba(255,255,255,0.72)' : colors.textMuted }]}>
              UNIT {unitNumber}
            </Text>
            <Text style={[styles.unitTitle, { color: unlocked ? '#FFFFFF' : colors.textSecondary }]}>
              {unit.title}
            </Text>
            <Text style={[styles.unitTitleKiny, { color: unlocked ? 'rgba(255,255,255,0.78)' : colors.textMuted }]}>
              {unit.titleKiny}
            </Text>
          </View>

          {unitCompleted ? (
            <View style={styles.unitStatusCircle}>
              <AppIcon name="check" size={18} color="#FFFFFF" />
            </View>
          ) : unlocked && currentLesson ? (
            <TouchableOpacity
              style={styles.unitStartButton}
              onPress={() => onStartLesson(currentLesson)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Start ${unit.title}`}
            >
              <AppIcon name="play" size={13} color={unit.colorDark} />
              <Text style={[styles.unitStartText, { color: unit.colorDark }]}>START</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unitStatusCircleMuted}>
              <AppIcon name="lock" size={16} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.unitMetaRow}>
          <Text style={[styles.unitMeta, { color: unlocked ? 'rgba(255,255,255,0.78)' : colors.textMuted }]}>
            {completedCount}/{unit.lessons.length} lessons
          </Text>
          <Text style={[styles.unitMeta, { color: unlocked ? 'rgba(255,255,255,0.78)' : colors.textMuted }]}>
            +{totalXp} XP
          </Text>
        </View>
        <View style={[styles.unitProgressTrack, { backgroundColor: unlocked ? 'rgba(255,255,255,0.22)' : colors.border }]}>
          <View
            style={[
              styles.unitProgressFill,
              {
                width: `${(completedCount / unit.lessons.length) * 100}%`,
                backgroundColor: unlocked ? '#FFFFFF' : colors.textMuted,
              },
            ]}
          />
        </View>
      </View>

      <Text style={[styles.unitHint, { color: colors.textSecondary }]}>{unitHint}</Text>

      <View style={[styles.pathWrap, { width: contentWidth, height }]}>
        <Svg width={contentWidth} height={height} style={StyleSheet.absoluteFill}>
          <SvgPath
            d={pathD}
            stroke={unlocked ? unit.color + '55' : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="2 12"
            fill="none"
          />
        </Svg>

        {nodes.map((node, index) => {
          const center = centers[index];
          const nodeStyle = {
            position: 'absolute' as const,
            left: center.x - center.size / 2,
            top: center.y - center.size / 2,
          };

          if (node.kind === 'trophy') {
            return (
              <View key="trophy" style={nodeStyle}>
                <View
                  style={[
                    styles.trophyCircle,
                    {
                      backgroundColor: unitCompleted ? colors.secondary : colors.card,
                      borderColor: unitCompleted ? colors.secondary : colors.border,
                    },
                  ]}
                >
                  <AppIcon
                    name={unitCompleted ? 'trophy' : 'lock'}
                    size={30}
                    color={unitCompleted ? '#FFFFFF' : colors.textMuted}
                  />
                </View>
                <Text style={[styles.trophyLabel, { color: unitCompleted ? colors.secondary : colors.textMuted }]}>
                  {unitCompleted ? 'UNIT COMPLETE' : 'UNIT TROPHY'}
                </Text>
              </View>
            );
          }

          const { lesson, lessonIndex } = node;
          const completed = completedIds.includes(lesson.id);
          const previousLesson = lessonIndex > 0 ? unit.lessons[lessonIndex - 1] : null;
          const lessonUnlocked = unlocked && (lessonIndex === 0 || completedIds.includes(previousLesson!.id));
          const isCurrent = lessonUnlocked && !completed && currentLesson?.id === lesson.id;
          const perfect = completed && perfectIds.includes(lesson.id);

          return (
            <View key={lesson.id} style={nodeStyle}>
              {isCurrent && <StartBubble color={unit.color} backgroundColor={colors.card} />}
              <JourneyNode
                completed={completed}
                current={isCurrent}
                locked={!lessonUnlocked}
                perfect={perfect}
                unitColor={unit.color}
                unitColorDark={unit.colorDark}
                colors={colors}
                title={lesson.title}
                onPress={() => {
                  if (!lessonUnlocked) {
                    onLockedLesson(
                      unlocked
                        ? `Complete "${previousLesson?.title}" to unlock "${lesson.title}".`
                        : `Complete Unit ${unitNumber - 1} to unlock this unit.`,
                    );
                    return;
                  }
                  onStartLesson(lesson);
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const StartBubble: React.FC<{ color: string; backgroundColor: string }> = ({ color, backgroundColor }) => (
  <View
    style={[
      styles.startBubble,
      { backgroundColor, borderColor: color },
    ]}
  >
    <Text style={[styles.startBubbleText, { color }]}>START</Text>
    <View style={[styles.startBubblePointer, { backgroundColor, borderRightColor: color, borderBottomColor: color }]} />
  </View>
);

const JourneyNode: React.FC<{
  completed: boolean;
  current: boolean;
  locked: boolean;
  perfect: boolean;
  unitColor: string;
  unitColorDark: string;
  colors: any;
  title: string;
  onPress: () => void;
}> = ({ completed, current, locked, perfect, unitColor, unitColorDark, colors, title, onPress }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) {
      pulse.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [current, pulse]);

  const active = completed || current;
  const backgroundColor = active ? unitColor : colors.card;
  const borderColor = active ? unitColorDark : colors.border;
  const iconName = completed ? 'check' : current ? 'bookOpen' : 'lock';
  const iconColor = active ? '#FFFFFF' : colors.textMuted;
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.34, 0.08] });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${title}${completed ? ', completed' : current ? ', current lesson' : ', locked'}`}
      style={styles.nodeTouchable}
    >
      {current && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: unitColor,
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.nodeCircle,
          {
            backgroundColor,
            borderColor,
            borderBottomColor: active ? unitColorDark : colors.border,
            shadowColor: active ? unitColorDark : 'transparent',
          },
          locked && styles.nodeLocked,
        ]}
      >
        <AppIcon name={iconName} size={24} color={iconColor} strokeWidth={2.4} />
        {perfect && (
          <View style={[styles.perfectBadge, { backgroundColor: colors.secondary }]}>
            <AppIcon name="star" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.nodeLabel,
          {
            color: current ? colors.text : completed ? colors.textSecondary : colors.textMuted,
            fontWeight: current ? '700' : '600',
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sectionBanner: {
    alignSelf: 'center',
    borderRadius: 20,
    padding: 18,
    marginTop: 28,
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionCopy: { flex: 1 },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  guideButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  sectionProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 7,
  },
  sectionProgressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10.5,
    fontWeight: '600',
  },
  sectionProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  sectionProgressFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFFFFF' },

  unitBlock: { alignSelf: 'center', marginTop: 16 },
  unitBanner: {
    borderRadius: 18,
    borderBottomWidth: 4,
    padding: 16,
  },
  unitTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitCopy: { flex: 1 },
  unitEyebrow: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.4, marginBottom: 2 },
  unitTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  unitTitleKiny: { fontSize: 11.5, marginTop: 2 },
  unitStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unitStartText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  unitStatusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitStatusCircleMuted: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  unitMeta: { fontSize: 10.5, fontWeight: '600' },
  unitProgressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  unitProgressFill: { height: '100%', borderRadius: 2 },
  unitHint: { fontSize: 11.5, lineHeight: 17, marginTop: 8, marginLeft: 2 },

  pathWrap: { alignSelf: 'center', position: 'relative', marginTop: 2 },
  nodeTouchable: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 3,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 4,
  },
  nodeLocked: { opacity: 0.62 },
  nodeLabel: {
    position: 'absolute',
    top: NODE_SIZE + 5,
    width: 136,
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: -0.1,
  },
  pulseRing: {
    position: 'absolute',
    width: NODE_SIZE + 18,
    height: NODE_SIZE + 18,
    borderRadius: (NODE_SIZE + 18) / 2,
    borderWidth: 2,
  },
  perfectBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  startBubble: {
    position: 'absolute',
    top: -44,
    left: -15,
    width: 96,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  startBubbleText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.1 },
  startBubblePointer: {
    position: 'absolute',
    bottom: -6,
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  trophyCircle: {
    width: TROPHY_SIZE,
    height: TROPHY_SIZE,
    borderRadius: TROPHY_SIZE / 2,
    borderWidth: 3,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyLabel: {
    width: 120,
    textAlign: 'center',
    marginLeft: -22,
    marginTop: 8,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
