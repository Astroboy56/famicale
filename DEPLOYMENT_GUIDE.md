# 📱 FamiCale Vercelデプロイガイド

## 🚀 Vercelデプロイ手順

### 1️⃣ 事前準備

#### A. Vercelアカウント作成
- [Vercel公式サイト](https://vercel.com/) にアクセス
- GitHubアカウントでサインアップ（推奨）

#### B. GitHubリポジトリ作成
- GitHub上で新しいリポジトリを作成
- リポジトリ名: `famicale` または任意の名前

### 2️⃣ プロジェクトのGit管理

```bash
# プロジェクトディレクトリで実行
git init
git add .
git commit -m "Initial commit: FamiCale完成版"
git branch -M main
git remote add origin https://github.com/[ユーザー名]/[リポジトリ名].git
git push -u origin main
```

### 3️⃣ Vercelデプロイ

#### A. Vercel CLI使用（推奨）
```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ実行
vercel

# 初回設定
# - Link to existing project? N
# - Project name: famicale
# - Directory: ./
```

#### B. GitHub連携（Web UI）
1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Deploy」をクリック

### 4️⃣ 環境変数設定

Vercel Dashboard > Project Settings > Environment Variables で以下を設定：

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBf7ucMqY6cfKbYHt5ffEnm9Wvg79PVQ6k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=famicale-289f3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=famicale-289f3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=famicale-289f3.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=482267342056
NEXT_PUBLIC_FIREBASE_APP_ID=1:482267342056:web:c96b6d0c6f2d0d62ad155d
```

### 5️⃣ スマートフォンテスト

デプロイ完了後、自動生成されるURLでアクセス：
- 例: `https://famicale-xxx.vercel.app`

## 📱 テスト項目

- [ ] カレンダー表示
- [ ] 予定追加・編集
- [ ] ドラッグ&ドロップ
- [ ] リストビュー
- [ ] TODO機能
- [ ] PWA機能

## 🔧 トラブルシューティング

### ビルドエラー
- TypeScriptエラー → `npm run build`で事前確認
- 環境変数未設定 → Vercel Dashboardで再確認

### 機能エラー
- Firebase接続 → 環境変数が正しく設定されているか確認
- PWA → manifest.jsonとアイコンファイルの確認

## 📞 サポート

問題が発生した場合は、エラーメッセージと共にお知らせください。
