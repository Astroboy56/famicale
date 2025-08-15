// 家族メンバー
export interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

// 予定の種類
export type EventType = 'work' | 'school' | 'hospital' | 'travel' | 'other' | 'shift';

// 予定
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD形式
  time?: string; // HH:MM形式
  familyMemberId: string;
  type: EventType;
  isAllDay?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// TODOアイテム
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdBy: string; // 家族メンバーID
  createdAt: Date;
  updatedAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

// カレンダー表示モード
export type CalendarView = 'month' | 'week' | 'list';

// 一括入力パターン
export interface BulkInputPattern {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'weekdays' | 'weekends' | 'custom';
  days?: number[]; // 曜日指定（0=日曜日, 1=月曜日...）
  dates?: number[]; // 月内の日付指定
  interval?: number; // 間隔（隔週の場合は2など）
}

// 一括入力データ
export interface BulkInput {
  pattern: BulkInputPattern;
  event: Omit<Event, 'id' | 'date' | 'createdAt' | 'updatedAt'>;
  startDate: string;
  endDate: string;
}

// ナビゲーションアイテム
export interface NavigationItem {
  id: string;
  name: string;
  icon: string;
  path: string;
}

// 家族データ
export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'atom', name: 'あとむ', color: 'blue' },
  { id: 'erika', name: 'えりか', color: 'red' },
  { id: 'cosmo', name: 'こすも', color: 'green' },
  { id: 'alice', name: 'ありす', color: 'pink' },
];

// イベントタイプのアイコンマップ
export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  work: 'briefcase',
  school: 'graduation-cap',
  hospital: 'heart-pulse',
  travel: 'plane',
  other: 'calendar',
  shift: 'clock',
};

// カラーマップ
export const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-200',
    text: 'text-blue-900',
    border: 'border-blue-300',
  },
  red: {
    bg: 'bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
  },
  green: {
    bg: 'bg-green-200',
    text: 'text-green-900',
    border: 'border-green-300',
  },
  pink: {
    bg: 'bg-pink-200',
    text: 'text-pink-900',
    border: 'border-pink-300',
  },
};

