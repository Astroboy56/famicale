'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Grid3X3, List, Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { FAMILY_MEMBERS, COLOR_MAP, Event } from '@/types';
import { eventService } from '@/lib/firestore';
import EventModal from './EventModal';
import { DroppableDay } from './DroppableDay';
import { DraggableEvent } from './DraggableEvent';

type ViewMode = 'month' | 'week';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 予定データの読み込み
  const loadEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const fetchedEvents = await eventService.getEventsByMonth(year, month);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('予定の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // 月が変わったときに予定を再読み込み
  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 特定の日の予定を取得
  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  // 日付クリック時の処理
  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setSelectedDayEvents(getEventsForDay(day));
    setIsModalOpen(true);
  };

  // 予定追加後のコールバック
  const handleEventAdded = () => {
    loadEvents(); // 予定を再読み込み
  };

  // ドラッグ開始時の処理
  const handleDragStart = (event: DragStartEvent) => {
    const draggedEvent = event.active.data.current?.event as Event;
    setActiveEvent(draggedEvent);
  };

  // ドラッグ終了時の処理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEvent(null);

    if (!over) return;

    const draggedEvent = active.data.current?.event as Event;
    const targetDate = over.id as string;

    // 同じ日付にドロップした場合は何もしない
    if (draggedEvent.date === targetDate) return;

    try {
      // Firestoreで予定の日付を更新
      await eventService.updateEvent(draggedEvent.id, {
        date: targetDate,
      });

      // ローカルステートを更新
      setEvents(prevEvents =>
        prevEvents.map(evt =>
          evt.id === draggedEvent.id
            ? { ...evt, date: targetDate }
            : evt
        )
      );

      console.log(`予定「${draggedEvent.title}」を${targetDate}に移動しました`);
    } catch (error) {
      console.error('予定の移動に失敗しました:', error);
      // エラーが発生した場合は元のデータを再読み込み
      loadEvents();
    }
  };

  // 家族メンバー名を取得
  const getMemberName = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.name || '';
  };

  // 家族メンバーの色を取得
  const getMemberColor = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.color || 'blue';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </h1>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg ${
                viewMode === 'month' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-2 rounded-lg ${
                viewMode === 'week' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 家族メンバー表示 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-4">
          {FAMILY_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} border`}
              />
              <span className="text-sm font-medium">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* カレンダー部分 */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex flex-col">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 bg-white border-b border-gray-200">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div
                  key={day}
                  className={`py-2 text-center text-sm font-medium ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="flex-1 bg-white">
              <div className="grid grid-cols-7 h-full">
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <DroppableDay
                      key={day.toISOString()}
                      day={day}
                      currentDate={currentDate}
                      events={dayEvents}
                      onClick={handleDayClick}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ドラッグオーバーレイ */}
          <DragOverlay>
            {activeEvent ? (
              <DraggableEvent event={activeEvent} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 予定情報表示エリア（下半分） */}
      <div className="h-[40%] bg-white border-t border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">今日の予定</h2>
            <button
              onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                setSelectedDate(today);
                setSelectedDayEvents(events.filter(e => e.date === today));
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>追加</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              読み込み中...
            </div>
          ) : (
            <>
              {(() => {
                const todayEvents = events.filter(e => e.date === format(new Date(), 'yyyy-MM-dd'));
                return todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${COLOR_MAP[getMemberColor(event.familyMemberId)].bg} ${COLOR_MAP[getMemberColor(event.familyMemberId)].border}`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{event.title}</h3>
                          <span className="text-xs text-gray-500">
                            {getMemberName(event.familyMemberId)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        {!event.isAllDay && event.time && (
                          <div className="text-xs text-gray-500 mt-1">
                            {event.time}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    今日の予定はありません
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-16 bg-transparent" />

      {/* 予定追加モーダル */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onEventAdded={handleEventAdded}
      />
    </div>
  );
}
