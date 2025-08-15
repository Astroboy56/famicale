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
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className={`fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="glass-modal h-full w-full p-6 overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white border-opacity-20">
            <div className="flex items-center space-x-3">
              <Settings size={24} className="text-white" />
              <h2 className="text-xl font-semibold text-white">設定</h2>
            </div>
            <button
              onClick={onClose}
              className="glass-button p-2 rounded-full hover:scale-110 transition-transform duration-200"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* 設定項目 */}
          <div className="space-y-6">
            {/* カレンダー予定削除 */}
            <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform duration-200">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center">
                    <Trash2 size={20} className="text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">カレンダー予定</h3>
                    <p className="text-white text-opacity-70 text-sm">
                      全てのカレンダー予定を削除します
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteAllEvents}
                  disabled={isDeletingEvents}
                  className="w-full glass-button py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform duration-200"
                >
                  <Trash2 size={16} />
                  <span>{isDeletingEvents ? '削除中...' : '削除'}</span>
                </button>
              </div>
            </div>

            {/* TODOリスト削除 */}
            <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform duration-200">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center">
                    <Trash2 size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">TODOリスト</h3>
                    <p className="text-white text-opacity-70 text-sm">
                      全てのTODOリストを削除します
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteAllTodos}
                  disabled={isDeletingTodos}
                  className="w-full glass-button py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform duration-200"
                >
                  <Trash2 size={16} />
                  <span>{isDeletingTodos ? '削除中...' : '削除'}</span>
                </button>
              </div>
            </div>

            {/* 今後の開発予定 */}
            <div className="glass-card p-5 rounded-2xl opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-500 bg-opacity-20 flex items-center justify-center">
                  <Settings size={20} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">その他の設定</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    後日開発予定
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 rounded-2xl border border-blue-400 border-opacity-30">
              <p className="text-white text-center text-sm font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
