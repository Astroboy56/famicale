'use client';

import { useDraggable } from '@dnd-kit/core';
import { useState, useRef, useEffect } from 'react';
import { Event } from '@/types';
import { FAMILY_MEMBERS, COLOR_MAP } from '@/types';
import { EventActionModal } from './EventActionModal';

interface CalendarEventDotProps {
  event: Event;
  onEventUpdate?: () => void;
  onEventEdit?: (event: Event) => void;
}

export function CalendarEventDot({ event, onEventUpdate, onEventEdit }: CalendarEventDotProps) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);

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

  // ドラッグ状態を追跡
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // 家族メンバーの色を取得
  const getMemberColor = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.color || 'blue';
  };

  // 家族メンバー名を取得
  const getMemberName = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.name || '';
  };

  // 長押し開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingRef.current) return;
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      setShowActionModal(true);
    }, 500); // 500msで長押し判定
  };

  // 長押し終了
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // タッチ開始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDraggingRef.current) return;
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      setShowActionModal(true);
    }, 500);
  };

  // タッチ終了
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // クリック（短押し）
  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current || isLongPress) {
      e.preventDefault();
      return;
    }
    
    // 短押しでもモーダルを表示
    setShowActionModal(true);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 shadow-2xl z-50 scale-110' : 'hover:scale-105'
        } touch-manipulation transition-all duration-300`}
        title={`${event.title} - ${getMemberName(event.familyMemberId)} (長押しまたはタップで編集・削除)`}
      >
        <div 
          className={`w-3 h-3 rounded-full ${COLOR_MAP[getMemberColor(event.familyMemberId)].bg} shadow-sm`}
        />
      </div>

      <EventActionModal
        event={event}
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setIsLongPress(false);
        }}
        onEdit={(event) => {
          // 編集機能を呼び出し
          onEventEdit?.(event);
        }}
        onDelete={() => {
          onEventUpdate?.();
        }}
      />
    </>
  );
}
