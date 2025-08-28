'use client';

import { useDroppable } from '@dnd-kit/core';
import { format, isSameMonth, isToday } from 'date-fns';
import { Event } from '@/types';

import { CalendarEventDot } from './CalendarEventDot';

interface DroppableDayProps {
  day: Date;
  currentDate: Date;
  events: Event[];
  onClick: (day: Date) => void;
}

export function DroppableDay({ 
  day, 
  currentDate, 
  events, 
  onClick
}: DroppableDayProps) {
  const {
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
      } ${isToday(day) ? 'today' : ''}`}
    >
      <div className={`text-sm font-medium ${
        !isSameMonth(day, currentDate) ? 'text-white text-opacity-40' : 
        isToday(day) ? 'text-white font-bold' : 'text-white'
      }`}>
        {format(day, 'd')}
      </div>
      
      {/* 予定表示（●のみ） */}
      <div className="mt-2 flex flex-wrap gap-1 justify-center">
        {events.slice(0, 6).map((event) => (
          <CalendarEventDot
            key={event.id}
            event={event}
          />
        ))}
        {events.length > 6 && (
          <div className="text-xs text-white text-opacity-70 glass-area px-1 py-0.5 rounded text-center">
            +{events.length - 6}
          </div>
        )}
      </div>
    </div>
  );
}

