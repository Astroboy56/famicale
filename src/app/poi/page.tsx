'use client';

import { useState, useEffect } from 'react';
import { Coins, Plus, Target, Star, Calendar } from 'lucide-react';
import BottomNavigation from '@/components/Layout/BottomNavigation';
import { poiChildService, poiService } from '@/lib/firestore';
import { PoiRecord } from '@/types';

// ポイ活関連の型定義

interface PoiWish {
  id: string;
  name: string;
  targetPoints: number;
  isCompleted: boolean;
}



interface PoiChild {
  id: string;
  name: string;
  totalPoints: number;
}



// 子供の情報
const CHILDREN: PoiChild[] = [
  { id: 'alice', name: 'ありす', totalPoints: 0 },
  { id: 'kosumo', name: 'こすも', totalPoints: 0 },
];

// 褒める言葉の配列
const PRAISE_MESSAGES = [
  'よくがんばったね！',
  '次も頑張ってね！',
  '継続して頑張れ！',
  'すごいね！',
  'えらいね！',
  '頑張りが続いてるね！',
  '今日もお疲れ様！',
  '素晴らしい！',
  '立派だね！',
  '感動したよ！'
];

export default function PoiPage() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [children, setChildren] = useState<PoiChild[]>(CHILDREN);
  const [wishes] = useState<PoiWish[]>([]);
  const [currentView, setCurrentView] = useState<'select' | 'taskList' | 'exchange' | 'wishRegister' | 'cashExchange' | 'calendar' | 'history'>('select');
  const [showPraiseMessage, setShowPraiseMessage] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState('');
  const [taskHistory, setTaskHistory] = useState<PoiRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Firebaseから子供のデータをリアルタイムで取得
  useEffect(() => {
    const unsubscribe = poiChildService.subscribeToChildren((firebaseChildren) => {
      if (firebaseChildren.length > 0) {
        // Firebaseのデータを優先し、ない場合はデフォルト値を使用
        const updatedChildren = CHILDREN.map(defaultChild => {
          const firebaseChild = firebaseChildren.find(fc => fc.id === defaultChild.id);
          return firebaseChild || defaultChild;
        });
        setChildren(updatedChildren);
      }
    });

    return () => unsubscribe();
  }, []);

  // タスク履歴を読み込む関数
  const loadTaskHistory = async (childId: string) => {
    setLoadingHistory(true);
    try {
      const history = await poiService.getChildRecords(childId);
      setTaskHistory(history);
      console.log(`タスク履歴を読み込みました: ${history.length}件`);
    } catch (error) {
      console.error('タスク履歴の読み込みに失敗しました:', error);
      setTaskHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // タスク登録とポイント加算の関数
  const handleTaskRegistration = async (taskName: string, points: number) => {
    if (!selectedChild) {
      alert('子供を選択してください');
      return;
    }

    if (confirm(`${taskName}を登録しますか？`)) {
      try {
        console.log(`🎯 タスク登録開始: ${taskName}, ポイント: ${points}, 子供: ${selectedChild}`);
        
        // 現在の子供の情報を取得
        const currentChild = children.find(child => child.id === selectedChild);
        console.log('👶 現在の子供情報:', currentChild);
        if (!currentChild) {
          console.error('❌ 選択された子供の情報が見つかりません');
          return;
        }

        // 新しいポイントを計算
        const newPoints = currentChild.totalPoints + points;
        console.log(`💰 ポイント計算: ${newPoints} = ${currentChild.totalPoints} + ${points}`);

        // Firebaseにポイントを更新（データが存在しない場合は初期化される）
        console.log('🔥 Firebaseにポイント更新を開始...');
        await poiChildService.updateChildPoints(selectedChild, newPoints);
        console.log('✅ Firebaseポイント更新完了');

        // タスク記録を追加
        try {
          console.log('📝 タスク記録を追加中...');
          await poiService.addRecord({
            childId: selectedChild,
            taskId: taskName, // taskNameをtaskIdとして使用
            points: points,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
          });
          console.log(`✅ タスク記録を追加しました: ${taskName}`);
        } catch (recordError) {
          console.error('❌ タスク記録の追加に失敗しました:', recordError);
          // 記録の失敗はポイント更新を妨げない
        }

        // ローカル状態も更新
        console.log('🔄 ローカル状態を更新中...');
        setChildren(prevChildren => {
          const updatedChildren = prevChildren.map(child => 
            child.id === selectedChild 
              ? { ...child, totalPoints: newPoints }
              : child
          );
          console.log('📊 更新後のローカル状態:', updatedChildren);
          return updatedChildren;
        });
        
        console.log(`🎉 ポイント更新完了: ${selectedChild} のポイントが ${newPoints} になりました`);
        
        // ランダムな褒める言葉を選択
        const randomPraise = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
        setPraiseMessage(randomPraise);
        setShowPraiseMessage(true);
        
        // 3秒後に褒めるメッセージを非表示
        setTimeout(() => {
          setShowPraiseMessage(false);
        }, 3000);
      } catch (error) {
        console.error('❌ ポイントの更新に失敗しました:', error);
        alert('ポイントの更新に失敗しました。もう一度お試しください。');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins size={20} className="text-white" />
            <span className="ml-2 text-sm font-medium text-white">ポイ活</span>
          </div>
          <button
            onClick={() => setCurrentView('calendar')}
            className="glass-button p-2"
          >
            <Calendar size={20} className="text-white" />
          </button>
        </div>
      </header>

      {/* ステータス画面 */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        {/* 子供選択 */}
        <div className="glass-card p-4 mb-4 fade-in">
          <h3 className="text-sm font-semibold text-white mb-3">子供を選択</h3>
          <div className="grid grid-cols-2 gap-3">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`p-4 glass-select-button transition-all duration-300 ${
                  selectedChild === child.id ? 'selected' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-1">
                    {child.name}
                  </div>
                  <div className="text-sm text-white text-opacity-70">
                    {child.totalPoints} ポイント
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

                 {/* アクションボタン */}
         {currentView === 'select' && (
           <div className="space-y-3">
             <button
               onClick={() => {
                 if (selectedChild) {
                   setCurrentView('taskList');
                 }
               }}
               disabled={!selectedChild}
               className={`w-full p-4 glass-button text-left ${
                 !selectedChild ? 'opacity-50' : ''
               }`}
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center">
                   <Plus size={20} className="text-white mr-3" />
                   <span className="text-white font-medium">ポイ活登録をする</span>
                 </div>
               </div>
             </button>

             <button
               onClick={() => {
                 if (selectedChild) {
                   setCurrentView('exchange');
                 }
               }}
               disabled={!selectedChild}
               className={`w-full p-4 glass-button text-left ${
                 !selectedChild ? 'opacity-50' : ''
               }`}
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center">
                   <Target size={20} className="text-white mr-3" />
                   <span className="text-white font-medium">ポイントを交換する</span>
                 </div>
               </div>
             </button>

             <button
               onClick={() => {
                 if (selectedChild) {
                   loadTaskHistory(selectedChild);
                   setCurrentView('history');
                 }
               }}
               disabled={!selectedChild}
               className={`w-full p-4 glass-button text-left ${
                 !selectedChild ? 'opacity-50' : ''
               }`}
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center">
                   <Calendar size={20} className="text-white mr-3" />
                   <span className="text-white font-medium">タスク履歴を見る</span>
                 </div>
               </div>
             </button>
           </div>
         )}

         {/* 頑張るリスト画面 */}
         {currentView === 'taskList' && selectedChild && (
           <div className="space-y-4">
             {/* ヘッダー */}
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-white">
                 {children.find(c => c.id === selectedChild)?.name}の頑張るリスト
               </h3>
               <button
                 onClick={() => setCurrentView('select')}
                 className="text-sm text-white text-opacity-70"
               >
                 戻る
               </button>
             </div>

             {/* デフォルトタスク */}
             <div className="glass-card p-4">
               <h4 className="text-sm font-semibold text-white mb-3">デフォルトタスク</h4>
               <div className="space-y-2">
                                   {selectedChild === 'alice' ? (
                    <>
                      <button
                        onClick={() => handleTaskRegistration('お勉強', 10)}
                        className="w-full p-3 glass-area text-left hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">お勉強</div>
                            <div className="text-xs text-white text-opacity-70">10 ポイント</div>
                          </div>
                          <Star size={16} className="text-yellow-400" />
                        </div>
                      </button>
                      <button
                        onClick={() => handleTaskRegistration('お手伝い', 5)}
                        className="w-full p-3 glass-area text-left hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">お手伝い</div>
                            <div className="text-xs text-white text-opacity-70">5 ポイント</div>
                          </div>
                          <Star size={16} className="text-yellow-400" />
                        </div>
                      </button>
                      <button
                        onClick={() => handleTaskRegistration('筋トレ', 15)}
                        className="w-full p-3 glass-area text-left hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">筋トレ</div>
                            <div className="text-xs text-white text-opacity-70">15 ポイント</div>
                          </div>
                          <Star size={16} className="text-yellow-400" />
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleTaskRegistration('勉強', 10)}
                        className="w-full p-3 glass-area text-left hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">勉強</div>
                            <div className="text-xs text-white text-opacity-70">10 ポイント</div>
                          </div>
                          <Star size={16} className="text-yellow-400" />
                        </div>
                      </button>
                      <button
                        onClick={() => handleTaskRegistration('家バイト', 20)}
                        className="w-full p-3 glass-area text-left hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">家バイト</div>
                            <div className="text-xs text-white text-opacity-70">20 ポイント</div>
                          </div>
                          <Star size={16} className="text-yellow-400" />
                        </div>
                      </button>
                    </>
                  )}
               </div>
             </div>

                           {/* カスタムタスク追加ボタン */}
              <button
                onClick={() => {
                  // カスタムタスク追加機能は今後実装予定
                  alert('カスタムタスク追加機能は今後実装予定です');
                }}
                className="w-full p-4 glass-button text-center"
              >
                <div className="flex items-center justify-center">
                  <Plus size={20} className="text-white mr-2" />
                  <span className="text-white font-medium">カスタムタスクを追加</span>
                </div>
              </button>
           </div>
         )}

         {/* ポイント交換画面 */}
         {currentView === 'exchange' && selectedChild && (
           <div className="space-y-4">
             {/* ヘッダー */}
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-white">
                 {children.find(c => c.id === selectedChild)?.name}のポイント交換
               </h3>
               <button
                 onClick={() => setCurrentView('select')}
                 className="text-sm text-white text-opacity-70"
               >
                 戻る
               </button>
             </div>

             {/* 現在のポイント */}
             <div className="glass-card p-4 text-center">
               <div className="text-2xl font-bold text-white mb-2">
                 {children.find(c => c.id === selectedChild)?.totalPoints} ポイント
               </div>
               <div className="text-sm text-white text-opacity-70">
                 現在のポイント
               </div>
             </div>

             {/* 交換オプション */}
             <div className="space-y-3">
                               <button
                  onClick={() => {
                    if (wishes.length === 0) {
                      setCurrentView('wishRegister');
                    } else {
                      // 欲しいものリスト表示機能は今後実装予定
                      alert('欲しいものリスト表示機能は今後実装予定です');
                    }
                  }}
                  className="w-full p-4 glass-button text-left"
                >
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <Target size={20} className="text-white mr-3" />
                     <span className="text-white font-medium">欲しいものと交換</span>
                   </div>
                 </div>
               </button>

               <button
                 onClick={() => setCurrentView('cashExchange')}
                 className="w-full p-4 glass-button text-left"
               >
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <Coins size={20} className="text-white mr-3" />
                     <span className="text-white font-medium">現金に交換</span>
                   </div>
                 </div>
               </button>
             </div>
           </div>
                   )}

          {/* 欲しいもの登録画面 */}
          {currentView === 'wishRegister' && selectedChild && (
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {children.find(c => c.id === selectedChild)?.name}の欲しいものを登録
                </h3>
                <button
                  onClick={() => setCurrentView('exchange')}
                  className="text-sm text-white text-opacity-70"
                >
                  戻る
                </button>
              </div>

              {/* 登録フォーム */}
              <div className="glass-card p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      欲しいもの
                    </label>
                    <input
                      type="text"
                      placeholder="例：おもちゃ、本など"
                      className="w-full p-3 glass-input text-white placeholder-white placeholder-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      ポイント設定
                    </label>
                    <input
                      type="number"
                      placeholder="例：100"
                      className="w-full p-3 glass-input text-white placeholder-white placeholder-opacity-50"
                    />
                  </div>
                  <button
                    onClick={() => {
                      // 登録処理を実装
                      alert('登録機能は今後実装予定です');
                      setCurrentView('exchange');
                    }}
                    className="w-full p-4 glass-button text-center"
                  >
                    <span className="text-white font-medium">登録する</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 現金交換画面 */}
          {currentView === 'cashExchange' && selectedChild && (
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {children.find(c => c.id === selectedChild)?.name}の現金交換
                </h3>
                <button
                  onClick={() => setCurrentView('exchange')}
                  className="text-sm text-white text-opacity-70"
                >
                  戻る
                </button>
              </div>

              {/* 現在のポイント */}
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {children.find(c => c.id === selectedChild)?.totalPoints} ポイント
                </div>
                <div className="text-sm text-white text-opacity-70">
                  現在のポイント
                </div>
              </div>

              {/* 交換レート */}
              <div className="glass-card p-4 text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  1 ポイント = 1 円
                </div>
                <div className="text-sm text-white text-opacity-70">
                  交換レート
                </div>
              </div>

              {/* 交換フォーム */}
              <div className="glass-card p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      交換するポイント数
                    </label>
                    <input
                      type="number"
                      placeholder="例：50"
                      className="w-full p-3 glass-input text-white placeholder-white placeholder-opacity-50"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-white text-opacity-70">
                      交換金額: <span className="text-white font-semibold">0 円</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // 交換処理を実装
                      alert('交換機能は今後実装予定です');
                      setCurrentView('exchange');
                    }}
                    className="w-full p-4 glass-button text-center"
                  >
                    <span className="text-white font-medium">交換する</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* カレンダー画面 */}
          {currentView === 'calendar' && (
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  頑張った日のカレンダー
                </h3>
                <button
                  onClick={() => setCurrentView('select')}
                  className="text-sm text-white text-opacity-70"
                >
                  戻る
                </button>
              </div>

              {/* 子供選択 */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-white mb-3">子供を選択</h4>
                <div className="grid grid-cols-2 gap-3">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child.id)}
                      className={`p-4 glass-select-button transition-all duration-300 ${
                        selectedChild === child.id ? 'selected' : ''
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white mb-1">
                          {child.name}
                        </div>
                        <div className="text-sm text-white text-opacity-70">
                          {child.totalPoints} ポイント
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* カレンダー表示（プレースホルダー） */}
              {selectedChild && (
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {children.find(c => c.id === selectedChild)?.name}の頑張った日
                  </h4>
                  <div className="text-center text-white text-opacity-70">
                    <p>カレンダー機能は今後実装予定です</p>
                    <p className="text-sm mt-2">
                      タスク登録時に頑張った日がマークされます
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* タスク履歴画面 */}
          {currentView === 'history' && selectedChild && (
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {children.find(c => c.id === selectedChild)?.name}のタスク履歴
                </h3>
                <button
                  onClick={() => setCurrentView('select')}
                  className="text-sm text-white text-opacity-70"
                >
                  戻る
                </button>
              </div>

              {/* 履歴表示 */}
              <div className="glass-card p-4">
                {loadingHistory ? (
                  <div className="text-center text-white text-opacity-70">
                    <p>履歴を読み込み中...</p>
                  </div>
                ) : taskHistory.length > 0 ? (
                  <div className="space-y-3">
                    {taskHistory.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 glass-area">
                        <div>
                          <div className="text-white font-medium">{record.taskId}</div>
                          <div className="text-xs text-white text-opacity-70">
                            {record.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">+{record.points}</div>
                          <div className="text-xs text-white text-opacity-70">ポイント</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white text-opacity-70">
                    <p>まだタスク履歴がありません</p>
                    <p className="text-sm mt-2">
                      タスクを登録すると履歴が表示されます
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ボトムナビゲーション */}
        <BottomNavigation />

        {/* 褒めるメッセージ */}
        {showPraiseMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="glass-card p-8 mx-4 text-center">
              <div className="text-2xl font-bold text-white mb-4">
                {praiseMessage}
              </div>
              <div className="text-sm text-white text-opacity-70">
                ポイントが加算されました！
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
