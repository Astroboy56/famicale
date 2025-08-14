'use client';

import ConnectionTest from '@/components/Firebase/ConnectionTest';

export default function FirebaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Firebase設定テスト
          </h1>
          <p className="text-gray-600">
            Firebase設定が正しく行われているかテストします
          </p>
        </div>
        
        <ConnectionTest />

        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">設定手順</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">1. .env.localファイルの作成</h3>
              <p className="text-gray-600 mt-1">
                プロジェクトルート（famicaleフォルダ）に<code className="bg-gray-100 px-1 rounded">.env.local</code>ファイルを作成
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">2. Firebase設定値の追加</h3>
              <div className="bg-gray-100 p-3 rounded mt-2">
                <code className="text-xs block">
                  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key<br/>
                  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com<br/>
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id<br/>
                  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com<br/>
                  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id<br/>
                  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. 開発サーバーの再起動</h3>
              <p className="text-gray-600 mt-1">
                環境変数を変更した後は、開発サーバーを再起動してください
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800">⚠️ 重要な注意事項</h3>
            <ul className="text-yellow-700 text-sm mt-2 space-y-1">
              <li>• Firestoreのセキュリティルールを必ず設定してください</li>
              <li>• テストモードは開発用です。本番では適切な認証を設定してください</li>
              <li>• .env.localファイルはGitにコミットしないでください</li>
            </ul>
          </div>

          <div className="mt-4">
            <a 
              href="/firebase-setup.md" 
              className="text-blue-600 hover:text-blue-800 text-sm underline"
              target="_blank"
            >
              詳細な設定手順を確認 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
