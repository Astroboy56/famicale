# Firebase設定手順

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名に「famicale」または任意の名前を入力
4. Google Analyticsは必要に応じて設定（推奨：有効化）
5. プロジェクトを作成

## 2. ウェブアプリの登録

1. プロジェクトのダッシュボードで「ウェブ」アイコン（</>）をクリック
2. アプリのニックネームに「FamiCale」と入力
3. 「Firebase Hosting も設定する」はチェックしない（後で設定可能）
4. 「アプリを登録」をクリック

## 3. 設定情報の取得

表示される設定情報から以下の値をコピー：

```javascript
const firebaseConfig = {
  apiKey: "取得した値",
  authDomain: "取得した値",
  projectId: "取得した値", 
  storageBucket: "取得した値",
  messagingSenderId: "取得した値",
  appId: "取得した値"
};
```

## 4. 環境変数の設定

1. `.env.example`をコピーして`.env.local`ファイルを作成
2. 取得した値を設定：

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=取得したapiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=取得したauthDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=取得したprojectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=取得したstorageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=取得したmessagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=取得したappId
```

## 5. Firestoreデータベースの設定

1. Firebase Consoleの左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティ ルールで「テストモードで開始」を選択（開発用）
4. ロケーションは「asia-northeast1 (東京)」を選択
5. 「完了」をクリック

## 6. セキュリティルールの設定（重要）

Firestoreの「ルール」タブで以下のルールを設定：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 予定データ
    match /events/{document} {
      allow read, write: if true; // 開発中は全許可、本番では認証ルール追加
    }
    
    // TODOデータ  
    match /todos/{document} {
      allow read, write: if true; // 開発中は全許可、本番では認証ルール追加
    }
    
    // 一括入力パターン
    match /bulk_patterns/{document} {
      allow read, write: if true; // 開発中は全許可、本番では認証ルール追加
    }
  }
}
```

**⚠️ 注意: これは開発用の設定です。本番環境では適切な認証とアクセス制御を実装してください。**

## 7. 接続テストの実行

設定完了後、以下のコマンドで動作確認：

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスして、エラーがないことを確認。

## トラブルシューティング

### よくあるエラー

1. **「Firebase configuration object is invalid」**
   - `.env.local`の値が正しく設定されているか確認
   - 開発サーバーを再起動（Ctrl+C → npm run dev）

2. **「Missing or insufficient permissions」**
   - Firestoreのセキュリティルールを確認
   - 上記のテスト用ルールが設定されているか確認

3. **「Network error」**
   - インターネット接続を確認
   - ファイアウォール設定を確認

## 次のステップ

設定完了後、以下の機能を実装できます：

- 予定の Firestore への保存・読み込み
- TODOのリアルタイム同期
- 家族間でのデータ共有
- オフライン対応

設定でご不明な点があれば、お気軽にお声がけください！
