'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
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
import SettingsModal from '@/components/Settings/SettingsModal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // カレンダー表示用に、月の最初の週の開始から最後の週の終了まで取得
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜日開始
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="glass-button p-2"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-semibold text-glass">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </h1>
            <button
              onClick={() => navigateMonth('next')}
              className="glass-button p-2"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
          
          {/* 設定ボタン */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="glass-button p-2 rounded-full"
            >
              <Settings size={20} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* 家族メンバー表示 */}
      <div className="glass-card mx-4 mt-2 px-4 py-3 fade-in">
        <div className="flex justify-center space-x-6">
          {FAMILY_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded-full ${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} border-2 shadow-lg`}
              />
              <span className="text-sm font-medium text-glass">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* カレンダー部分 */}
      <div className="h-[65%] overflow-hidden px-4 mt-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex flex-col glass-card fade-in">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 border-b border-white border-opacity-20">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div
                  key={day}
                  className={`py-0.5 text-center text-sm font-semibold ${
                    index === 0 ? 'text-red-300' : index === 6 ? 'text-blue-300' : 'text-white'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="flex-1">
              <div className="grid grid-cols-7 grid-rows-6 h-full gap-1 p-2">
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
      <div className="h-[30%] overflow-y-auto px-4 pb-4 mt-2">
        <div className="glass-card p-3 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-glass">今日の予定</h2>
            <button
              onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                setSelectedDate(today);
                setSelectedDayEvents(events.filter(e => e.date === today));
                setIsModalOpen(true);
              }}
              className="glass-button flex items-center space-x-2 px-4 py-2 text-sm"
            >
              <Plus size={16} className="text-white" />
              <span className="text-white font-medium">追加</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center text-white py-8">
              <div className="animate-pulse">読み込み中...</div>
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
                        className="glass-event p-3 hover:scale-[1.02] transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <span className="text-xs text-white text-opacity-80 px-2 py-1 rounded-full glass-area">
                            {getMemberName(event.familyMemberId)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-white text-opacity-90 mt-2">{event.description}</p>
                        )}
                        {!event.isAllDay && event.time && (
                          <div className="text-xs text-white text-opacity-80 mt-2 glass-area px-2 py-1 rounded inline-block">
                            {event.time}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white py-8">
                    <div className="text-opacity-70">今日の予定はありません</div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />

      {/* 予定追加モーダル */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onEventAdded={handleEventAdded}
      />

      {/* 設定モーダル */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
