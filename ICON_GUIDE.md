# FamiCale PWAアイコン作成ガイド

## 🎨 アイコンの要件

### サイズ要件
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### デザイン推奨事項
- 📅 カレンダーをベースにしたデザイン
- 👨‍👩‍👧‍👦 家族を表すアイコン（4人）
- 🎨 青系のメインカラー（#3b82f6）
- 📱 iOS/Androidの丸角対応

## 🛠️ アイコン作成方法

### オプション1: オンラインツール
1. [Canva](https://www.canva.com/) - アプリアイコンテンプレート
2. [Figma](https://www.figma.com/) - 無料デザインツール
3. [PWA Builder](https://www.pwabuilder.com/imageGenerator) - PWA専用

### オプション2: アイコンジェネレーター
1. [App Icon Generator](https://appicon.co/)
2. [Real Favicon Generator](https://realfavicongenerator.net/)

## 📋 現在の設定

```json
// manifest.json
"icons": [
  { "src": "/icon-72.png", "sizes": "72x72", "type": "image/png" },
  { "src": "/icon-96.png", "sizes": "96x96", "type": "image/png" },
  { "src": "/icon-128.png", "sizes": "128x128", "type": "image/png" },
  { "src": "/icon-144.png", "sizes": "144x144", "type": "image/png" },
  { "src": "/icon-152.png", "sizes": "152x152", "type": "image/png" },
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-384.png", "sizes": "384x384", "type": "image/png" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

## 🚀 簡単なアイコン更新手順

1. 512x512のマスターアイコンを作成
2. リサイズツールで各サイズに変換
3. `/public/`フォルダ内のファイルを置き換え
4. 開発サーバーを再起動

## 💡 デザインアイデア

- カレンダーグリッド + 家族シルエット
- 数字「4」+ カレンダー
- ハート + カレンダー（家族愛）
- 家のアイコン + カレンダー
