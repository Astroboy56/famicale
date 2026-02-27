'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, List, CheckSquare, Clock, Settings, ChevronRight, ChevronLeft, Coins } from 'lucide-react';
import { notificationService } from '@/lib/firestore';
import { Notification } from '@/types';

interface NavigationItem {
  id: string;
  name: string;
  icon: typeof Calendar;
  path: string;
  onClick?: () => void;
  hasUpdates?: boolean;
}

// 1ページ目のナビゲーションアイテム
const navigationItemsPage1: NavigationItem[] = [
  { id: 'calendar', name: 'カレンダー', icon: Calendar, path: '/' },
  { id: 'list', name: 'リスト', icon: List, path: '/list' },
  { id: 'shift', name: 'シフト', icon: Clock, path: '/shift' },
  { id: 'todo', name: 'TODO', icon: CheckSquare, path: '/todo' },
  { id: 'next', name: '次へ', icon: ChevronRight, path: '', onClick: () => {} },
];

// 2ページ目のナビゲーションアイテム
const navigationItemsPage2: NavigationItem[] = [
  { id: 'prev', name: '戻る', icon: ChevronLeft, path: '', onClick: () => {} },
  { id: 'poi', name: 'ポイ活', icon: Coins, path: '/poi' },
  { id: 'settings', name: '設定', icon: Settings, path: '/settings' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 未読通知を監視
  useEffect(() => {
    const unsubscribe = notificationService.subscribeToUnreadNotifications((unreadNotifications) => {
      setNotifications(unreadNotifications);
    });

    return () => unsubscribe();
  }, []);

  // 通知の種類ごとに更新があるかチェック
  const hasEventUpdates = notifications.some(n => n.type === 'event_added' || n.type === 'event_updated');
  const hasTodoUpdates = notifications.some(n => n.type === 'todo_added' || n.type === 'todo_updated');
  const hasPoiUpdates = notifications.some(n => n.type === 'poi_added' || n.type === 'poi_updated');

  // 現在のページのナビゲーションアイテムを取得（更新状態を含む）
  const getCurrentNavigationItems = () => {
    if (currentPage === 1) {
      return navigationItemsPage1.map(item => ({
        ...item,
        hasUpdates: 
          (item.id === 'calendar' && hasEventUpdates) ||
          (item.id === 'todo' && hasTodoUpdates)
      }));
    } else {
      return navigationItemsPage2.map(item => ({
        ...item,
        hasUpdates: item.id === 'poi' && hasPoiUpdates
      }));
    }
  };

  const currentNavigationItems = getCurrentNavigationItems();

  // クリックハンドラー
  const handleNavigationClick = (item: NavigationItem) => {
    if (item.id === 'next') {
      setCurrentPage(2);
    } else if (item.id === 'prev') {
      setCurrentPage(1);
    } else if (item.onClick) {
      item.onClick();
    } else {
      router.push(item.path);
    }
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 glass-nav safe-area-inset-bottom rounded-2xl">
      <div className={`grid h-16 ${currentPage === 1 ? 'grid-cols-5' : 'grid-cols-3'}`}>
        {currentNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigationClick(item)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 rounded-xl mx-1 glass-select-button relative ${
                isActive
                  ? 'selected text-white'
                  : 'text-white text-opacity-70 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.hasUpdates && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center animate-pulse"></span>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

