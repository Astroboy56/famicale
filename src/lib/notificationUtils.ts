import { notificationService } from './firestore';
import { Notification, NotificationType, Event, TodoItem, PoiRecord, FAMILY_MEMBERS } from '@/types';

// 通知メッセージのテンプレート
const NOTIFICATION_MESSAGES = {
  event_added: (event: Event, memberName: string) => 
    `${memberName}が新しい予定「${event.title}」を追加しました`,
  event_updated: (event: Event, memberName: string) => 
    `${memberName}が予定「${event.title}」を更新しました`,
  todo_added: (todo: TodoItem, memberName: string) => 
    `${memberName}が新しいTODO「${todo.title}」を追加しました`,
  todo_updated: (todo: TodoItem, memberName: string) => 
    `${memberName}がTODO「${todo.title}」を更新しました`,
  poi_added: (record: PoiRecord, memberName: string) => 
    `${memberName}がポイ活タスクを完了しました（${record.points}ポイント獲得）`,
  poi_updated: (record: PoiRecord, memberName: string) => 
    `${memberName}のポイ活記録が更新されました`,
};

// 通知タイトルのテンプレート
const NOTIFICATION_TITLES = {
  event_added: '新しい予定が追加されました',
  event_updated: '予定が更新されました',
  todo_added: '新しいTODOが追加されました',
  todo_updated: 'TODOが更新されました',
  poi_added: 'ポイ活タスク完了',
  poi_updated: 'ポイ活記録更新',
};

/**
 * 家族メンバーの名前を取得
 */
const getMemberName = (memberId: string): string => {
  const member = FAMILY_MEMBERS.find(m => m.id === memberId);
  return member ? member.name : memberId;
};

/**
 * イベント追加時の通知を作成
 */
export const createEventAddedNotification = async (
  event: Event,
  createdBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(createdBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'event_added',
      title: NOTIFICATION_TITLES.event_added,
      message: NOTIFICATION_MESSAGES.event_added(event, memberName),
      targetId: event.id,
      targetType: 'event',
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('イベント追加通知の作成に失敗しました:', error);
  }
};

/**
 * イベント更新時の通知を作成
 */
export const createEventUpdatedNotification = async (
  event: Event,
  updatedBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(updatedBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'event_updated',
      title: NOTIFICATION_TITLES.event_updated,
      message: NOTIFICATION_MESSAGES.event_updated(event, memberName),
      targetId: event.id,
      targetType: 'event',
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('イベント更新通知の作成に失敗しました:', error);
  }
};

/**
 * TODO追加時の通知を作成
 */
export const createTodoAddedNotification = async (
  todo: TodoItem,
  createdBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(createdBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'todo_added',
      title: NOTIFICATION_TITLES.todo_added,
      message: NOTIFICATION_MESSAGES.todo_added(todo, memberName),
      targetId: todo.id,
      targetType: 'todo',
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('TODO追加通知の作成に失敗しました:', error);
  }
};

/**
 * TODO更新時の通知を作成
 */
export const createTodoUpdatedNotification = async (
  todo: TodoItem,
  updatedBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(updatedBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'todo_updated',
      title: NOTIFICATION_TITLES.todo_updated,
      message: NOTIFICATION_MESSAGES.todo_updated(todo, memberName),
      targetId: todo.id,
      targetType: 'todo',
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('TODO更新通知の作成に失敗しました:', error);
  }
};

/**
 * ポイ活追加時の通知を作成
 */
export const createPoiAddedNotification = async (
  record: PoiRecord,
  createdBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(createdBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'poi_added',
      title: NOTIFICATION_TITLES.poi_added,
      message: NOTIFICATION_MESSAGES.poi_added(record, memberName),
      targetId: record.id,
      targetType: 'poi',
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('ポイ活追加通知の作成に失敗しました:', error);
  }
};

/**
 * ポイ活更新時の通知を作成
 */
export const createPoiUpdatedNotification = async (
  record: PoiRecord,
  updatedBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(updatedBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'poi_updated',
      title: NOTIFICATION_TITLES.poi_updated,
      message: NOTIFICATION_MESSAGES.poi_updated(record, memberName),
      targetId: record.id,
      targetType: 'poi',
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('ポイ活更新通知の作成に失敗しました:', error);
  }
};

/**
 * カスタム通知を作成
 */
export const createCustomNotification = async (
  type: NotificationType,
  title: string,
  message: string,
  targetId: string,
  targetType: 'event' | 'todo' | 'poi',
  createdBy: string
): Promise<void> => {
  try {
    const memberName = getMemberName(createdBy);
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type,
      title,
      message,
      targetId,
      targetType,
      createdBy: memberName,
      isRead: false,
    };

    await notificationService.addNotification(notification);
  } catch (error) {
    console.error('カスタム通知の作成に失敗しました:', error);
  }
};
