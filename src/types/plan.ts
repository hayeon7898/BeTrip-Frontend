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
}

export type DaySchedule = Record<MealSlot, ScheduleItem[]>;

export function createEmptyDaySchedule(): DaySchedule {
  return { morning: [], lunch: [], dinner: [] };
}