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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <CheckSquare size={20} className="text-green-600 mr-2" />
          <h1 className="text-lg font-semibold">TODO共有</h1>
        </div>
      </header>

      {/* 新規追加フォーム */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="space-y-3">
          {/* 作成者選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作成者
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FAMILY_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    selectedMember === member.id
                      ? `${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} ${COLOR_MAP[member.color].text}`
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-3 h-3 rounded-full ${COLOR_MAP[member.color].bg} ${COLOR_MAP[member.color].border} border`}
                    />
                    <span className="text-xs font-medium">{member.name}</span>
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="TODOを入力（例：牛乳を買う、掃除機をかける）"
              disabled={isSubmitting}
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim() || isSubmitting}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'active', label: '未完了' },
            { key: 'completed', label: '完了済み' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as 'all' | 'active' | 'completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* TODO一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckSquare size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                {filter === 'all' ? 'TODOがありません' : 
                 filter === 'active' ? '未完了のTODOがありません' : 
                 '完了済みのTODOがありません'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* チェックボックス */}
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {todo.completed && <Check size={16} />}
                  </button>

                  {/* TODOコンテンツ */}
                  <div className="flex-1 ml-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {todo.title}
                      </span>
                      {todo.priority === 'high' && (
                        <AlertCircle size={16} className="text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center mt-1 space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${COLOR_MAP[getMemberColor(todo.createdBy)].bg} ${COLOR_MAP[getMemberColor(todo.createdBy)].border} border`}
                      />
                      <span className="text-xs text-gray-500">
                        {getMemberName(todo.createdBy)} • {todo.createdAt.toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペース */}
      <div className="h-16 bg-transparent" />
    </div>
  );
}
