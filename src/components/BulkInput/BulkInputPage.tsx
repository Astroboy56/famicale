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
    familyMemberId: '',
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <Plus size={20} className="text-blue-600 mr-2" />
          <h1 className="text-lg font-semibold">一括入力</h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* 予定タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              予定タイトル *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例：出勤、登校など"
              required
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="詳細な内容があれば入力"
            />
          </div>

          {/* 家族メンバー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              家族メンバー *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, familyMemberId: member.id }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    form.familyMemberId === member.id
                      ? `${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} ${COLOR_MAP[member.color].text}`
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} border`}
                    />
                    <span className="font-medium">{member.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 予定種類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              予定種類
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as EventType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="work">仕事</option>
              <option value="school">学校</option>
              <option value="hospital">病院</option>
              <option value="travel">旅行</option>
              <option value="other">その他</option>
            </select>
          </div>

          {/* 時間設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              時間設定
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.isAllDay}
                  onChange={(e) => setForm(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">終日</span>
              </label>
              
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* 繰り返しパターン */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              繰り返しパターン
            </label>
            <select
              value={form.pattern}
              onChange={(e) => setForm(prev => ({ ...prev, pattern: e.target.value as 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">毎日</option>
              <option value="weekdays">平日のみ</option>
              <option value="weekly">毎週</option>
              <option value="biweekly">隔週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          {/* 曜日選択（毎週・隔週の場合） */}
          {(form.pattern === 'weekly' || form.pattern === 'biweekly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                曜日選択
              </label>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      form.selectedDays.includes(index)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始日 *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了日 *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* 登録ボタン */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            一括登録する
          </button>
        </form>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-16 bg-transparent" />
    </div>
  );
}
