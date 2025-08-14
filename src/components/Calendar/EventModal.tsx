'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, Tag } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, EVENT_TYPE_ICONS, EventType } from '@/types';
import { eventService } from '@/lib/firestore';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD形式
  onEventAdded?: () => void;
}

interface EventForm {
  title: string;
  description: string;
  familyMemberId: string;
  type: EventType;
  time: string;
  isAllDay: boolean;
}

export default function EventModal({ isOpen, onClose, selectedDate, onEventAdded }: EventModalProps) {
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    familyMemberId: FAMILY_MEMBERS[0].id,
    type: 'other',
    time: '',
    isAllDay: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsSubmitting(true);
    try {
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: selectedDate,
        familyMemberId: form.familyMemberId,
        type: form.type,
        isAllDay: form.isAllDay,
        ...(form.isAllDay ? {} : { time: form.time }),
      };

      await eventService.addEvent(eventData);

      // フォームをリセット
      setForm({
        title: '',
        description: '',
        familyMemberId: FAMILY_MEMBERS[0].id,
        type: 'other',
        time: '',
        isAllDay: true,
      });

      onEventAdded?.();
      onClose();
    } catch (error) {
      console.error('予定の追加に失敗しました:', error);
      alert('予定の追加に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMember = FAMILY_MEMBERS.find(m => m.id === form.familyMemberId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">予定を追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* 選択日表示 */}
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center text-blue-700">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </span>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              placeholder="例：歯医者、会議、お出かけなど"
              required
              disabled={isSubmitting}
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
              rows={2}
              placeholder="詳細な内容があれば入力"
              disabled={isSubmitting}
            />
          </div>

          {/* 家族メンバー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              家族メンバー
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, familyMemberId: member.id }))}
                  disabled={isSubmitting}
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
                    <span className="text-sm font-medium">{member.name}</span>
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
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">終日</span>
              </label>
              
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || isSubmitting}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                selectedMember 
                  ? `${COLOR_MAP[selectedMember.color].bg} ${COLOR_MAP[selectedMember.color].text} hover:opacity-80`
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? '追加中...' : '予定を追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
