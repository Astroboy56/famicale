'use client';

import { useState } from 'react';
import { Plus, Clock, User, Tag } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, EventType } from '@/types';

interface BulkInputForm {
  title: string;
  description: string;
  familyMemberId: string;
  type: EventType;
  time: string;
  isAllDay: boolean;
  pattern: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
  endDate: string;
  selectedDays: number[]; // 曜日選択用
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここで一括入力の処理を実装
    console.log('一括入力:', form);
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
        <div className="flex items-center">
          <Plus size={20} className="text-white mr-3" />
          <h1 className="text-lg font-semibold text-glass">一括入力</h1>
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
              onChange={(e) => setForm(prev => ({ ...prev, pattern: e.target.value as 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' }))}
              className="w-full px-4 py-3 glass-input text-white"
            >
              <option value="daily" className="text-gray-800">毎日</option>
              <option value="weekdays" className="text-gray-800">平日のみ</option>
              <option value="weekly" className="text-gray-800">毎週</option>
              <option value="biweekly" className="text-gray-800">隔週</option>
              <option value="monthly" className="text-gray-800">毎月</option>
            </select>
          </div>

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
          <div className="grid grid-cols-2 gap-4">
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
            className="w-full glass-button py-4 px-6 font-semibold text-lg hover:scale-105 transition-all duration-300"
          >
            一括登録する
          </button>
        </form>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />
    </div>
  );
}
