# Vercel デプロイ手順

## 前提

- Node.js がインストールされていること
- Firebase の環境変数がローカルで動作確認済みであること（`.env.local` 参照）

## 方法1: Vercel CLI でデプロイ

### 1. ログイン

```bash
cd famicale
npx vercel login
```

表示に従い、メールアドレスまたは GitHub でログインしてください。

### 2. プレビューデプロイ

```bash
npx vercel
```

初回はプロジェクト名や設定の質問に答えます。完了するとプレビュー用の URL が表示されます。

### 3. 本番デプロイ

```bash
npx vercel --prod
```

本番用の URL が発行されます。

### 4. 環境変数の設定（必須）

Firebase を使うため、Vercel のダッシュボードで環境変数を設定してください。

1. [Vercel Dashboard](https://vercel.com/dashboard) を開く
2. 対象プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下の変数を追加（値は `.env.local` または Firebase Console から取得）:

| 名前 | 説明 |
|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |

5. **Save** 後、**Deployments** から「Redeploy」で再デプロイすると環境変数が反映されます。

---

## 方法2: GitHub 連携でデプロイ

### 1. リポジトリを GitHub にプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 2. Vercel でプロジェクトをインポート

1. [Vercel](https://vercel.com) にログイン
2. **Add New** → **Project**
3. 対象の GitHub リポジトリを選択
4. **Root Directory** を **`famicale`** に設定（プロジェクトルートが `FamiCale` でアプリが `famicale` フォルダ内の場合）
5. **Environment Variables** に上記の Firebase 環境変数を追加
6. **Deploy** をクリック

以降、`main` ブランチへのプッシュで自動的に本番デプロイされます。

---

## 注意事項

- **Root Directory**: リポジトリのルートが `FamiCale` で、Next.js アプリが `famicale` フォルダ内の場合は、Vercel の「Root Directory」で **`famicale`** を指定してください。
- **Google Calendar 連携** を使う場合は、`NEXT_PUBLIC_GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`NEXT_PUBLIC_GOOGLE_REDIRECT_URI` も Vercel の環境変数に追加し、リダイレクト URI に `https://<あなたのドメイン>/api/auth/callback/google` を登録してください。

---

## 携帯で試す方法

### 方法A: Vercel の URL で開く（おすすめ）

1. 上記の手順で Vercel にデプロイする。
2. 本番 URL（例: `https://famicale-xxx.vercel.app`）をメモする。
3. **携帯のブラウザ**（Safari / Chrome など）でその URL を開く。

同じ Wi‑Fi でなくても、どこからでもアクセスできます。

---

### 方法B: 同じ Wi‑Fi で PC の開発サーバーにアクセスする

PC で開発サーバーを「携帯からアクセス可能」な形で起動し、携帯から同じ Wi‑Fi 経由で開く方法です。

#### 1. PC でサーバーを起動

```bash
cd famicale
npm run dev:mobile
```

起動後、ターミナルに **Local** のアドレスが表示されます（例: `http://0.0.0.0:3000`）。

#### 2. PC の IP アドレスを確認する

- **Windows**: コマンドプロンプトで `ipconfig` → 「IPv4 アドレス」を確認（例: `192.168.1.10`）
- **Mac**: システム設定 → ネットワーク、またはターミナルで `ifconfig` の `inet`（例: `192.168.1.10`）

#### 3. 携帯で開く

1. 携帯を **PC と同じ Wi‑Fi** に接続する。
2. 携帯のブラウザで次の URL を入力する:  
   **`http://<PCのIPアドレス>:3000`**  
   例: `http://192.168.1.10:3000`

#### 注意

- ファイアウォールでポート 3000 が許可されている必要があります（ブロックされたら Windows の「許可」設定を確認）。
- PC のスリープや電源オフでは携帯からつながらなくなります。
- 外から（別のネットワークから）試したい場合は、方法A（Vercel）を使うのが確実です。
