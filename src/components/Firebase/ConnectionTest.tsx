'use client';

import { useState } from 'react';
import { testFirebaseConnection } from '@/lib/firestore';

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string>('');

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    setError('');

    try {
      const success = await testFirebaseConnection();
      setResult(success ? 'success' : 'error');
      if (!success) {
        setError('接続テストに失敗しました');
      }
    } catch (err) {
      setResult('error');
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Firebase接続テスト</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleTest}
          disabled={testing}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? '接続テスト中...' : 'Firebase接続をテスト'}
        </button>

        {result === 'success' && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Firebase接続成功！
            </p>
          </div>
        )}

        {result === 'error' && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm">
              ❌ Firebase接続失敗
            </p>
            {error && (
              <p className="text-red-600 text-xs mt-1">
                エラー: {error}
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>このテストは以下を確認します：</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Firebase設定の正確性</li>
            <li>Firestoreへの書き込み権限</li>
            <li>ネットワーク接続</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
