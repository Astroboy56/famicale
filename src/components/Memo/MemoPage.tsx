'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Memo, FAMILY_MEMBERS, COLOR_MAP, MEMO_PRIORITY_COLORS } from '@/types';
import { memoService } from '@/lib/firestore';

interface MemoCardProps {
  memo: Memo;
  onUpdate: (memoId: string, updates: Partial<Memo>) => void;
  onDelete: (memoId: string) => void;
  onDragStart: (e: React.DragEvent, memoId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, memoId: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ 
  memo, 
  onUpdate, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop 
}) => {
  const familyMember = FAMILY_MEMBERS.find(m => m.id === memo.familyMemberId);
  const colorStyle = COLOR_MAP[familyMember?.color || 'blue'];
  const priorityStyle = MEMO_PRIORITY_COLORS[memo.priority];

  const handleToggleComplete = () => {
    onUpdate(memo.id, { isCompleted: !memo.isCompleted });
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    onUpdate(memo.id, { priority });
  };

  return (
    <div
      className={`relative p-4 rounded-lg shadow-md cursor-move transition-all duration-200 hover:shadow-lg glass-card ${
        memo.isCompleted ? 'opacity-60' : ''
      } ${priorityStyle} ${colorStyle.border} border-2`}
      draggable
      onDragStart={(e) => onDragStart(e, memo.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, memo.id)}
    >
      {/* 完了チェックボックス */}
      <div className="absolute top-2 right-2">
        <input
          type="checkbox"
          checked={memo.isCompleted}
          onChange={handleToggleComplete}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      </div>

      {/* 家族メンバー名 */}
      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${colorStyle.bg} ${colorStyle.text}`}>
        {familyMember?.name}
      </div>

             {/* タイトル */}
       <h3 className={`font-semibold mb-2 text-white ${memo.isCompleted ? 'line-through' : ''}`}>
         {memo.title}
       </h3>

       {/* 内容 */}
       <p className={`text-sm mb-3 text-white ${memo.isCompleted ? 'line-through' : ''}`}>
         {memo.content}
       </p>

       {/* 期限 */}
       {memo.dueDate && (
         <div className="text-xs text-white opacity-70 mb-2">
           期限: {new Date(memo.dueDate).toLocaleDateString('ja-JP')}
         </div>
       )}

      {/* 優先度ボタン */}
      <div className="flex gap-1 mb-2">
        {(['low', 'medium', 'high'] as const).map((priority) => (
          <button
            key={priority}
            onClick={() => handlePriorityChange(priority)}
            className={`px-2 py-1 text-xs rounded ${
              memo.priority === priority
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {priority === 'low' ? '低' : priority === 'medium' ? '中' : '高'}
          </button>
        ))}
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(memo.id)}
        className="absolute bottom-2 right-2 text-red-500 hover:text-red-700 text-sm"
      >
        削除
      </button>
    </div>
  );
};

interface AddMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedFamilyMemberId: string;
}

const AddMemoModal: React.FC<AddMemoModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  selectedFamilyMemberId 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      content: content.trim(),
      familyMemberId: selectedFamilyMemberId,
      priority,
      dueDate: dueDate || undefined,
      isCompleted: false,
      order: 0, // 後で自動設定される
    });

    setTitle('');
    setContent('');
    setPriority('medium');
    setDueDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-modal p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">メモを追加</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">タイトル</label>
                         <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full p-2 border border-white border-opacity-30 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="メモのタイトルを入力"
               required
             />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">内容</label>
                         <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="w-full p-2 border border-white border-opacity-30 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="メモの内容を入力"
               rows={3}
             />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">優先度</label>
                         <select
               value={priority}
               onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
               className="w-full p-2 border border-white border-opacity-30 rounded bg-white bg-opacity-20 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">期限（任意）</label>
                         <input
               type="date"
               value={dueDate}
               onChange={(e) => setDueDate(e.target.value)}
               className="w-full p-2 border border-white border-opacity-30 rounded bg-white bg-opacity-20 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 glass-button py-2 px-4 rounded hover:bg-opacity-30"
            >
              追加
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-button py-2 px-4 rounded hover:bg-opacity-30 bg-opacity-20"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MemoPage: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState(FAMILY_MEMBERS[0].id);
  const [draggedMemoId, setDraggedMemoId] = useState<string | null>(null);

  // メモの監視
  useEffect(() => {
    console.log('メモ監視を開始');
    const unsubscribe = memoService.subscribeToMemos((memos) => {
      console.log('メモデータを受信:', memos);
      setMemos(memos);
    });

    return unsubscribe;
  }, []);

  // メモ追加
  const handleAddMemo = useCallback(async (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('メモ追加処理を開始:', memo);
    try {
      const memoId = await memoService.addMemo(memo);
      console.log('メモ追加が完了しました。ID:', memoId);
    } catch (error) {
      console.error('メモの追加に失敗しました:', error);
      alert('メモの追加に失敗しました。Firebase接続を確認してください。');
    }
  }, []);

  // メモ更新
  const handleUpdateMemo = useCallback(async (memoId: string, updates: Partial<Memo>) => {
    try {
      await memoService.updateMemo(memoId, updates);
    } catch (error) {
      console.error('メモの更新に失敗しました:', error);
    }
  }, []);

  // メモ削除
  const handleDeleteMemo = useCallback(async (memoId: string) => {
    if (window.confirm('このメモを削除しますか？')) {
      try {
        await memoService.deleteMemo(memoId);
      } catch (error) {
        console.error('メモの削除に失敗しました:', error);
      }
    }
  }, []);

  // ドラッグ&ドロップ処理
  const handleDragStart = (e: React.DragEvent, memoId: string) => {
    setDraggedMemoId(memoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(async (e: React.DragEvent, targetMemoId: string) => {
    e.preventDefault();
    
    if (!draggedMemoId || draggedMemoId === targetMemoId) return;

    const draggedIndex = memos.findIndex(m => m.id === draggedMemoId);
    const targetIndex = memos.findIndex(m => m.id === targetMemoId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newMemos = [...memos];
    const [draggedMemo] = newMemos.splice(draggedIndex, 1);
    newMemos.splice(targetIndex, 0, draggedMemo);

    // 順序を更新
    const memoIds = newMemos.map(m => m.id);
    try {
      await memoService.updateMemoOrder(memoIds);
    } catch (error) {
      console.error('メモの順序更新に失敗しました:', error);
    }

    setDraggedMemoId(null);
  }, [draggedMemoId, memos]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">家族メモボード</h1>

        {/* 家族メンバーボタン */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {FAMILY_MEMBERS.map((member) => {
            const colorStyle = COLOR_MAP[member.color];
            return (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedFamilyMemberId(member.id);
                  setIsAddModalOpen(true);
                }}
                                 className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 glass-button ${colorStyle.bg} ${colorStyle.text} bg-opacity-60 shadow-md`}
              >
                {member.name}のメモ追加
              </button>
            );
          })}
        </div>

        {/* メモボード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onUpdate={handleUpdateMemo}
              onDelete={handleDeleteMemo}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* メモが空の場合 */}
        {memos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg opacity-80">まだメモがありません</p>
            <p className="text-white text-sm opacity-60">上のボタンからメモを追加してください</p>
          </div>
        )}

        {/* メモ追加モーダル */}
        <AddMemoModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddMemo}
          selectedFamilyMemberId={selectedFamilyMemberId}
        />
      </div>
    </div>
  );
};

export default MemoPage;
