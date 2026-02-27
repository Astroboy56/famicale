# 環境変数設定手順

## Firebase設定

### 1. Firebaseプロジェクトの作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名に「famicale」または任意の名前を入力
4. Google Analyticsは必要に応じて設定（推奨：有効化）
5. プロジェクトを作成

### 2. ウェブアプリの登録
1. プロジェクトのダッシュボードで「ウェブ」アイコン（</>）をクリック
2. アプリのニックネームに「FamiCale」と入力
3. 「Firebase Hosting も設定する」はチェックしない（後で設定可能）
4. 「アプリを登録」をクリック

### 3. 設定情報の取得
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

### 4. 環境変数ファイルの作成
プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を設定：

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=取得したapiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=取得したauthDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=取得したprojectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=取得したstorageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=取得したmessagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=取得したappId
```

### 5. Firestoreデータベースの設定
1. Firebase Consoleの左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティ ルールで「テストモードで開始」を選択（開発用）
4. ロケーションは「asia-northeast1 (東京)」を選択
5. 「完了」をクリック

### 6. セキュリティルールの設定
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

## Vercelでの環境変数設定

### 1. Vercelプロジェクトの作成
1. [Vercel](https://vercel.com) にアクセス
2. GitHubでログイン
3. 「New Project」をクリック
4. GitHubリポジトリ `Astroboy56/famicale` を選択
5. プロジェクト設定：
   - Framework Preset: `Next.js`
   - Root Directory: `famicale`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. 環境変数の設定
Vercelプロジェクトの設定で、以下の環境変数を追加：

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. デプロイ
環境変数を設定後、「Deploy」をクリックしてデプロイを実行。

## 動作確認

### ローカル環境
```bash
npm run dev
```

### 接続テスト
ブラウザで http://localhost:3000/firebase-test にアクセスして、Firebase接続テストを実行。

### デバッグ情報の確認
ブラウザの開発者ツール（F12）のコンソールで以下の情報を確認：
- Firebase設定の確認状況
- 環境変数の設定状況
- データ読み込みの詳細ログ
- エラーメッセージ

### 開発用ダミーデータ
Firebase設定が完了していない場合、アプリは開発用のダミーデータを表示します。
これにより、UIの動作確認が可能です。

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

## 注意事項

- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません
- 本番環境では適切な認証とアクセス制御を実装してください
- 環境変数は機密情報なので、公開リポジトリにコミットしないでください
