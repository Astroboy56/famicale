'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { FAMILY_MEMBERS, Event } from '@/types';
import { eventService } from '@/lib/firestore';
import { getWeatherByZipcode, getWeatherForDate, WeatherData, testWeatherAPI } from '@/lib/weatherService';
import WeatherIcon from '@/components/WeatherIcon';
import EventModal from './EventModal';

export default function ListCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [weatherZipcode, setWeatherZipcode] = useState('');

  // カレンダー日付をメモ化
  const { days } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    return { days };
  }, [currentDate]);

  // 天気設定を読み込み
  useEffect(() => {
    const savedWeatherEnabled = localStorage.getItem('weatherEnabled');
    const savedWeatherZipcode = localStorage.getItem('weatherZipcode');
    
    console.log('天気設定読み込み:', { savedWeatherEnabled, savedWeatherZipcode });
    console.log('環境変数確認:', {
      apiKey: '不要（Open-Meteo）',
      apiType: 'Open-Meteo API'
    });
    
    if (savedWeatherEnabled) {
      setWeatherEnabled(JSON.parse(savedWeatherEnabled));
    }
    if (savedWeatherZipcode) {
      setWeatherZipcode(savedWeatherZipcode);
    }
    
    // APIテストを実行
    testWeatherAPI();
  }, []);

  // 天気データを取得
  useEffect(() => {
    const fetchWeatherData = async () => {
      console.log('天気データ取得チェック:', { weatherEnabled, weatherZipcode, length: weatherZipcode?.length });
      
      if (!weatherEnabled || !weatherZipcode || weatherZipcode.length !== 7) {
        console.log('天気データ取得をスキップ:', { weatherEnabled, weatherZipcode, length: weatherZipcode?.length });
        return;
      }

      setWeatherLoading(true);
      try {
        console.log('天気データを取得中:', weatherZipcode);
        const data = await getWeatherByZipcode(weatherZipcode);
        console.log('天気データ取得完了:', data.length, '件');
        setWeatherData(data);
      } catch (error) {
        console.error('天気データの取得に失敗:', error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
  }, [weatherEnabled, weatherZipcode, currentDate]);

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

  // 特定の日付と家族メンバーの予定を取得
  const getEventsForDayAndMember = useCallback((day: Date, memberId: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => {
      // シフト入力の「休み」イベントはリストページでも非表示
      if (event.type === 'shift' && event.title === '休み') {
        return false;
      }
      return event.date === dateStr && event.familyMemberId === memberId;
    });
  }, [events]);

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

  // 予定編集開始のコールバック
  const handleEventEdit = useCallback((event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }, []);

  // 予定追加・編集後のコールバック
  const handleEventAdded = useCallback(() => {
    loadEvents(); // 予定を再読み込み
  }, [loadEvents]);

  return (
    <div className="flex flex-col h-screen">
      {/* デバッグ情報 */}
      {weatherEnabled && (
        <div className="mx-4 mt-2 p-2 bg-blue-500 bg-opacity-20 rounded text-xs text-white">
          天気設定: 有効 | 郵便番号: {weatherZipcode} | データ件数: {weatherData.length} | ローディング: {weatherLoading ? 'はい' : 'いいえ'} | 表示: アイコン+気温
          <br />
          最新データ: {weatherData.length > 0 ? `${weatherData[0]?.date} (${weatherData[0]?.temp}°C)` : 'なし'} | API: Open-Meteo（無料・制限なし）
        </div>
      )}
      
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar size={20} className="text-white" />
            <span className="ml-2 text-sm font-medium text-white">リストビュー</span>
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

      {/* ヘッダー行 */}
      <div className="glass-card mx-4 mt-2 fade-in">
        <div className="flex items-center p-3">
                     {/* 日付ヘッダー */}
           <div className="flex items-center justify-center min-w-[50px]">
            <span className="text-xs font-semibold text-white">日付</span>
          </div>
          {/* 家族メンバーヘッダー */}
          <div className="flex items-center space-x-3 flex-1 ml-3">
            {FAMILY_MEMBERS.map((member) => (
              <div key={member.id} className="flex items-center justify-center flex-1">
                <div className={`text-xs font-semibold p-1 rounded-lg text-white ${
                  member.color === 'blue' ? 'bg-blue-500' :
                  member.color === 'orange' ? 'bg-orange-500' :
                  member.color === 'green' ? 'bg-green-500' :
                  member.color === 'pink' ? 'bg-pink-500' :
                  'bg-gray-500'
                } bg-opacity-30`}>
                  {member.name}
                </div>
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
                     <div className="flex items-center justify-center min-w-[50px]">
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
                         {/* 天気アイコンと気温 */}
                         {weatherEnabled && (
                           <div className="mt-1">
                             {weatherLoading ? (
                               <div className="animate-pulse w-4 h-4 bg-white bg-opacity-20 rounded mx-auto" />
                             ) : (
                               (() => {
                                 const dayWeather = getWeatherForDate(weatherData, format(day, 'yyyy-MM-dd'));
                                 console.log('天気データ検索:', format(day, 'yyyy-MM-dd'), '全データ件数:', weatherData.length, '検索結果:', dayWeather);
                                 if (dayWeather) {
                                   console.log('天気アイコン表示:', format(day, 'yyyy-MM-dd'), dayWeather.icon, dayWeather.temp, '気温タイプ:', typeof dayWeather.temp);
                                   return (
                                     <div className="flex flex-col items-center space-y-0.5">
                                       <WeatherIcon 
                                         iconCode={dayWeather.icon} 
                                         size={14} 
                                         className="mx-auto"
                                       />
                                       <div className="text-[8px] text-white text-opacity-80 font-medium">
                                         {dayWeather.temp}°C
                                       </div>
                                     </div>
                                   );
                                 } else {
                                   // テスト用：天気データがない場合はデフォルトアイコンを表示
                                   console.log('天気データなし、デフォルトアイコン表示:', format(day, 'yyyy-MM-dd'));
                                   return (
                                     <div className="flex flex-col items-center space-y-0.5">
                                       <WeatherIcon 
                                         iconCode="01d" 
                                         size={14} 
                                         className="mx-auto"
                                       />
                                       <div className="text-[8px] text-white text-opacity-60 font-medium">
                                         --
                                       </div>
                                     </div>
                                   );
                                 }
                               })()
                             )}
                           </div>
                         )}
                       </div>
                     </div>

                     {/* 各家族メンバーの予定列 */}
                     <div className="flex items-center space-x-3 flex-1 ml-3">
                       {FAMILY_MEMBERS.map((member) => {
                         const memberEvents = getEventsForDayAndMember(day, member.id);
                         return (
                           <div key={member.id} className="flex items-center justify-center flex-1">
                             <div className={`min-w-[60px] space-y-0.5 p-1 rounded-lg ${
                               member.color === 'blue' ? 'bg-blue-500' :
                               member.color === 'orange' ? 'bg-orange-500' :
                               member.color === 'green' ? 'bg-green-500' :
                               member.color === 'pink' ? 'bg-pink-500' :
                               'bg-gray-500'
                             } bg-opacity-30`}>
                               {loading ? (
                                 <div className="text-[10px] text-white text-opacity-60 text-center py-1">
                                   <div className="animate-pulse">...</div>
                                 </div>
                               ) : memberEvents.length > 0 ? (
                                 memberEvents.map((event) => (
                                   <div
                                     key={event.id}
                                     className="glass-event text-[10px] p-1 hover:scale-105 transition-all duration-300 cursor-pointer"
                                     onClick={() => handleEventEdit(event)}
                                     title={`${event.description || event.title} (タップで編集・削除)`}
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

      {/* 予定追加・編集モーダル */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        selectedDate={editingEvent ? editingEvent.date : format(new Date(), 'yyyy-MM-dd')}
        onEventAdded={handleEventAdded}
        editingEvent={editingEvent}
      />
    </div>
  );
}
