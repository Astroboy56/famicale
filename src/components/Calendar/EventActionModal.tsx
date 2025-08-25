'use client';

import { useState } from 'react';
import { Event } from '@/types';
import { Edit, Trash2, X } from 'lucide-react';
import { eventService } from '@/lib/firestore';

interface EventActionModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: () => void;
}

export function EventActionModal({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: EventActionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    if (!confirm('この予定を削除しますか？')) return;
    
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(event.id);
      onDelete();
      onClose();
    } catch (error) {
      console.error('予定の削除に失敗しました:', error);
      alert('予定の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className="relative glass-card p-6 max-w-sm w-full mx-4 fade-in">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">予定の操作</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 予定情報 */}
        <div className="mb-6 p-4 glass-area rounded-lg">
          <h4 className="font-medium text-white mb-2">{event.title}</h4>
          <p className="text-sm text-white text-opacity-80 mb-1">
            {event.date} {event.time}
          </p>
          {event.description && (
            <p className="text-sm text-white text-opacity-70">
              {event.description}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              onEdit(event);
              onClose();
            }}
            className="flex-1 glass-button flex items-center justify-center space-x-2 py-3"
          >
            <Edit size={16} className="text-white" />
            <span className="text-white font-medium">編集</span>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 glass-button bg-red-500 hover:bg-red-600 flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
          >
            <Trash2 size={16} className="text-white" />
            <span className="text-white font-medium">
              {isDeleting ? '削除中...' : '削除'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
