'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Calendar, List, CheckSquare, Clock, Settings, ChevronRight, ChevronLeft, Coins } from 'lucide-react';
import { NotificationBadge } from '@/components/Notification/NotificationBadge';

interface NavigationItem {
  id: string;
  name: string;
  icon: typeof Calendar;
  path: string;
  onClick?: () => void;
}

// 1ページ目のナビゲーションアイテム
const navigationItemsPage1: NavigationItem[] = [
  { id: 'calendar', name: 'カレンダー', icon: Calendar, path: '/' },
  { id: 'list', name: 'リスト', icon: List, path: '/list' },
  { id: 'shift', name: 'シフト', icon: Clock, path: '/shift' },
  { id: 'todo', name: 'TODO', icon: CheckSquare, path: '/todo' },
  { id: 'notifications', name: '通知', icon: () => null, path: '', onClick: () => {} },
];

// 2ページ目のナビゲーションアイテム
const navigationItemsPage2: NavigationItem[] = [
  { id: 'prev', name: '戻る', icon: ChevronLeft, path: '', onClick: () => {} },
  { id: 'poi', name: 'ポイ活', icon: Coins, path: '/poi' },
  { id: 'settings', name: '設定', icon: Settings, path: '/settings' },
  { id: 'next', name: '次へ', icon: ChevronRight, path: '', onClick: () => {} },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // 現在のページのナビゲーションアイテムを取得
  const currentNavigationItems = currentPage === 1 ? navigationItemsPage1 : navigationItemsPage2;

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
      <div className="grid grid-cols-5 h-16">
        {currentNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigationClick(item)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 rounded-xl mx-1 glass-select-button ${
                isActive
                  ? 'selected text-white'
                  : 'text-white text-opacity-70 hover:text-white'
              }`}
            >
              {item.id === 'notifications' ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <NotificationBadge />
                </div>
              ) : (
                <Icon size={20} />
              )}
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

