'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, Event } from '@/types';
import { eventService } from '@/lib/firestore';

// デフォルトのシフトボタン設定
const DEFAULT_SHIFT_BUTTONS = [
  { id: 'day', name: '日勤', color: 'bg-orange-500', textColor: 'text-white' },
  { id: 'semi-night', name: '準夜', color: 'bg-cyan-400', textColor: 'text-white' },
  { id: 'night', name: '深夜', color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'off', name: '休み', color: 'bg-pink-700', textColor: 'text-white' },
];

export default function ShiftInputPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [shiftButtons, setShiftButtons] = useState(DEFAULT_SHIFT_BUTTONS);
  const [showSettings, setShowSettings] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
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

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  // 特定の日付の予定を取得
  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

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

  // シフトボタンを押した時の処理
  const handleShiftButton = async (shiftType: string) => {
    if (!selectedDate) return;

    try {
      const shiftButton = shiftButtons.find(btn => btn.id === shiftType);
      if (!shiftButton) return;

      // 選択された日付にシフトを登録
      await eventService.addEvent({
        title: shiftButton.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        familyMemberId: FAMILY_MEMBERS[0].id, // デフォルトで最初のメンバー
        isAllDay: true,
        type: 'shift',
        color: shiftButton.color,
      });

      // 次の日に移動
      setSelectedDate(addDays(selectedDate, 1));
      await loadEvents();
    } catch (error) {
      console.error('シフトの登録に失敗しました:', error);
    }
  };

  // 日付を選択
  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
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
          
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-white" />
            <span className="text-sm font-medium text-white">シフト入力</span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="glass-button p-2"
            >
              <Settings size={16} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* 月カレンダー */}
      <div className="flex-1 overflow-y-auto px-4 mt-4">
        <div className="glass-card p-2 fade-in">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-xs font-semibold text-white">{day}</span>
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(day)}
                  className={`min-h-[60px] p-2 rounded-lg transition-all duration-300 ${
                    isSelected
                      ? 'glass-day ring-2 ring-blue-400'
                      : isCurrentMonth
                      ? 'glass-day hover:scale-105'
                      : 'glass-day opacity-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-sm font-bold ${
                      isCurrentMonth ? 'text-white' : 'text-white text-opacity-40'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[8px] px-1 py-0.5 rounded truncate ${
                              event.color || 'bg-blue-500'
                            } text-white`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[8px] text-white text-opacity-60">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* シフトボタンエリア */}
      <div className="px-4 mt-4 pb-4">
        <div className="glass-card p-4 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {selectedDate 
                ? `${format(selectedDate, 'M月d日', { locale: ja })}のシフト入力`
                : '日付を選択してください'
              }
            </h2>
          </div>

          {/* シフトボタングリッド */}
          <div className="grid grid-cols-2 gap-3">
            {shiftButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => handleShiftButton(button.id)}
                disabled={!selectedDate}
                className={`p-4 rounded-lg transition-all duration-300 ${
                  button.color
                } ${button.textColor} ${
                  selectedDate 
                    ? 'hover:scale-105 shadow-lg' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold">{button.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />
    </div>
  );
}
