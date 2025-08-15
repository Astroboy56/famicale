'use client';

import { useState } from 'react';
import { X, Trash2, Settings } from 'lucide-react';
import { deleteAllEvents, deleteAllTodos } from '@/lib/firestore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [isDeletingEvents, setIsDeletingEvents] = useState(false);
  const [isDeletingTodos, setIsDeletingTodos] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeleteAllEvents = async () => {
    if (!confirm('本当に全てのカレンダー予定を削除しますか？この操作は取り消せません。')) {
      return;
    }

    setIsDeletingEvents(true);
    setMessage('カレンダー予定を削除中...');

    try {
      await deleteAllEvents();
      setMessage('カレンダー予定を全て削除しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage('削除に失敗しました');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsDeletingEvents(false);
    }
  };

  const handleDeleteAllTodos = async () => {
    if (!confirm('本当に全てのTODOリストを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setIsDeletingTodos(true);
    setMessage('TODOリストを削除中...');

    try {
      await deleteAllTodos();
      setMessage('TODOリストを全て削除しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage('削除に失敗しました');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsDeletingTodos(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 ease-out ${
          isOpen ? 'bg-gradient-to-br from-green-400 via-blue-500 to-teal-600 bg-opacity-80 backdrop-blur-sm' : 'bg-transparent'
        }`}
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="glass-modal rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings size={24} className="text-white" />
              <h2 className="text-xl font-semibold text-white">設定</h2>
            </div>
            <button
              onClick={onClose}
              className="glass-button p-2 rounded-full"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* 設定項目 */}
          <div className="space-y-4">
            {/* カレンダー予定削除 */}
            <div className="glass-card p-4 rounded-xl backdrop-blur-md border border-green-300 border-opacity-30 hover:border-green-200 hover:border-opacity-50 transition-all duration-300 bg-green-500 bg-opacity-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">カレンダー予定</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    全てのカレンダー予定を削除します
                  </p>
                </div>
                <button
                  onClick={handleDeleteAllEvents}
                  disabled={isDeletingEvents}
                  className="glass-button px-4 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
                >
                  <Trash2 size={16} />
                  <span>{isDeletingEvents ? '削除中...' : '削除'}</span>
                </button>
              </div>
            </div>

            {/* TODOリスト削除 */}
            <div className="glass-card p-4 rounded-xl backdrop-blur-md border border-blue-300 border-opacity-30 hover:border-blue-200 hover:border-opacity-50 transition-all duration-300 bg-blue-500 bg-opacity-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">TODOリスト</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    全てのTODOリストを削除します
                  </p>
                </div>
                <button
                  onClick={handleDeleteAllTodos}
                  disabled={isDeletingTodos}
                  className="glass-button px-4 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
                >
                  <Trash2 size={16} />
                  <span>{isDeletingTodos ? '削除中...' : '削除'}</span>
                </button>
              </div>
            </div>

            {/* 今後の開発予定 */}
            <div className="glass-card p-4 rounded-xl opacity-50 backdrop-blur-md border border-teal-300 border-opacity-20 bg-teal-500 bg-opacity-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">その他の設定</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    後日開発予定
                  </p>
                </div>
                <div className="text-white text-opacity-50 text-sm">
                  開発中
                </div>
              </div>
            </div>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className="mt-4 p-3 glass-card rounded-xl backdrop-blur-md border border-green-400 border-opacity-40 animate-pulse bg-green-500 bg-opacity-10">
              <p className="text-white text-center text-sm font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
