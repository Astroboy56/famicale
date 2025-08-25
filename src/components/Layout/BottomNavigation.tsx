'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Calendar, List, Plus, CheckSquare, Clock, Settings, ChevronRight, ChevronLeft } from 'lucide-react';

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
  { id: 'next', name: '次へ', icon: ChevronRight, path: '', onClick: () => {} },
];

// 2ページ目のナビゲーションアイテム
const navigationItemsPage2: NavigationItem[] = [
  { id: 'prev', name: '戻る', icon: ChevronLeft, path: '', onClick: () => {} },
  { id: 'bulk', name: '一括入力', icon: Plus, path: '/bulk' },
  { id: 'settings', name: '設定', icon: Settings, path: '/settings' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // 現在のページのナビゲーションアイテムを取得
  const currentNavigationItems = useMemo(() => {
    return currentPage === 1 ? navigationItemsPage1 : navigationItemsPage2;
  }, [currentPage]);

  // クリックハンドラーをメモ化
  const handleNavigationClick = useCallback((item: NavigationItem) => {
    if (item.id === 'next') {
      setCurrentPage(2);
    } else if (item.id === 'prev') {
      setCurrentPage(1);
    } else if (item.onClick) {
      item.onClick();
    } else {
      router.push(item.path);
    }
  }, [router]);

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
              <Icon size={20} />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

