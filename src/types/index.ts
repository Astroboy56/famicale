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
  googleCalendarId?: string; // Google CalendarのイベントID
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
  { id: 'atomu', name: 'あとむ', color: 'blue' },
  { id: 'erika', name: 'えりか', color: 'orange' },
  { id: 'kosumo', name: 'こすも', color: 'green' },
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
    bg: 'bg-blue-400',
    text: 'text-blue-900',
    border: 'border-blue-300',
  },
  orange: {
    bg: 'bg-orange-400',
    text: 'text-orange-900',
    border: 'border-orange-300',
  },
  green: {
    bg: 'bg-green-400',
    text: 'text-green-900',
    border: 'border-green-300',
  },
  pink: {
    bg: 'bg-pink-400',
    text: 'text-pink-900',
    border: 'border-pink-300',
  },
};

// ポイ活関連の型定義
export interface PoiTask {
  id: string;
  name: string;
  points: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoiWish {
  id: string;
  name: string;
  targetPoints: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoiRecord {
  id: string;
  childId: string;
  taskId: string;
  date: string;
  points: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoiChild {
  id: string;
  name: string;
  totalPoints: number;
}

// ポイ活のデフォルト設定
export const DEFAULT_POI_TASKS: PoiTask[] = [
  { id: 'study', name: '勉強', points: 10, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'exercise', name: '筋トレ', points: 15, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'help', name: 'お手伝い', points: 5, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
];

export const POI_CHILDREN: PoiChild[] = [
  { id: 'alice', name: 'ありす', totalPoints: 0 },
  { id: 'kosumo', name: 'こすも', totalPoints: 0 },
];

// 通知関連の型定義
export type NotificationType = 'event_added' | 'event_updated' | 'todo_added' | 'todo_updated' | 'poi_added' | 'poi_updated';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetId: string; // 関連するデータのID
  targetType: 'event' | 'todo' | 'poi';
  createdBy: string; // 作成者の家族メンバーID
  createdAt: Date;
  isRead: boolean;
  userId?: string; // 特定のユーザー向けの場合
}


// 通知設定
export interface NotificationSettings {
  events: boolean;
  todos: boolean;
  poi: boolean;
  sound: boolean;
  vibration: boolean;
}

// デフォルト通知設定
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  events: true,
  todos: true,
  poi: true,
  sound: false,
  vibration: false,
};

