import type { Place } from './place';

export type MealSlot = 'morning' | 'lunch' | 'dinner';

export const MEAL_SLOT_ORDER: MealSlot[] = ['morning', 'lunch', 'dinner'];

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  morning: '아침',
  lunch: '점심',
  dinner: '저녁',
};

export interface ScheduleItem {
  id: string;
  time: string;
  place: Place;
  travelToNextMin?: number;
  orderInDay: number;
}

export type DaySchedule = Record<MealSlot, ScheduleItem[]>;

export function createEmptyDaySchedule(): DaySchedule {
  return { morning: [], lunch: [], dinner: [] };
}

export interface FlatScheduleEntry {
  item: ScheduleItem;
  slot: MealSlot;
}

export function flattenDay(daySchedule: DaySchedule): FlatScheduleEntry[] {
  return MEAL_SLOT_ORDER.flatMap((slot) => daySchedule[slot].map((item) => ({ item, slot })));
}