'use client';

import { useState } from 'react';
import { Coins, Plus, Target, Star } from 'lucide-react';
import BottomNavigation from '@/components/Layout/BottomNavigation';

// ポイ活関連の型定義
interface PoiTask {
  id: string;
  name: string;
  points: number;
  isDefault: boolean;
}

interface PoiWish {
  id: string;
  name: string;
  targetPoints: number;
  isCompleted: boolean;
}

interface PoiRecord {
  id: string;
  childId: string;
  taskId: string;
  date: string;
  points: number;
  note?: string;
}

interface PoiChild {
  id: string;
  name: string;
  totalPoints: number;
}

// デフォルトの頑張るリスト
const DEFAULT_TASKS: PoiTask[] = [
  { id: 'study', name: '勉強', points: 10, isDefault: true },
  { id: 'exercise', name: '筋トレ', points: 15, isDefault: true },
  { id: 'help', name: 'お手伝い', points: 5, isDefault: true },
];

// 子供の情報
const CHILDREN: PoiChild[] = [
  { id: 'alice', name: 'ありす', totalPoints: 0 },
  { id: 'kosumo', name: 'こすも', totalPoints: 0 },
];

export default function PoiPage() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [children] = useState<PoiChild[]>(CHILDREN);
  const [tasks] = useState<PoiTask[]>(DEFAULT_TASKS);
  const [wishes] = useState<PoiWish[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [currentView, setCurrentView] = useState<'select' | 'taskList' | 'exchange'>('select');

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins size={20} className="text-white" />
            <span className="ml-2 text-sm font-medium text-white">ポイ活</span>
          </div>
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
                     <div className="p-3 glass-area">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-white font-medium">お勉強</div>
                           <div className="text-xs text-white text-opacity-70">10 ポイント</div>
                         </div>
                         <Star size={16} className="text-yellow-400" />
                       </div>
                     </div>
                     <div className="p-3 glass-area">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-white font-medium">お手伝い</div>
                           <div className="text-xs text-white text-opacity-70">5 ポイント</div>
                         </div>
                         <Star size={16} className="text-yellow-400" />
                       </div>
                     </div>
                     <div className="p-3 glass-area">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-white font-medium">筋トレ</div>
                           <div className="text-xs text-white text-opacity-70">15 ポイント</div>
                         </div>
                         <Star size={16} className="text-yellow-400" />
                       </div>
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="p-3 glass-area">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-white font-medium">勉強</div>
                           <div className="text-xs text-white text-opacity-70">10 ポイント</div>
                         </div>
                         <Star size={16} className="text-yellow-400" />
                       </div>
                     </div>
                     <div className="p-3 glass-area">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-white font-medium">家バイト</div>
                           <div className="text-xs text-white text-opacity-70">20 ポイント</div>
                         </div>
                         <Star size={16} className="text-yellow-400" />
                       </div>
                     </div>
                   </>
                 )}
               </div>
             </div>

             {/* カスタムタスク追加ボタン */}
             <button
               onClick={() => setShowTaskModal(true)}
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
                 onClick={() => setShowWishModal(true)}
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
                 onClick={() => {
                   // 現金交換のロジックを実装
                   alert('現金交換機能は今後実装予定です');
                 }}
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
      </div>

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </div>
  );
}
