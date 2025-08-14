import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.storageBucket && 
         firebaseConfig.messagingSenderId && 
         firebaseConfig.appId;
};

// Firebase初期化（環境変数が設定されている場合のみ）
let app: any = null;
let db: any = null;
let auth: any = null;
let analytics: any = null;

if (isFirebaseConfigValid()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// エクスポート
export { db, auth, analytics };
export default app;
