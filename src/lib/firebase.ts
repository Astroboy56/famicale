import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase設定の検証
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 環境変数の存在確認
const isFirebaseConfigValid = () => {
  console.log('🔍 Firebase設定を確認中...');
  console.log('環境変数の値:', {
    apiKey: firebaseConfig.apiKey ? '設定済み' : '未設定',
    authDomain: firebaseConfig.authDomain ? '設定済み' : '未設定',
    projectId: firebaseConfig.projectId ? '設定済み' : '未設定',
    storageBucket: firebaseConfig.storageBucket ? '設定済み' : '未設定',
    messagingSenderId: firebaseConfig.messagingSenderId ? '設定済み' : '未設定',
    appId: firebaseConfig.appId ? '設定済み' : '未設定',
  });
  
  const isValid = firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.storageBucket && 
         firebaseConfig.messagingSenderId && 
         firebaseConfig.appId;
  
  if (!isValid) {
    console.error('❌ Firebase設定が不完全です');
    console.error('以下の環境変数を設定してください:');
    console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
    console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    console.error('- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
    console.error('- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
    console.error('- NEXT_PUBLIC_FIREBASE_APP_ID');
  } else {
    console.log('✅ Firebase設定が有効です');
  }
  
  return isValid;
};

// Firebase初期化（環境変数が設定されている場合のみ）
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigValid()) {
  try {
    console.log('Firebase初期化を開始します...');
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
    console.log('Firebase初期化が完了しました');
  } catch (error) {
    console.error('Firebase初期化に失敗しました:', error);
  }
} else {
  console.warn('Firebase設定が無効です。.env.localファイルを確認してください。');
  console.warn('アプリはオフラインモードで動作します。');
}

// エクスポート
export { db, auth, analytics };
export default app;
