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
          
          <div className="flex items-center">
            <Calendar size={20} className="text-gray-600" />
            <span className="ml-2 text-sm font-medium text-gray-600">リストビュー</span>
          </div>
        </div>
      </header>

      {/* 家族メンバーヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="grid grid-cols-5 gap-0">
          {/* 日付列のヘッダー */}
          <div className="bg-gray-50 border-r border-gray-200 px-3 py-3">
            <span className="text-sm font-semibold text-gray-700">日付</span>
          </div>
          {/* 家族メンバー列のヘッダー */}
          {FAMILY_MEMBERS.map((member) => (
            <div
              key={member.id}
              className={`${COLOR_MAP[member.color].bg} border-r border-gray-200 px-2 py-3 last:border-r-0`}
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <div
                  className={`w-3 h-3 rounded-full ${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} border`}
                />
                <span className={`text-xs font-medium ${COLOR_MAP[member.color].text} whitespace-nowrap`}>
                  {member.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* リストカレンダー（表形式） */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white">
          {days.map((day) => (
            <div key={day.toISOString()} className="border-b border-gray-100">
              <div className="grid grid-cols-5 gap-0 min-h-[80px]">
                {/* 日付列 */}
                <div className="bg-gray-50 border-r border-gray-200 px-3 py-3 flex items-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {format(day, 'M/d', { locale: ja })}
                    </div>
                    <div className="text-xs text-gray-500">
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
                      className="border-r border-gray-200 px-2 py-3 last:border-r-0"
                    >
                      <div className="space-y-1">
                        {loading ? (
                          <div className="text-xs text-gray-400 text-center py-2">
                            ...
                          </div>
                        ) : memberEvents.length > 0 ? (
                          memberEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-2 rounded ${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].text} border ${COLOR_MAP[member.color].border}`}
                              title={event.description || event.title}
                            >
                              <div className="font-medium truncate">
                                {event.title}
                              </div>
                              {!event.isAllDay && event.time && (
                                <div className="text-xs opacity-75 mt-1">
                                  {event.time}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-300 text-center py-2">
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
      <div className="h-16 bg-transparent" />
    </div>
  );
}
