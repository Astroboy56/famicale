'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit3, X } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, Event } from '@/types';
import { eventService } from '@/lib/firestore';
import BottomNavigation from '@/components/Layout/BottomNavigation';

// シフトコマンドの型定義
interface ShiftCommand {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  isCustom: boolean;
}

// 仮登録シフトの型定義
interface PendingShift {
  id: string;
  date: string;
  command: ShiftCommand;
}

// デフォルトのシフトコマンド
const DEFAULT_SHIFT_COMMANDS: ShiftCommand[] = [
  { id: 'day', name: '日勤', color: '#ffffff', bgColor: '#ff8c00', isCustom: false },
  { id: 'semi-night', name: '準夜', color: '#ffffff', bgColor: '#87ceeb', isCustom: false },
  { id: 'night', name: '深夜', color: '#ffffff', bgColor: '#4169e1', isCustom: false },
  { id: 'off', name: '休み', color: '#ffffff', bgColor: '#ff69b4', isCustom: false },
];

export default function ShiftPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [shiftCommands, setShiftCommands] = useState<ShiftCommand[]>([]);
  const [showCustomEdit, setShowCustomEdit] = useState(false);
  const [pendingShifts, setPendingShifts] = useState<PendingShift[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // 予定データの読み込み
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

  // ローカルストレージからシフトコマンドを読み込み
  const loadShiftCommands = () => {
    try {
      const savedCommands = localStorage.getItem('shiftCommands');
      if (savedCommands) {
        const parsedCommands = JSON.parse(savedCommands);
        setShiftCommands(parsedCommands);
      } else {
        // 初回はデフォルトコマンドを設定
        setShiftCommands(DEFAULT_SHIFT_COMMANDS);
        localStorage.setItem('shiftCommands', JSON.stringify(DEFAULT_SHIFT_COMMANDS));
      }
    } catch (error) {
      console.error('シフトコマンドの読み込みに失敗しました:', error);
      setShiftCommands(DEFAULT_SHIFT_COMMANDS);
    }
  };

  // シフトコマンドをローカルストレージに保存
  const saveShiftCommands = (commands: ShiftCommand[]) => {
    try {
      localStorage.setItem('shiftCommands', JSON.stringify(commands));
    } catch (error) {
      console.error('シフトコマンドの保存に失敗しました:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadShiftCommands();
  }, [currentDate, loadEvents]);

  // 特定の日付の予定を取得
  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(event => event.date === dateStr);
    console.log(`getEventsForDay(${dateStr}):`, dayEvents);
    return dayEvents;
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

  // シフトを仮登録（バッチ登録用）
  const addPendingShift = (command: ShiftCommand) => {
    if (!selectedDate) {
      alert('日付を選択してください');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // 既存のシフト（実際のデータと仮登録データ）をチェック
    const existingEvents = getEventsForDay(selectedDate);
    const hasExistingShift = existingEvents.some(event => event.type === 'shift');
    const hasPendingShift = pendingShifts.some(shift => shift.date === dateStr);

    if (hasExistingShift || hasPendingShift) {
      alert(`${format(selectedDate, 'M月d日')}には既にシフトが登録されています`);
      return;
    }

    // 仮登録に追加
    const newPendingShift: PendingShift = {
      id: `pending-${Date.now()}`,
      date: dateStr,
      command: command,
    };

    setPendingShifts(prev => [...prev, newPendingShift]);
    console.log(`仮登録: ${command.name}を${format(selectedDate, 'M月d日')}に追加`);
  };

  // 仮登録シフトを削除
  const removePendingShift = (dateStr: string) => {
    setPendingShifts(prev => prev.filter(shift => shift.date !== dateStr));
  };

  // 全ての仮登録シフトを保存
  const saveAllPendingShifts = async () => {
    if (pendingShifts.length === 0) {
      alert('保存するシフトがありません');
      return;
    }

    setIsSaving(true);
    try {
      // 全ての仮登録シフトを一括で保存
      const savePromises = pendingShifts.map(shift => 
        eventService.addEvent({
          title: shift.command.name,
          description: `シフト: ${shift.command.name}`,
          date: shift.date,
          familyMemberId: 'erika', // えりか専用
          isAllDay: true,
          type: 'shift',
        })
      );

      await Promise.all(savePromises);
      
      // 仮登録をクリア
      setPendingShifts([]);
      
      // 最新データを再取得
      await loadEvents();
      
      alert(`${pendingShifts.length}件のシフトを保存しました`);
    } catch (error) {
      console.error('シフトの保存に失敗しました:', error);
      alert('シフトの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 仮登録を全てキャンセル
  const cancelAllPendingShifts = () => {
    if (pendingShifts.length === 0) {
      alert('キャンセルするシフトがありません');
      return;
    }

    if (confirm('全ての仮登録シフトをキャンセルしますか？')) {
      setPendingShifts([]);
      alert('仮登録をキャンセルしました');
    }
  };

  // カスタムコマンドを削除
  const removeCustomCommand = (commandId: string) => {
    const updatedCommands = shiftCommands.filter(cmd => cmd.id !== commandId);
    setShiftCommands(updatedCommands);
    saveShiftCommands(updatedCommands);
  };

  // カスタムコマンドを追加
  const addCustomCommand = (name: string) => {
    if (name.length > 4) {
      alert('文字数は4文字以内で入力してください');
      return;
    }

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCommand: ShiftCommand = {
      id: `custom-${Date.now()}`,
      name,
      color: '#ffffff',
      bgColor: randomColor,
      isCustom: true,
    };

    const updatedCommands = [...shiftCommands, newCommand];
    setShiftCommands(updatedCommands);
    saveShiftCommands(updatedCommands);
    setShowCustomEdit(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar size={20} className="text-white" />
            <div className="ml-2">
              <div className="text-sm font-medium text-white">シフト入力</div>
              <div className="text-xs text-white text-opacity-70">※えりか専用</div>
            </div>
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

      {/* 月カレンダー */}
      <div className="flex-1 overflow-y-auto px-4 mt-4">
        <div className="glass-card p-3 fade-in">
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
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`glass-day min-h-[60px] p-2 cursor-pointer transition-all duration-300 ${
                    !isSameMonth(day, currentDate) ? 'opacity-50' : ''
                  } ${isSelected ? 'ring-2 ring-blue-400' : 'hover:scale-[1.02]'}`}
                >
                  <div className="text-center">
                    <div className={`text-xs font-bold ${
                      !isSameMonth(day, currentDate) ? 'text-white text-opacity-40' : 'text-white'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* シフト表示 */}
                    <div className="mt-1 space-y-1">
                      {/* 実際のシフト */}
                      {dayEvents
                        .filter(event => event.type === 'shift')
                        .map((event) => (
                          <div
                            key={event.id}
                            className="text-[8px] px-1 py-0.5 rounded text-white font-medium truncate"
                            style={{
                              backgroundColor: shiftCommands.find(cmd => cmd.name === event.title)?.bgColor || '#666'
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                      
                      {/* 仮登録シフト */}
                      {pendingShifts
                        .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
                        .map((shift) => (
                          <div
                            key={shift.id}
                            className="text-[8px] px-1 py-0.5 rounded text-white font-medium truncate border-2 border-dashed border-white border-opacity-50"
                            style={{
                              backgroundColor: shift.command.bgColor
                            }}
                          >
                            {shift.command.name}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

             {/* シフトコマンドボタン */}
       <div className="glass-card mx-4 mt-4 mb-25 p-4 fade-in">
        <div className="flex items-center justify-between mb-4">
                     <h2 className="text-sm font-semibold text-white">
             {selectedDate 
               ? `${format(selectedDate, 'M月d日(E)', { locale: ja })}に登録`
               : '日付を選択してください'
             }
           </h2>
          <button
            onClick={() => setShowCustomEdit(!showCustomEdit)}
            className="glass-button p-2"
          >
            <Edit3 size={16} className="text-white" />
          </button>
        </div>

                          {/* コマンドボタングリッド */}
         <div className="grid grid-cols-6 gap-2">
           {shiftCommands.map((command) => (
             <div key={command.id} className="relative group">
                               <button
                  onClick={() => {
                    console.log('ボタンクリック:', command.name);
                    addPendingShift(command);
                  }}
                  disabled={!selectedDate}
                  className="aspect-square glass-button transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 min-h-[50px] w-full"
                  style={{
                    backgroundColor: command.bgColor,
                    color: command.color,
                  }}
                >
                 <span className="text-[16x] font-semibold leading-tight">
                   {command.name}
                 </span>
               </button>
               {/* カスタムコマンドの削除ボタン */}
               {command.isCustom && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     removeCustomCommand(command.id);
                   }}
                   className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                 >
                   <X size={12} className="text-white" />
                 </button>
               )}
             </div>
           ))}
         </div>

        {/* 保存・キャンセルボタン */}
        {pendingShifts.length > 0 && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={cancelAllPendingShifts}
              className="flex-1 glass-button py-3 text-white font-medium border border-red-300 border-opacity-30 hover:border-red-200 hover:border-opacity-50 transition-all duration-300"
            >
              キャンセル ({pendingShifts.length}件)
            </button>
            <button
              onClick={saveAllPendingShifts}
              disabled={isSaving}
              className="flex-1 glass-button py-3 text-white font-semibold border border-green-300 border-opacity-30 hover:border-green-200 hover:border-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : `保存 (${pendingShifts.length}件)`}
            </button>
          </div>
        )}

        {/* カスタム編集モーダル */}
        {showCustomEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-modal p-6 rounded-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">カスタムコマンド追加</h3>
              <input
                type="text"
                maxLength={4}
                placeholder="4文字以内で入力"
                className="w-full px-3 py-2 glass-input text-white placeholder-white placeholder-opacity-60 mb-4"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addCustomCommand(e.currentTarget.value.trim());
                  }
                }}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCustomEdit(false)}
                  className="flex-1 glass-button py-2"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      addCustomCommand(input.value.trim());
                    }
                  }}
                  className="flex-1 glass-button py-2"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

             {/* ボトムナビゲーション */}
       <BottomNavigation />
     </div>
   );
 }
