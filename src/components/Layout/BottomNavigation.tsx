'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Calendar, List, Plus, CheckSquare } from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  icon: typeof Calendar;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'calendar', name: 'カレンダー', icon: Calendar, path: '/' },
  { id: 'list', name: 'リスト', icon: List, path: '/list' },
  { id: 'bulk', name: '一括入力', icon: Plus, path: '/bulk' },
  { id: 'todo', name: 'TODO', icon: CheckSquare, path: '/todo' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive
                  ? 'text-white bg-white bg-opacity-20 scale-105'
                  : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
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

