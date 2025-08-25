'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Calendar, Check } from 'lucide-react';

interface CalendarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (selectedDates: string[]) => void;
}

export default function CalendarSelectorModal({ isOpen, onClose, onDateSelect }: CalendarSelectorModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // カレンダー日付をメモ化
  const { monthStart, monthEnd, calendarStart, calendarEnd, days } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    return { monthStart, monthEnd, calendarStart, calendarEnd, days };
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

  const toggleDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDates(prev => 
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr].sort()
    );
  };

  const handleConfirm = () => {
    onDateSelect(selectedDates);
    onClose();
  };

  const handleCancel = () => {
    setSelectedDates([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* モーダル */}
      <div className="fixed inset-4 z-50 flex items-center justify-center">
        <div className="glass-modal w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Calendar size={24} className="text-white" />
              <h2 className="text-xl font-semibold text-white">日付を選択</h2>
            </div>
            <button
              onClick={handleCancel}
              className="glass-button p-2 rounded-full"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* 月ナビゲーション */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="glass-button p-2"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <h3 className="text-lg font-semibold text-white">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="glass-button p-2"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center">
                <span className="text-xs font-semibold text-white text-opacity-70">{day}</span>
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = selectedDates.includes(dateStr);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => toggleDate(day)}
                  className={`aspect-square p-1 rounded-lg transition-all duration-200 ${
                    !isCurrentMonth
                      ? 'opacity-30 cursor-not-allowed'
                      : isSelected
                      ? 'glass-button border-2 border-white border-opacity-50'
                      : isTodayDate
                      ? 'glass-day border-2 border-white border-opacity-40'
                      : 'glass-day hover:bg-white hover:bg-opacity-10'
                  }`}
                  disabled={!isCurrentMonth}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-white'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {isSelected && (
                      <Check size={12} className="text-white mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 選択された日付の表示 */}
          {selectedDates.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-2">
                選択された日付 ({selectedDates.length}件)
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((dateStr) => (
                    <div
                      key={dateStr}
                      className="glass-area px-3 py-1 text-xs text-white"
                    >
                      {format(new Date(dateStr + 'T00:00:00'), 'M/d(E)', { locale: ja })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 glass-button py-3 text-white font-medium"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedDates.length === 0}
              className="flex-1 glass-button py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              選択完了 ({selectedDates.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
