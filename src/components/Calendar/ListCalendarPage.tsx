'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
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
            <span className="mr-2 text-sm font-medium text-white">リストビュー</span>
            <Calendar size={20} className="text-white" />
          </div>
        </div>
      </header>

      {/* ヘッダー行 */}
      <div className="glass-card mx-4 mt-2 fade-in">
        <div className="flex items-center p-3">
          {/* 日付ヘッダー */}
          <div className="flex items-center justify-center min-w-[40px]">
            <span className="text-xs font-semibold text-white">日付</span>
          </div>
          {/* 縦線 */}
          <div className="w-px h-4 bg-white bg-opacity-30 mx-3"></div>
          {/* 家族メンバーヘッダー */}
          <div className="flex items-center space-x-3 flex-1">
            {FAMILY_MEMBERS.map((member, index) => (
              <div key={member.id} className="flex items-center justify-center flex-1">
                <span className="text-xs font-semibold text-white">
                  {member.name}
                </span>
                {/* 最後のメンバー以外に縦線を追加 */}
                {index < FAMILY_MEMBERS.length - 1 && (
                  <div className="w-px h-4 bg-white bg-opacity-30 mx-3"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

             {/* リストカレンダー（表形式） */}
       <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
         <div className="glass-card p-2 space-y-1 fade-in">
          {days.map((day) => (
                                                   <div key={day.toISOString()} className={`glass-day hover:scale-[1.01] transition-all duration-300 ${
               !isSameMonth(day, currentDate) ? 'opacity-50' : ''
             }`}>
                                                                 <div className="flex items-center p-2">
                     {/* 日付列 */}
                     <div className="flex items-center justify-center min-w-[40px]">
                       <div className="text-center">
                         <div className={`text-xs font-bold ${
                           !isSameMonth(day, currentDate) ? 'text-white text-opacity-40' : 'text-white'
                         }`}>
                           {format(day, 'M/d', { locale: ja })}
                         </div>
                         <div className={`text-[10px] ${
                           !isSameMonth(day, currentDate) ? 'text-white text-opacity-30' : 'text-white text-opacity-70'
                         }`}>
                           {format(day, '(E)', { locale: ja })}
                         </div>
                       </div>
                     </div>

                     {/* 各家族メンバーの予定列 */}
                     <div className="flex items-center space-x-3 flex-1 ml-3">
                       {FAMILY_MEMBERS.map((member) => {
                         const memberEvents = getEventsForDayAndMember(day, member.id);
                         return (
                           <div key={member.id} className="flex items-center justify-center flex-1">
                             <div className="min-w-[60px] space-y-0.5">
                               {loading ? (
                                 <div className="text-[10px] text-white text-opacity-60 text-center py-1">
                                   <div className="animate-pulse">...</div>
                                 </div>
                               ) : memberEvents.length > 0 ? (
                                 memberEvents.map((event) => (
                                   <div
                                     key={event.id}
                                     className="glass-event text-[10px] p-1 hover:scale-105 transition-all duration-300"
                                     title={event.description || event.title}
                                   >
                                     <div className="font-medium truncate text-white">
                                       {event.title}
                                     </div>
                                     {!event.isAllDay && event.time && (
                                       <div className="text-[8px] text-white text-opacity-80 mt-0.5">
                                         {event.time}
                                       </div>
                                     )}
                                   </div>
                                 ))
                               ) : (
                                 <div className="text-[10px] text-white text-opacity-40 text-center py-1">
                                   -
                                 </div>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
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
