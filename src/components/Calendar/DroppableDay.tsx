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
      className={`glass-day p-1 min-h-[65px] cursor-pointer ${
        !isSameMonth(day, currentDate) ? 'opacity-50' : ''
      } ${isToday(day) ? 'today' : ''} ${
        isOver ? 'glass-area ring-2 ring-white ring-opacity-50 scale-105' : ''
      }`}
    >
      <div className={`text-sm font-medium ${
        !isSameMonth(day, currentDate) ? 'text-white text-opacity-40' : 
        isToday(day) ? 'text-white font-bold' : 'text-white'
      }`}>
        {format(day, 'd')}
      </div>
      
      {/* 予定表示 */}
      <div className="mt-2 space-y-1">
        {events.slice(0, 2).map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
          />
        ))}
        {events.length > 2 && (
          <div className="text-xs text-white text-opacity-70 glass-area px-1 py-0.5 rounded text-center">
            +{events.length - 2}件
          </div>
        )}
      </div>
    </div>
  );
}

