'use client';

import { useState } from 'react';
import { Plus, Clock, User, Tag, Calendar } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, EventType } from '@/types';
import { eventService } from '@/lib/firestore';
import { format, addDays, addWeeks, addMonths, isWeekend } from 'date-fns';
import CalendarSelectorModal from './CalendarSelectorModal';

interface BulkInputForm {
  title: string;
  description: string;
  familyMemberId: string;
  type: EventType;
  time: string;
  isAllDay: boolean;
  pattern: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  selectedDays: number[]; // 曜日選択用
  customDates: string[]; // カスタム日付選択用
}

export default function BulkInputPage() {
  const [form, setForm] = useState<BulkInputForm>({
    title: '',
    description: '',
    familyMemberId: FAMILY_MEMBERS[0].id,
    type: 'other',
    time: '',
    isAllDay: true,
    pattern: 'daily',
    startDate: '',
    endDate: '',
    selectedDays: [],
    customDates: [],
  });

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      alert('必須項目を入力してください');
      return;
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert('開始日は終了日より前の日付を選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const events = generateEvents();
      console.log(`一括登録開始: ${events.length}件の予定を登録します`);

      // 一括でイベントを登録
      const promises = events.map(event => eventService.addEvent(event));
      await Promise.all(promises);

      alert(`${events.length}件の予定を一括登録しました`);
      
      // フォームをリセット
      setForm({
        title: '',
        description: '',
        familyMemberId: FAMILY_MEMBERS[0].id,
        type: 'other',
        time: '',
        isAllDay: true,
        pattern: 'daily',
        startDate: '',
        endDate: '',
        selectedDays: [],
        customDates: [],
      });
    } catch (error) {
      console.error('一括登録に失敗しました:', error);
      alert('一括登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // イベント生成関数
  const generateEvents = () => {
    const events = [];

    if (form.pattern === 'custom') {
      // カスタム日付選択の場合
      return form.customDates.map(dateStr => ({
        title: form.title,
        description: form.description,
        date: dateStr,
        familyMemberId: form.familyMemberId,
        type: form.type,
        time: form.isAllDay ? undefined : form.time,
        isAllDay: form.isAllDay,
      }));
    }

    // 通常のパターンの場合
    let currentDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    while (currentDate <= endDate) {
      let shouldAddEvent = false;

      switch (form.pattern) {
        case 'daily':
          shouldAddEvent = true;
          break;
        case 'weekdays':
          shouldAddEvent = !isWeekend(currentDate);
          break;
        case 'weekly':
        case 'biweekly':
          shouldAddEvent = form.selectedDays.includes(currentDate.getDay());
          break;
        case 'monthly':
          shouldAddEvent = currentDate.getDate() === new Date(form.startDate).getDate();
          break;
      }

      if (shouldAddEvent) {
        events.push({
          title: form.title,
          description: form.description,
          date: format(currentDate, 'yyyy-MM-dd'),
          familyMemberId: form.familyMemberId,
          type: form.type,
          time: form.isAllDay ? undefined : form.time,
          isAllDay: form.isAllDay,
        });
      }

      // 次の日付を計算
      switch (form.pattern) {
        case 'daily':
        case 'weekdays':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = addWeeks(currentDate, 2);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
      }
    }

    return events;
  };

  // カレンダーから日付選択時の処理
  const handleDateSelect = (selectedDates: string[]) => {
    setForm(prev => ({
      ...prev,
      pattern: 'custom',
      customDates: selectedDates,
      startDate: selectedDates.length > 0 ? selectedDates[0] : '',
      endDate: selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : '',
    }));
  };

  const toggleDay = (day: number) => {
    setForm(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day].sort()
    }));
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Plus size={20} className="text-white mr-3" />
            <h1 className="text-lg font-semibold text-glass">一括入力</h1>
          </div>
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="glass-button px-4 py-2 text-white font-medium flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
          >
            <Calendar size={16} />
            <span>カレンダーから選択</span>
          </button>
        </div>
      </header>

      {/* フォーム */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6 fade-in">
          {/* 予定タイトル */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              予定タイトル *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 glass-input text-white placeholder-white placeholder-opacity-60"
              placeholder="例：出勤、登校など"
              required
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              メモ
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 glass-input text-white placeholder-white placeholder-opacity-60 resize-none"
              rows={3}
              placeholder="詳細な内容があれば入力"
            />
          </div>

          {/* 家族メンバー選択 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              <User size={16} className="inline mr-2 text-white" />
              家族メンバー *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, familyMemberId: member.id }))}
                  className={`p-4 glass-select-button transition-all duration-300 ${
                    form.familyMemberId === member.id
                      ? 'selected'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                                  <div
                className={`w-4 h-4 rounded-full ${COLOR_MAP[member.color].bg} shadow-lg`}
              />
                    <span className="font-semibold text-white">{member.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 予定種類 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              <Tag size={16} className="inline mr-2 text-white" />
              予定種類
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as EventType }))}
              className="w-full px-4 py-3 glass-input text-white"
            >
              <option value="work" className="text-gray-800">仕事</option>
              <option value="school" className="text-gray-800">学校</option>
              <option value="hospital" className="text-gray-800">病院</option>
              <option value="travel" className="text-gray-800">旅行</option>
              <option value="other" className="text-gray-800">その他</option>
            </select>
          </div>

          {/* 時間設定 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              <Clock size={16} className="inline mr-2 text-white" />
              時間設定
            </label>
            <div className="space-y-4">
              <label className="flex items-center p-3 glass-checkbox-area cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={form.isAllDay}
                  onChange={(e) => setForm(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="rounded border-white text-blue-400 focus:ring-white focus:ring-opacity-50 bg-transparent"
                />
                <span className="ml-3 text-sm font-medium text-white">終日</span>
              </label>
              
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 glass-input text-white"
                />
              )}
            </div>
          </div>

          {/* 繰り返しパターン */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              繰り返しパターン
            </label>
            <select
              value={form.pattern}
              onChange={(e) => setForm(prev => ({ ...prev, pattern: e.target.value as 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'custom' }))}
              className="w-full px-4 py-3 glass-input text-white"
            >
              <option value="daily" className="text-gray-800">毎日</option>
              <option value="weekdays" className="text-gray-800">平日のみ</option>
              <option value="weekly" className="text-gray-800">毎週</option>
              <option value="biweekly" className="text-gray-800">隔週</option>
              <option value="monthly" className="text-gray-800">毎月</option>
              <option value="custom" className="text-gray-800">カスタム選択</option>
            </select>
          </div>

          {/* カスタム選択された日付の表示 */}
          {form.pattern === 'custom' && form.customDates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                選択された日付 ({form.customDates.length}件)
              </label>
              <div className="max-h-32 overflow-y-auto p-3 glass-area rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {form.customDates.map((dateStr) => (
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

          {/* 曜日選択（毎週・隔週の場合） */}
          {(form.pattern === 'weekly' || form.pattern === 'biweekly') && (
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                曜日選択
              </label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`p-3 text-sm glass-select-button transition-all duration-300 ${
                      form.selectedDays.includes(index)
                        ? 'selected text-white'
                        : 'text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 期間設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                開始日 *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 glass-input text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                終了日 *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 glass-input text-white"
                required
              />
            </div>
          </div>

          {/* 登録ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-button py-4 px-6 font-semibold text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? '登録中...' : '一括登録する'}
          </button>
        </form>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />

      {/* カレンダー選択モーダル */}
      <CalendarSelectorModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}
