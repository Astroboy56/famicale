# Firestoreセキュリティルール設定ガイド

## メモ機能のためのFirestoreセキュリティルール

メモ機能が正常に動作するためには、Firestoreセキュリティルールで`memos`コレクションへのアクセスを許可する必要があります。

### 現在のルール設定

Firebase Consoleで以下のルールを設定してください：

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

### 設定手順

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - プロジェクト「famicale-289f3」を選択

2. **Firestore Databaseに移動**
   - 左メニューから「Firestore Database」を選択

3. **ルールタブを選択**
   - 「ルール」タブをクリック

4. **ルールを更新**
   - 上記のルールをコピー&ペースト
   - 「公開」ボタンをクリック

### 注意事項

- このルールは開発用の設定です
- 本番環境では適切な認証とセキュリティを設定してください
- `allow read, write: if true;`は全てのユーザーに読み書きを許可します

### トラブルシューティング

メモが追加されない場合：

1. **ブラウザのコンソールを確認**
   - F12キーを押して開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

2. **Firebase接続を確認**
   - 環境変数が正しく設定されているか確認
   - `.env.local`ファイルの内容を確認

3. **Firestoreルールを確認**
   - 上記のルールが正しく設定されているか確認
   - ルールの公開が完了しているか確認
