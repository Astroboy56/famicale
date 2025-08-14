'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, AlertCircle, CheckSquare } from 'lucide-react';
import { FAMILY_MEMBERS, COLOR_MAP, TodoItem } from '@/types';
import { todoService } from '@/lib/firestore';

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
          <h1 className="text-lg font-semibold text-glass">TODO共有</h1>
        </div>
      </header>

      {/* 新規追加フォーム */}
      <div className="glass-card mx-4 mt-2 p-4 fade-in">
        <div className="space-y-4">
          {/* 作成者選択 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              作成者
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    selectedMember === member.id
                      ? 'bg-white bg-opacity-15 backdrop-blur-sm border-white border-opacity-40 scale-105 shadow-lg'
                      : 'bg-white bg-opacity-10 border-white border-opacity-30 hover:bg-opacity-20'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-4 h-4 rounded-full ${COLOR_MAP[member.color].bg} border-2 border-white shadow-lg`}
                    />
                    <span className="text-xs font-semibold text-white">{member.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TODO入力 */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-white focus:border-opacity-50 backdrop-blur-sm"
              placeholder="TODOを入力（例：牛乳を買う、掃除機をかける）"
              disabled={isSubmitting}
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim() || isSubmitting}
              className="glass-button p-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="glass-card mx-4 mt-2 px-4 py-3 fade-in">
        <div className="flex justify-center space-x-4">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'active', label: '未完了' },
            { key: 'completed', label: '完了済み' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as 'all' | 'active' | 'completed')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                filter === item.key
                  ? 'bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-20 text-white scale-105 shadow-lg'
                  : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* TODO一覧 */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        <div className="glass-card p-4 fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mb-4" />
              <p className="text-white text-opacity-80">読み込み中...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckSquare size={48} className="text-white text-opacity-40 mb-4" />
              <p className="text-white text-opacity-70 text-center">
                {filter === 'all' ? 'TODOがありません' : 
                 filter === 'active' ? '未完了のTODOがありません' : 
                 '完了済みのTODOがありません'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="glass-day p-4 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center">
                    {/* チェックボックス */}
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        todo.completed
                          ? 'bg-green-500 border-green-400 text-white shadow-lg'
                          : 'border-white border-opacity-50 hover:border-green-400 hover:bg-green-400 hover:bg-opacity-20'
                      }`}
                    >
                      {todo.completed && <Check size={16} />}
                    </button>

                    {/* TODOコンテンツ */}
                    <div className="flex-1 ml-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-semibold ${
                            todo.completed ? 'line-through text-white text-opacity-50' : 'text-white'
                          }`}
                        >
                          {todo.title}
                        </span>
                        {todo.priority === 'high' && (
                          <AlertCircle size={16} className="text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2 space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${COLOR_MAP[getMemberColor(todo.createdBy)].bg} border-2 border-white shadow-sm`}
                        />
                        <span className="text-xs text-white text-opacity-70">
                          {getMemberName(todo.createdBy)} • {todo.createdAt.toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex-shrink-0 p-2 text-white text-opacity-60 hover:text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-20" />
    </div>
  );
}
