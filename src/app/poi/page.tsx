'use client';

import { useState, useEffect } from 'react';
import { Coins, Plus, Target, Calendar, Star } from 'lucide-react';
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
  const [children, setChildren] = useState<PoiChild[]>(CHILDREN);
  const [tasks, setTasks] = useState<PoiTask[]>(DEFAULT_TASKS);
  const [wishes, setWishes] = useState<PoiWish[]>([]);
  const [records, setRecords] = useState<PoiRecord[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // 合計ポイントを計算
  const totalPoints = children.reduce((sum, child) => sum + child.totalPoints, 0);

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins size={20} className="text-white" />
            <span className="ml-2 text-sm font-medium text-white">ポイ活</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTaskModal(true)}
              className="glass-button p-2"
            >
              <Plus size={16} className="text-white" />
            </button>
            <button
              onClick={() => setShowWishModal(true)}
              className="glass-button p-2"
            >
              <Target size={16} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ステータス画面 */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        {/* 合計ポイント表示 */}
        <div className="glass-card p-4 mb-4 fade-in">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {totalPoints} ポイント
            </div>
            <div className="text-sm text-white text-opacity-70">
              合計ポイント
            </div>
          </div>
        </div>

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

        {/* 頑張るリスト */}
        {selectedChild && (
          <div className="glass-card p-4 mb-4 fade-in">
            <h3 className="text-sm font-semibold text-white mb-3">頑張るリスト</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setShowRecordModal(true)}
                  className="w-full p-3 glass-button text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{task.name}</div>
                      <div className="text-xs text-white text-opacity-70">
                        {task.points} ポイント
                      </div>
                    </div>
                    <Star size={16} className="text-yellow-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 欲しいものリスト */}
        {wishes.length > 0 && (
          <div className="glass-card p-4 mb-4 fade-in">
            <h3 className="text-sm font-semibold text-white mb-3">欲しいものリスト</h3>
            <div className="space-y-2">
              {wishes.map((wish) => (
                <div key={wish.id} className="p-3 glass-area">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{wish.name}</div>
                      <div className="text-xs text-white text-opacity-70">
                        目標: {wish.targetPoints} ポイント
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">
                        {Math.min(totalPoints, wish.targetPoints)} / {wish.targetPoints}
                      </div>
                      <div className="w-16 h-2 bg-white bg-opacity-20 rounded-full mt-1">
                        <div 
                          className="h-2 bg-green-400 rounded-full"
                          style={{ width: `${Math.min((totalPoints / wish.targetPoints) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </div>
  );
}
