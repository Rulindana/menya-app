import { Unit, units } from './lessons';

export interface JourneySection {
  id: string;
  title: string;
  subtitle: string;
  unitIds: string[];
}

export const journeySections: JourneySection[] = [
  {
    id: 'section1',
    title: 'Foundation',
    subtitle: 'Greetings, numbers, colors and family.',
    unitIds: ['unit1', 'unit2', 'unit3', 'unit4'],
  },
  {
    id: 'section2',
    title: 'Everyday life',
    subtitle: 'Food, animals, body parts and telling time.',
    unitIds: ['unit5', 'unit6', 'unit7', 'unit8'],
  },
  {
    id: 'section3',
    title: 'Confident conversations',
    subtitle: 'Verbs, places, weather and Rwandan culture.',
    unitIds: ['unit9', 'unit10', 'unit11', 'unit12'],
  },
  {
    id: 'section4',
    title: 'Home stretch',
    subtitle: 'Useful phrases and daily home life.',
    unitIds: ['unit13', 'unit14'],
  },
];

export const getSectionUnits = (section: JourneySection): Unit[] =>
  section.unitIds
    .map((unitId) => units.find((unit) => unit.id === unitId))
    .filter((unit): unit is Unit => Boolean(unit));

export const getUnitNumber = (unitId: string): number =>
  units.findIndex((unit) => unit.id === unitId) + 1;

export const isUnitComplete = (unit: Unit, completedLessonIds: string[]): boolean =>
  unit.lessons.every((lesson) => completedLessonIds.includes(lesson.id));
