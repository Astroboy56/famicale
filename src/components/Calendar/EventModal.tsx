'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, User, Tag } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, EVENT_TYPE_ICONS, EventType, Event } from '@/types';
import { eventService } from '@/lib/firestore';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD形式
  onEventAdded?: () => void;
  editingEvent?: Event | null; // 編集対象のイベント
}

interface EventForm {
  title: string;
  description: string;
  familyMemberId: string;
  type: EventType;
  time: string;
  isAllDay: boolean;
}

export default function EventModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onEventAdded, 
  editingEvent 
}: EventModalProps) {
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    familyMemberId: FAMILY_MEMBERS[0].id,
    type: 'other',
    time: '',
    isAllDay: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編集モードの場合、フォームに既存データを設定
  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title,
        description: editingEvent.description || '',
        familyMemberId: editingEvent.familyMemberId,
        type: editingEvent.type,
        time: editingEvent.time || '',
        isAllDay: editingEvent.isAllDay ?? true,
      });
    } else {
      // 新規追加モードの場合、フォームをリセット
      setForm({
        title: '',
        description: '',
        familyMemberId: FAMILY_MEMBERS[0].id,
        type: 'other',
        time: '',
        isAllDay: true,
      });
    }
  }, [editingEvent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsSubmitting(true);
    try {
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: editingEvent ? editingEvent.date : selectedDate,
        familyMemberId: form.familyMemberId,
        type: form.type,
        isAllDay: form.isAllDay,
        ...(form.isAllDay ? {} : { time: form.time }),
      };

      if (editingEvent) {
        // 編集モード
        await eventService.updateEvent(editingEvent.id, eventData);
      } else {
        // 新規追加モード
        await eventService.addEvent(eventData);
      }

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
      console.error('予定の保存に失敗しました:', error);
      alert('予定の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMember = FAMILY_MEMBERS.find(m => m.id === form.familyMemberId);
  const isEditMode = !!editingEvent;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-teal-500 to-green-500 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-modal w-full max-w-md max-h-[90vh] overflow-y-auto fade-in">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-20">
          <h2 className="text-xl font-bold text-glass">
            {isEditMode ? '予定を編集' : '予定を追加'}
          </h2>
          <button
            onClick={onClose}
            className="glass-button p-2"
            disabled={isSubmitting}
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* 選択日表示 */}
        <div className="px-6 py-4 glass-area border-b border-white border-opacity-20">
          <div className="flex items-center text-white">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm font-medium">
              {new Date((editingEvent ? editingEvent.date : selectedDate) + 'T00:00:00').toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </span>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              placeholder="例：歯医者、会議、お出かけなど"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          {/* 家族メンバー選択 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              <User size={16} className="inline mr-2 text-white" />
              家族メンバー
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, familyMemberId: member.id }))}
                  disabled={isSubmitting}
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
                    <span className="text-sm font-semibold text-white">{member.name}</span>
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
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <span className="ml-3 text-sm font-medium text-white">終日</span>
              </label>
              
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 glass-input text-white"
                  disabled={isSubmitting}
                />
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 glass-button text-white font-medium"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || isSubmitting}
              className="flex-1 py-3 px-6 glass-button text-white font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (isEditMode ? '更新中...' : '追加中...') : (isEditMode ? '予定を更新' : '予定を追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
