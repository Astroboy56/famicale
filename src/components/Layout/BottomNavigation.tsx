'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Calendar, List, Plus, CheckSquare, Clock } from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  icon: typeof Calendar;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'calendar', name: 'カレンダー', icon: Calendar, path: '/' },
  { id: 'list', name: 'リスト', icon: List, path: '/list' },
  { id: 'shift', name: 'シフト', icon: Clock, path: '/shift' },
  { id: 'todo', name: 'TODO', icon: CheckSquare, path: '/todo' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-4 left-4 right-4 glass-nav safe-area-inset-bottom rounded-2xl">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 rounded-xl mx-1 glass-select-button ${
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

