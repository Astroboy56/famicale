'use client';

import { useDroppable } from '@dnd-kit/core';
import { format, isSameMonth, isToday } from 'date-fns';
import { Event } from '@/types';
import { DraggableEvent } from './DraggableEvent';

interface DroppableDayProps {
  day: Date;
  currentDate: Date;
  events: Event[];
  onClick: (day: Date) => void;
  isDraggedOver?: boolean;
}

export function DroppableDay({ 
  day, 
  currentDate, 
  events, 
  onClick,
  isDraggedOver = false 
}: DroppableDayProps) {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
    data: {
      date: format(day, 'yyyy-MM-dd'),
    },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(day)}
      className={`border-r border-b border-gray-100 p-2 min-h-[80px] cursor-pointer transition-all duration-200 ${
        !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
      } ${isToday(day) ? 'bg-blue-50' : ''} ${
        isOver ? 'bg-green-100 ring-2 ring-green-300' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`text-sm ${
        !isSameMonth(day, currentDate) ? 'text-gray-400' : 
        isToday(day) ? 'text-blue-600 font-semibold' : 'text-gray-900'
      }`}>
        {format(day, 'd')}
      </div>
      
      {/* 予定表示 */}
      <div className="mt-1 space-y-1">
        {events.slice(0, 2).map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
          />
        ))}
        {events.length > 2 && (
          <div className="text-xs text-gray-500">
            +{events.length - 2}件
          </div>
        )}
      </div>
    </div>
  );
}
