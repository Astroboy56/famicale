'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, List, Calendar } from 'lucide-react';
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
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // カレンダー日付をメモ化
  const { days } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    return { days };
  }, [currentDate]);

  // リアルタイムで予定データを監視
  useEffect(() => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // リアルタイムリスナーを設定
    const unsubscribe = eventService.subscribeToEvents(year, month, (fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => {
      unsubscribe();
    };
  }, [currentDate]);

  // 予定データの読み込み（フォールバック用）
  const loadEvents = useCallback(async () => {
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
  }, [currentDate]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  // 特定の日の予定を取得
  const getEventsForDay = useCallback((day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => {
      // シフト入力の「休み」イベントはカレンダーで非表示
      if (event.type === 'shift' && event.title === '休み') {
        return false;
      }
      return event.date === dateStr;
    });
  }, [events]);

  // 日付クリック時の処理
  const handleDayClick = useCallback((day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
  }, []);

  // 予定追加後のコールバック
  const handleEventAdded = useCallback(() => {
    loadEvents(); // 予定を再読み込み
  }, [loadEvents]);

  // 予定編集開始のコールバック
  const handleEventEdit = useCallback((event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }, []);

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



  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar size={20} className="text-white" />
            <span className="ml-2 text-sm font-medium text-white">カレンダー</span>
          </div>
          
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
        </div>
      </header>

      {/* 家族メンバー表示 */}
      <div className="glass-card mx-4 mt-2 px-4 py-3 fade-in">
        <div className="flex justify-center space-x-6">
          {FAMILY_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded-full ${COLOR_MAP[member.color].bg} shadow-lg`}
              />
              <span className="text-sm font-medium text-glass">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* カレンダー部分 */}
      <div className="h-[60%] overflow-hidden px-4 mt-4">
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
      <div className="h-[20%] overflow-y-auto px-4 pb-20 mt-2">
        <div className="glass-card p-2 fade-in">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-glass">
              {selectedDate ? (
                format(new Date(selectedDate + 'T00:00:00'), 'M月d日(E)', { locale: ja }) + 'の予定'
              ) : (
                '今日の予定'
              )}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const targetDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
                  setSelectedDate(targetDate);
                  setIsModalOpen(true);
                }}
                className="glass-button flex items-center space-x-2 px-3 py-2 text-xs"
              >
                <Plus size={14} className="text-white" />
                <span className="text-white font-medium">追加</span>
              </button>
              <button
                onClick={() => router.push('/bulk')}
                className="glass-button flex items-center space-x-2 px-3 py-2 text-xs"
              >
                <List size={14} className="text-white" />
                <span className="text-white font-medium">一括入力</span>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-white py-4">
              <div className="animate-pulse">読み込み中...</div>
            </div>
          ) : (
            <>
              {(() => {
                const targetDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
                const targetEvents = events.filter(e => {
                  // シフト入力の「休み」イベントは今日の予定欄でも非表示
                  if (e.type === 'shift' && e.title === '休み') {
                    return false;
                  }
                  return e.date === targetDate;
                });
                return targetEvents.length > 0 ? (
                  <div className="space-y-2">
                    {targetEvents.map((event) => (
                      <div
                        key={event.id}
                        className="glass-event p-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                        onClick={() => handleEventEdit(event)}
                        title="タップまたは長押しで編集・削除"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <span className="text-xs text-white text-opacity-80 px-2 py-1 rounded-full glass-area">
                            {getMemberName(event.familyMemberId)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-white text-opacity-90 mt-1">{event.description}</p>
                        )}
                        {!event.isAllDay && event.time && (
                          <div className="text-xs text-white text-opacity-80 mt-1 glass-area px-2 py-1 rounded inline-block">
                            {event.time}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white py-4">
                    <div className="text-opacity-70">
                      {selectedDate ? '予定なし' : '今日の予定はありません'}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />

      {/* 予定追加・編集モーダル */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        selectedDate={selectedDate || format(new Date(), 'yyyy-MM-dd')}
        onEventAdded={handleEventAdded}
        editingEvent={editingEvent}
      />

      {/* 設定モーダル */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
