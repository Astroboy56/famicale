'use client';

import TodoPage from '@/components/Todo/TodoPage';
import BottomNavigation from '@/components/Layout/BottomNavigation';

export default function TodoPageWrapper() {
  return (
    <>
      <TodoPage />
      <BottomNavigation />
    </>
  );
}
