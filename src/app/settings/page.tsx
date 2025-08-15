'use client';

import { useState } from 'react';
import { ArrowLeft, Trash2, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteAllEvents, deleteAllTodos } from '@/lib/firestore';
import BottomNavigation from '@/components/Layout/BottomNavigation';

export default function SettingsPage() {
  const router = useRouter();
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
      setMessage('全てのカレンダー予定を削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage('削除に失敗しました');
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
      setMessage('全てのTODOリストを削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage('削除に失敗しました');
    } finally {
      setIsDeletingTodos(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="glass-button p-2"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold text-glass">設定</h1>
          <div className="w-10" /> {/* スペーサー */}
        </div>
      </header>

      {/* 設定内容 */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20">
        <div className="space-y-4">
          {/* データ削除セクション */}
          <div className="glass-card p-4 fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">データ管理</h2>
            
            {/* カレンダー予定削除 */}
            <div className="mb-4">
              <button
                onClick={handleDeleteAllEvents}
                disabled={isDeletingEvents}
                className="w-full flex items-center justify-between p-4 glass-button text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-300 border-opacity-30 hover:border-red-200 hover:border-opacity-50 transition-all duration-300 bg-red-500 bg-opacity-5"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 size={20} className="text-red-300" />
                  <span>カレンダー予定を全て削除</span>
                </div>
                {isDeletingEvents && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
              </button>
            </div>

            {/* TODOリスト削除 */}
            <div className="mb-4">
              <button
                onClick={handleDeleteAllTodos}
                disabled={isDeletingTodos}
                className="w-full flex items-center justify-between p-4 glass-button text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-blue-300 border-opacity-30 hover:border-blue-200 hover:border-opacity-50 transition-all duration-300 bg-blue-500 bg-opacity-5"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare size={20} className="text-blue-300" />
                  <span>TODOリストを全て削除</span>
                </div>
                {isDeletingTodos && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
              </button>
            </div>

            {/* メッセージ表示 */}
            {message && (
              <div className="mt-4 p-3 border border-green-400 border-opacity-40 animate-pulse bg-green-500 bg-opacity-10 rounded-lg">
                <p className="text-white text-sm text-center">{message}</p>
              </div>
            )}
          </div>

          {/* その他の設定（将来の開発用） */}
          <div className="glass-card p-4 fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">その他の設定</h2>
            <div className="text-white text-opacity-70 text-sm">
              今後追加予定の設定項目がここに表示されます。
            </div>
          </div>
        </div>
      </div>

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </div>
  );
}
