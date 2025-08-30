'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, AlertCircle, CheckSquare } from 'lucide-react';
import { FAMILY_MEMBERS, TodoItem } from '@/types';
import { todoService } from '@/lib/firestore';

// 付箋の色をランダムに選択する関数
const getRandomStickyColor = (memberId: string) => {
  const colors = ['yellow', 'pink', 'blue', 'green', 'orange'];
  const memberIndex = FAMILY_MEMBERS.findIndex(m => m.id === memberId);
  return colors[memberIndex % colors.length] || 'yellow';
};

// ランダムな回転角度を生成する関数
const getRandomRotation = () => {
  return Math.random() * 16 - 8; // -8度から+8度
};

// ランダムなアニメーション遅延を生成する関数
const getRandomDelay = () => {
  return Math.random() * 2; // 0秒から2秒
};

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedMember, setSelectedMember] = useState(FAMILY_MEMBERS[0].id);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODOデータの読み込み
  const loadTodos = async () => {
    setLoading(true);
    try {
      const fetchedTodos = await todoService.getAllTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error('TODOの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネント初期化時にTODOを読み込み
  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await todoService.addTodo({
        title: newTodo.trim(),
        completed: false,
        createdBy: selectedMember,
        priority: 'medium',
      });
      setNewTodo('');
      await loadTodos(); // TODOを再読み込み
    } catch (error) {
      console.error('TODOの追加に失敗しました:', error);
      alert('TODOの追加に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await todoService.toggleTodoComplete(id, !completed);
      await loadTodos(); // TODOを再読み込み
    } catch (error) {
      console.error('TODOの状態更新に失敗しました:', error);
      alert('TODOの状態更新に失敗しました。');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!confirm('このTODOを削除しますか？')) return;
    
    try {
      await todoService.deleteTodo(id);
      await loadTodos(); // TODOを再読み込み
    } catch (error) {
      console.error('TODOの削除に失敗しました:', error);
      alert('TODOの削除に失敗しました。');
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const getMemberName = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.name || '';
  };

  const getMemberColor = (memberId: string) => {
    return FAMILY_MEMBERS.find(m => m.id === memberId)?.color || 'blue';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="glass-card mx-4 mt-4 px-4 py-3 fade-in">
        <div className="flex items-center">
          <CheckSquare size={20} className="text-white mr-3" />
          <h1 className="text-lg font-semibold text-glass">TODO付箋ボード</h1>
        </div>
      </header>

      {/* 新規追加フォーム */}
      <div className="glass-card mx-4 mt-2 p-3 fade-in">
        <div className="space-y-3">
          {/* 作成者選択 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              作成者
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member.id)}
                  className={`p-2 glass-select-button transition-all duration-300 ${
                    selectedMember === member.id
                      ? 'selected'
                      : ''
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${
                        member.color === 'blue' ? 'bg-blue-500' :
                        member.color === 'orange' ? 'bg-orange-500' :
                        member.color === 'green' ? 'bg-green-500' :
                        member.color === 'pink' ? 'bg-pink-500' :
                        'bg-gray-500'
                      } bg-opacity-30`}
                    >
                      {member.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TODO入力 */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1 min-w-0 px-3 py-2 glass-input text-white placeholder-white placeholder-opacity-60"
              placeholder="新しい付箋を追加"
              disabled={isSubmitting}
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim() || isSubmitting}
              className="glass-button p-2 flex-shrink-0 w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus size={18} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="glass-card mx-4 mt-2 px-4 py-2 fade-in">
        <div className="flex justify-center space-x-4">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'active', label: '未完了' },
            { key: 'completed', label: '完了済み' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as 'all' | 'active' | 'completed')}
              className={`px-3 py-1.5 glass-select-button text-sm font-semibold transition-all duration-300 ${
                filter === item.key
                  ? 'selected text-white'
                  : 'text-white text-opacity-70 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 付箋ボード */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        <div className="sticky-board h-full fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mb-4" />
              <p className="text-white text-opacity-80">読み込み中...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckSquare size={48} className="text-white text-opacity-40 mb-4" />
              <p className="text-white text-opacity-70 text-center">
                {filter === 'all' ? '付箋がありません' : 
                 filter === 'active' ? '未完了の付箋がありません' : 
                 '完了済みの付箋がありません'}
              </p>
            </div>
          ) : (
            <div className="sticky-container">
              <div className="sticky-grid">
                {filteredTodos.map((todo, index) => {
                  const stickyColor = getRandomStickyColor(todo.createdBy);
                  const rotation = getRandomRotation();
                  const delay = getRandomDelay();
                  
                  return (
                    <div
                      key={todo.id}
                      className={`sticky-note ${stickyColor} ${todo.completed ? 'completed' : ''}`}
                      style={{
                        '--rotation': `${rotation}deg`,
                        '--delay': `${delay}s`,
                      } as React.CSSProperties}
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                    >
                      {/* アクションボタン */}
                      <div className="sticky-actions">
                        <button
                          className="sticky-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTodo(todo.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* 付箋コンテンツ */}
                      <div className="sticky-content">
                        <div className={`sticky-title ${todo.completed ? 'completed' : ''}`}>
                          {todo.title}
                        </div>
                        
                        {todo.priority === 'high' && (
                          <div className="flex items-center">
                            <AlertCircle size={12} className="text-red-500 mr-1" />
                            <span className="text-xs text-red-600 font-medium">高優先度</span>
                          </div>
                        )}
                      </div>

                      {/* メタ情報 */}
                      <div className="sticky-meta">
                        <div
                          className={`sticky-member ${
                            getMemberColor(todo.createdBy) === 'blue' ? 'bg-blue-500' :
                            getMemberColor(todo.createdBy) === 'orange' ? 'bg-orange-500' :
                            getMemberColor(todo.createdBy) === 'green' ? 'bg-green-500' :
                            getMemberColor(todo.createdBy) === 'pink' ? 'bg-pink-500' :
                            'bg-gray-500'
                          }`}
                        >
                          {getMemberName(todo.createdBy)}
                        </div>
                        <div className="sticky-date">
                          {todo.createdAt.toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />
    </div>
  );
}
