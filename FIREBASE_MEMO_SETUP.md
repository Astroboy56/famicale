# メモ機能のFirebase連携設定ガイド

## 概要
メモ機能を正常に動作させるために必要なFirebase設定手順を説明します。

## 1. 環境変数の設定

### 1.1 .env.localファイルの作成

`famicale`ディレクトリに`.env.local`ファイルを作成し、以下の内容を追加してください：

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBf7ucMqY6cfKbYHt5ffEnm9Wvg79PVQ6k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=famicale-289f3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=famicale-289f3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=famicale-289f3.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=482267342056
NEXT_PUBLIC_FIREBASE_APP_ID=1:482267342056:web:c96b6d0c6f2d0d62ad155d

# 天気予報API設定
NEXT_PUBLIC_WEATHERAPI_KEY=5c8293a524e84e5aa8a152004252908

# Google Calendar API設定（オプション）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 1.2 ファイル作成手順

1. **エクスプローラーで`famicale`フォルダを開く**
2. **新しいテキストファイルを作成**
3. **ファイル名を`.env.local`に変更**（拡張子を含む）
4. **上記の内容をコピー&ペースト**
5. **ファイルを保存**

## 2. Firestoreセキュリティルールの設定

### 2.1 Firebase Consoleにアクセス

1. **https://console.firebase.google.com/ にアクセス**
2. **プロジェクト「famicale-289f3」を選択**

### 2.2 Firestore Databaseの設定

1. **左メニューから「Firestore Database」を選択**
2. **「ルール」タブをクリック**
3. **以下のルールをコピー&ペースト**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 既存のルール
    match /events/{document=**} {
      allow read, write: if true;
    }
    
    match /todos/{document=**} {
      allow read, write: if true;
    }
    
    match /poi_children/{document=**} {
      allow read, write: if true;
    }
    
    match /poi_tasks/{document=**} {
      allow read, write: if true;
    }
    
    match /poi_wishes/{document=**} {
      allow read, write: if true;
    }
    
    match /poi_records/{document=**} {
      allow read, write: if true;
    }
    
    match /notifications/{document=**} {
      allow read, write: if true;
    }
    
    // メモ機能のためのルール（追加）
    match /memos/{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. **「公開」ボタンをクリック**

## 3. 開発サーバーの起動

### 3.1 正しいディレクトリに移動

```bash
cd famicale
```

### 3.2 開発サーバーを起動

```bash
npm run dev
```

## 4. 動作確認

### 4.1 ブラウザでアクセス

1. **http://localhost:3000 にアクセス**
2. **ナビゲーションの2ページ目に移動**
3. **「メモ」ボタンをクリック**

### 4.2 メモ機能のテスト

1. **家族メンバーのボタンをクリック**
2. **タイトルと内容を入力**
3. **優先度を選択**
4. **期限を設定（任意）**
5. **「追加」ボタンをクリック**

## 5. トラブルシューティング

### 5.1 メモが追加されない場合

1. **ブラウザのコンソールを確認**（F12キー）
   - エラーメッセージを確認
   - デバッグログを確認

2. **Firebase接続を確認**
   - `.env.local`ファイルが正しく作成されているか
   - 環境変数が正しく設定されているか

3. **Firestoreルールを確認**
   - `memos`コレクションへのアクセスが許可されているか
   - ルールが正しく公開されているか

### 5.2 文字が見えない場合

- フォーム入力の文字色を黒色に修正済み
- 背景色の透明度を調整済み

### 5.3 よくあるエラー

**エラー: "Firebase is not initialized"**
- `.env.local`ファイルが正しく作成されていない
- 環境変数が正しく設定されていない

**エラー: "Permission denied"**
- Firestoreセキュリティルールが正しく設定されていない
- `memos`コレクションへのアクセスが許可されていない

## 6. 本番環境（Vercel）での設定

### 6.1 Vercel環境変数の設定

1. **Vercelダッシュボードにアクセス**
2. **プロジェクトを選択**
3. **「Settings」→「Environment Variables」**
4. **上記の環境変数をすべて追加**

### 6.2 注意事項

- 本番環境では適切なセキュリティ設定を行ってください
- 現在のルールは開発用の設定です
- 本番環境では認証機能を追加することを推奨します

## 7. 完了確認

設定が完了すると、以下の機能が使用できます：

- ✅ 家族メンバーごとのメモ追加
- ✅ ドラッグ&ドロップでの順序変更
- ✅ 優先度の設定と変更
- ✅ 期限の設定
- ✅ 完了状態の管理
- ✅ リアルタイム同期
- ✅ メモの削除

これでメモ機能が完全に動作するはずです！
