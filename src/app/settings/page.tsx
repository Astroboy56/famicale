'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, CheckSquare, Palette, Cloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteAllEvents, deleteAllTodos } from '@/lib/firestore';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import BottomNavigation from '@/components/Layout/BottomNavigation';

export default function SettingsPage() {
  const router = useRouter();
  const [isDeletingEvents, setIsDeletingEvents] = useState(false);
  const [isDeletingTodos, setIsDeletingTodos] = useState(false);
  const [message, setMessage] = useState('');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [weatherZipcode, setWeatherZipcode] = useState('');
  const [isSavingWeather, setIsSavingWeather] = useState(false);
  const { theme, setTheme } = useTheme();

  // 天気設定をローカルストレージから読み込み
  useEffect(() => {
    const savedWeatherEnabled = localStorage.getItem('weatherEnabled');
    const savedWeatherZipcode = localStorage.getItem('weatherZipcode');
    
    if (savedWeatherEnabled) {
      setWeatherEnabled(JSON.parse(savedWeatherEnabled));
    }
    if (savedWeatherZipcode) {
      setWeatherZipcode(savedWeatherZipcode);
    }
  }, []);

  // 天気設定を保存
  const handleSaveWeatherSettings = () => {
    setIsSavingWeather(true);
    try {
      localStorage.setItem('weatherEnabled', JSON.stringify(weatherEnabled));
      localStorage.setItem('weatherZipcode', weatherZipcode);
      setMessage('天気設定を保存しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('天気設定の保存に失敗:', error);
      setMessage('天気設定の保存に失敗しました');
    } finally {
      setIsSavingWeather(false);
    }
  };

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

          {/* 天気予報設定 */}
          <div className="glass-card p-4 fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">天気予報設定</h2>
            
            {/* 天気表示の有効/無効 */}
            <div className="mb-4">
              <div className="flex items-center justify-between p-4 glass-button text-white font-medium border border-blue-300 border-opacity-30 bg-blue-500 bg-opacity-5">
                <div className="flex items-center space-x-3">
                  <Cloud size={20} className="text-blue-300" />
                  <span>天気予報を表示</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weatherEnabled}
                    onChange={(e) => setWeatherEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* 郵便番号設定 */}
            {weatherEnabled && (
              <div className="mb-4">
                <div className="p-4 glass-card">
                  <label className="block text-white text-sm font-medium mb-2">
                    郵便番号（7桁）
                  </label>
                  <input
                    type="text"
                    value={weatherZipcode}
                    onChange={(e) => setWeatherZipcode(e.target.value)}
                    placeholder="例: 1000001"
                    maxLength={7}
                    className="w-full px-3 py-2 glass-input text-white placeholder-white placeholder-opacity-60 mb-3"
                  />
                  <button
                    onClick={handleSaveWeatherSettings}
                    disabled={isSavingWeather || !weatherZipcode || weatherZipcode.length !== 7}
                    className="w-full glass-button py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingWeather ? '保存中...' : '設定を保存'}
                  </button>
                </div>
              </div>
            )}

            {/* 設定説明 */}
            <div className="text-white text-opacity-70 text-sm">
              天気予報を有効にすると、リストビューの日付の隣に天気アイコンが表示されます。
            </div>
          </div>

          {/* 画面テーマ設定 */}
          <div className="glass-card p-4 fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">画面テーマ</h2>
            
            {/* テーマ選択ボタン */}
            <div className="mb-4">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="w-full flex items-center justify-between p-4 glass-button text-white font-medium border border-purple-300 border-opacity-30 hover:border-purple-200 hover:border-opacity-50 transition-all duration-300 bg-purple-500 bg-opacity-5"
              >
                <div className="flex items-center space-x-3">
                  <Palette size={20} className="text-purple-300" />
                  <span>背景色を選択</span>
                </div>
                <span className="text-white text-opacity-70 text-sm">
                  {showThemeSelector ? '閉じる' : '選択'}
                </span>
              </button>
            </div>

            {/* テーマ選択エリア */}
            {showThemeSelector && (
              <div className="space-y-2">
                {[
                  { id: 'default' as ThemeMode, name: 'デフォルト', description: '現在の仕様' },
                  { id: 'ocean' as ThemeMode, name: '海', description: '青色と水色っぽい色グラデーション' },
                  { id: 'forest' as ThemeMode, name: '森', description: '緑と黄緑っぽい色のグラデーション' },
                  { id: 'love' as ThemeMode, name: 'ラブ', description: 'ピンクと赤っぽい色のグラデーション' },
                  { id: 'programmer' as ThemeMode, name: 'プログラマー', description: 'SEっぽい配色' }
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => {
                      setTheme(themeOption.id);
                      setMessage(`${themeOption.name}テーマに変更しました`);
                      setTimeout(() => setMessage(''), 3000);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      theme === themeOption.id
                        ? 'glass-button border-2 border-white border-opacity-50'
                        : 'glass-card hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{themeOption.name}</div>
                        <div className="text-white text-opacity-70 text-sm">{themeOption.description}</div>
                      </div>
                      {theme === themeOption.id && (
                        <div className="text-white text-opacity-80">✓</div>
                      )}
                    </div>
                  </button>
                ))}
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
