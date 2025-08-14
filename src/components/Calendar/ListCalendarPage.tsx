'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, Event } from '@/types';
import { eventService } from '@/lib/firestore';

export default function ListCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

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

  // 特定の日付と家族メンバーの予定を取得
  const getEventsForDayAndMember = (day: Date, memberId: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr && event.familyMemberId === memberId);
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
          
          <div className="flex items-center">
            <Calendar size={20} className="text-white" />
            <span className="ml-2 text-sm font-medium text-white">リストビュー</span>
          </div>
        </div>
      </header>

      {/* 家族メンバーヘッダー */}
      <div className="glass-card mx-4 mt-2 fade-in">
        <div className="grid grid-cols-5 gap-2 p-3">
          {/* 日付列のヘッダー */}
          <div className="glass-day p-3 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">日付</span>
          </div>
          {/* 家族メンバー列のヘッダー */}
          {FAMILY_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="glass-day p-3"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  className={`w-4 h-4 rounded-full ${COLOR_MAP[member.color].bg} border-2 border-white shadow-lg`}
                />
                <span className="text-xs font-semibold text-white whitespace-nowrap">
                  {member.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* リストカレンダー（表形式） */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        <div className="glass-card p-3 space-y-2 fade-in">
          {days.map((day) => (
            <div key={day.toISOString()} className="glass-day hover:scale-[1.01] transition-all duration-300">
              <div className="grid grid-cols-5 gap-3 min-h-[80px] p-3">
                {/* 日付列 */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">
                      {format(day, 'M/d', { locale: ja })}
                    </div>
                    <div className="text-xs text-white text-opacity-70">
                      {format(day, '(E)', { locale: ja })}
                    </div>
                  </div>
                </div>

                {/* 各家族メンバーの予定列 */}
                {FAMILY_MEMBERS.map((member) => {
                  const memberEvents = getEventsForDayAndMember(day, member.id);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-center"
                    >
                      <div className="w-full space-y-1">
                        {loading ? (
                          <div className="text-xs text-white text-opacity-60 text-center py-2">
                            <div className="animate-pulse">...</div>
                          </div>
                        ) : memberEvents.length > 0 ? (
                          memberEvents.map((event) => (
                            <div
                              key={event.id}
                              className="glass-event text-xs p-2 hover:scale-105 transition-all duration-300"
                              title={event.description || event.title}
                            >
                              <div className="flex items-center space-x-1">
                                <div 
                                  className={`w-2 h-2 rounded-full ${COLOR_MAP[member.color].bg} flex-shrink-0`}
                                />
                                <div className="font-medium truncate text-white">
                                  {event.title}
                                </div>
                              </div>
                              {!event.isAllDay && event.time && (
                                <div className="text-xs text-white text-opacity-80 mt-1 ml-3">
                                  {event.time}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-white text-opacity-40 text-center py-2">
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />
    </div>
  );
}
