'use client';

import { useState } from 'react';
import { eventService, deleteAllEvents } from '@/lib/firestore';
import ConnectionTest from '@/components/Firebase/ConnectionTest';

export default function FirebaseTestPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleDeleteAllEvents = async () => {
    if (!confirm('本当に全てのイベントを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage('削除中...');

    try {
      await deleteAllEvents();
      setDeleteMessage('全てのイベントを削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      setDeleteMessage('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Firebase テスト
        </h1>
        
        <ConnectionTest />
        
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            データベース操作
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={handleDeleteAllEvents}
              disabled={isDeleting}
              className="w-full glass-button py-3 px-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '削除中...' : '全てのイベントを削除'}
            </button>
            
            {deleteMessage && (
              <div className="text-center text-white text-sm">
                {deleteMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
