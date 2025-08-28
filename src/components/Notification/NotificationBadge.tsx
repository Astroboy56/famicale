'use client';

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/lib/firestore';
import { Notification } from '@/types';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  // 必要に応じてプロパティを追加
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 未読通知をリアルタイムで監視
    const unsubscribe = notificationService.subscribeToUnreadNotifications((notifications) => {
      setUnreadCount(notifications.length);
    });

    return () => unsubscribe();
  }, []);

  const handleBadgeClick = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const allNotifications = await notificationService.getAllNotifications();
      setNotifications(allNotifications);
      setIsOpen(true);
    } catch (error) {
      console.error('通知の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // 通知リストを更新
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('通知の既読化に失敗しました:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // 全ての通知を既読に更新
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('通知の一括既読化に失敗しました:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_added':
      case 'event_updated':
        return '📅';
      case 'todo_added':
      case 'todo_updated':
        return '📝';
      case 'poi_added':
      case 'poi_updated':
        return '⭐';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* 通知バッジ */}
      <button
        onClick={handleBadgeClick}
        className="relative p-1 glass-button rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300"
        disabled={loading}
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知センター */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 glass-card rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">通知</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    全て既読
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-300 hover:text-white transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-300">
                通知はありません
              </div>
            ) : (
              <div className="divide-y divide-white divide-opacity-10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white hover:bg-opacity-5 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-500 bg-opacity-10' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 ml-2"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {notification.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
