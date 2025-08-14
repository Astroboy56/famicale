'use client';

import { useDraggable } from '@dnd-kit/core';
import { Event } from '@/types';
import { FAMILY_MEMBERS, COLOR_MAP } from '@/types';

interface DraggableEventProps {
  event: Event;
}

export function DraggableEvent({ event }: DraggableEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: event.id,
    data: {
      event,
    },
  });

  // 家族メンバーの色を取得
  const getMemberColor = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.color || 'blue';
  };

  // 家族メンバー名を取得
  const getMemberName = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.name || '';
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`text-xs p-1 rounded truncate cursor-grab active:cursor-grabbing ${
        COLOR_MAP[getMemberColor(event.familyMemberId)].bg
      } ${COLOR_MAP[getMemberColor(event.familyMemberId)].text} ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      } touch-manipulation`}
      title={`${event.title} - ${getMemberName(event.familyMemberId)}`}
    >
      {event.title}
    </div>
  );
}
