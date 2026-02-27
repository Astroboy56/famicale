import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import app from './firebase';
import { Event, TodoItem, PoiTask, PoiWish, PoiRecord, Notification } from '@/types';
import { createEventAddedNotification, createEventUpdatedNotification, createTodoAddedNotification, createTodoUpdatedNotification, createPoiAddedNotification } from './notificationUtils';
// Google Calendar同期はAPIルート経由で実装予定

// Firebase初期化チェック
const isFirebaseInitialized = () => {
  console.log('🔍 Firebase初期化状態を確認中...');
  console.log('db:', db ? '初期化済み' : '未初期化');
  console.log('app:', app ? '初期化済み' : '未初期化');
  
  const initialized = db !== null && db !== undefined && app !== null && app !== undefined;
  if (!initialized) {
    console.warn('⚠️ Firebaseが初期化されていません');
    console.warn('環境変数の設定を確認してください');
    console.warn('アプリはオフラインモードで動作します');
    console.warn('db:', db);
    console.warn('app:', app);
  } else {
    console.log('✅ Firebaseが正常に初期化されています');
  }
  return initialized;
};

// コレクション参照
const EVENTS_COLLECTION = 'events';
const TODOS_COLLECTION = 'todos';
const POI_CHILDREN_COLLECTION = 'poi_children';
const NOTIFICATIONS_COLLECTION = 'notifications';

// 予定関連の関数
export const eventService = {
  // 予定を追加
  async addEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
    console.log('予定追加を開始:', event);
    
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      // undefinedフィールドを除去
      const cleanEvent = Object.fromEntries(
        Object.entries(event).filter(([, value]) => value !== undefined)
      );

      console.log('Firestoreに保存するデータ:', cleanEvent);

      const docRef = await addDoc(collection(db!, EVENTS_COLLECTION), {
        ...cleanEvent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('予定追加が完了しました。ID:', docRef.id);
      
      // Google Calendarに同期（APIルート経由）
      try {
        const createdEvent = {
          id: docRef.id,
          ...cleanEvent,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Event;
        
        // クライアントサイドでの同期は別途実装
        console.log('Google Calendar同期用イベント作成完了:', createdEvent);
      } catch (googleError) {
        console.warn('Google Calendar同期準備に失敗:', googleError);
      }
      
      // 通知を作成
      const createdEvent = {
        id: docRef.id,
        ...cleanEvent,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Event;
      await createEventAddedNotification(createdEvent, event.familyMemberId);
      
      return docRef.id;
    } catch (error) {
      console.error('予定の追加に失敗しました:', error);
      throw error;
    }
  },

  // 特定の月の予定を取得
  async getEventsByMonth(year: number, month: number) {
    console.log(`📅 ${year}年${month}月の予定を取得中...`);
    
    if (!isFirebaseInitialized()) {
      console.error('❌ Firebaseが初期化されていません。実際のデータを取得できません。');
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      console.log(`🔍 検索範囲: ${startDate} ～ ${endDate}`);
      
      const q = query(
        collection(db!, EVENTS_COLLECTION),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      console.log('📡 Firestoreにクエリを送信中...');
      const querySnapshot = await getDocs(q);
      console.log(`📊 取得したドキュメント数: ${querySnapshot.size}`);
      
      const events: Event[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event);
      });
      
      console.log(`✅ ${events.length}件の予定を取得しました`);
      return events;
    } catch (error) {
      console.error('❌ 予定の取得に失敗しました:', error);
      throw error;
    }
  },

  // 予定を更新
  async updateEvent(eventId: string, updates: Partial<Event>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      // undefinedフィールドを除去
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      );

      const eventRef = doc(db!, EVENTS_COLLECTION, eventId);
      
      // 既存のイベントを取得してGoogle Calendar IDを確認
      const eventDoc = await getDoc(eventRef);
      const existingEvent = eventDoc.data() as Event;
      
      await updateDoc(eventRef, {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
      });
      
      // Google Calendarに同期（APIルート経由）
      if (existingEvent?.googleCalendarId) {
        try {
          const updatedEvent = {
            ...existingEvent,
            ...updates,
            id: eventId,
            updatedAt: new Date(),
          } as Event;
          
          // クライアントサイドでの同期は別途実装
          console.log('Google Calendar同期用イベント更新完了:', updatedEvent);
        } catch (googleError) {
          console.warn('Google Calendar同期準備に失敗:', googleError);
        }
      }
      
      // 通知を作成
      const updatedEvent = {
        id: eventId,
        ...updates,
        updatedAt: new Date(),
      } as Event;
      await createEventUpdatedNotification(updatedEvent, updates.familyMemberId || 'unknown');
    } catch (error) {
      console.error('予定の更新に失敗しました:', error);
      throw error;
    }
  },

  // 予定を削除
  async deleteEvent(eventId: string) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      // 既存のイベントを取得してGoogle Calendar IDを確認
      const eventRef = doc(db!, EVENTS_COLLECTION, eventId);
      const eventDoc = await getDoc(eventRef);
      const existingEvent = eventDoc.data() as Event;
      
      await deleteDoc(eventRef);
      
      // Google Calendarから削除（APIルート経由）
      if (existingEvent?.googleCalendarId) {
        try {
          // クライアントサイドでの同期は別途実装
          console.log('Google Calendar同期用イベント削除完了:', existingEvent.googleCalendarId);
        } catch (googleError) {
          console.warn('Google Calendar同期準備に失敗:', googleError);
        }
      }
    } catch (error) {
      console.error('予定の削除に失敗しました:', error);
      throw error;
    }
  },

  // リアルタイムで予定を監視
  subscribeToEvents(year: number, month: number, callback: (events: Event[]) => void) {
    console.log(`📡 ${year}年${month}月のリアルタイム監視を開始...`);
    
    if (!isFirebaseInitialized()) {
      console.error('❌ Firebaseが初期化されていません。実際のデータを取得できません。');
      callback([]);
      return () => {};
    }
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    console.log(`🔍 監視範囲: ${startDate} ～ ${endDate}`);
    console.log(`🔍 使用するdb:`, db);
    console.log(`🔍 使用するコレクション:`, EVENTS_COLLECTION);
    
    const q = query(
      collection(db!, EVENTS_COLLECTION),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    console.log('📡 リアルタイムリスナーを設定中...');
    return onSnapshot(q, (querySnapshot) => {
      console.log(`📊 リアルタイム更新: ${querySnapshot.size}件のドキュメント`);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event);
      });
      console.log(`✅ ${events.length}件の予定をリアルタイム更新で取得`);
      callback(events);
    }, (error) => {
      console.error('❌ リアルタイム監視でエラーが発生:', error);
    });
  },
};

// TODO関連の関数
export const todoService = {
  // TODOを追加
  async addTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = await addDoc(collection(db!, TODOS_COLLECTION), {
        ...todo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      // 通知を作成
      const createdTodo = {
        id: docRef.id,
        ...todo,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TodoItem;
      await createTodoAddedNotification(createdTodo, todo.createdBy);
      
      return docRef.id;
    } catch (error) {
      console.error('TODOの追加に失敗しました:', error);
      throw error;
    }
  },

  // 全てのTODOを取得
  async getAllTodos() {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, TODOS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const todos: TodoItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todos.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as TodoItem);
      });
      
      return todos;
    } catch (error) {
      console.error('TODOの取得に失敗しました:', error);
      throw error;
    }
  },

  // TODOを更新
  async updateTodo(todoId: string, updates: Partial<TodoItem>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const todoRef = doc(db!, TODOS_COLLECTION, todoId);
      await updateDoc(todoRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      
      // 通知を作成
      const updatedTodo = {
        id: todoId,
        ...updates,
        updatedAt: new Date(),
      } as TodoItem;
      await createTodoUpdatedNotification(updatedTodo, updates.createdBy || 'unknown');
    } catch (error) {
      console.error('TODOの更新に失敗しました:', error);
      throw error;
    }
  },

  // TODOを削除
  async deleteTodo(todoId: string) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      await deleteDoc(doc(db!, TODOS_COLLECTION, todoId));
    } catch (error) {
      console.error('TODOの削除に失敗しました:', error);
      throw error;
    }
  },

  // TODOの完了状態を切り替え
  async toggleTodoComplete(todoId: string, completed: boolean) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const todoRef = doc(db!, TODOS_COLLECTION, todoId);
      await updateDoc(todoRef, {
        completed,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('TODOの状態更新に失敗しました:', error);
      throw error;
    }
  },

  // リアルタイムでTODOを監視
  subscribeToTodos(callback: (todos: TodoItem[]) => void) {
    if (!isFirebaseInitialized()) {
      callback([]);
      return () => {};
    }
    
    const q = query(
      collection(db!, TODOS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const todos: TodoItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todos.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as TodoItem);
      });
      callback(todos);
    });
  },
};

// 一括入力用の関数
export const bulkService = {
  // 一括で予定を追加
  async addBulkEvents(events: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[]) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const promises = events.map(event => 
        addDoc(collection(db!, EVENTS_COLLECTION), {
          ...event,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );
      
      const results = await Promise.all(promises);
      return results.map(doc => doc.id);
    } catch (error) {
      console.error('一括予定追加に失敗しました:', error);
      throw error;
    }
  },
};

// イベントを全削除
export const deleteAllEvents = async (): Promise<void> => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase is not initialized');
  }

  try {
    const eventsRef = collection(db!, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${querySnapshot.docs.length} events`);
  } catch (error) {
    console.error('Error deleting all events:', error);
    throw error;
  }
};

// TODOを全削除
export const deleteAllTodos = async (): Promise<void> => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase is not initialized');
  }

  try {
    const todosRef = collection(db!, 'todos');
    const querySnapshot = await getDocs(todosRef);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${querySnapshot.docs.length} todos`);
  } catch (error) {
    console.error('Error deleting all todos:', error);
    throw error;
  }
};

// 接続テスト用の関数
export const testFirebaseConnection = async () => {
  console.log('🔍 Firebase接続テスト開始...');
  console.log('📊 現在の状態:', {
    app: app ? '初期化済み' : '未初期化',
    db: db ? '初期化済み' : '未初期化',
    isInitialized: isFirebaseInitialized()
  });
  
  if (!isFirebaseInitialized()) {
    console.error('❌ Firebaseが初期化されていません');
    console.error('環境変数の設定を確認してください:');
    console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
    console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    console.error('- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
    console.error('- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
    console.error('- NEXT_PUBLIC_FIREBASE_APP_ID');
    return false;
  }
  
  try {
    console.log('📝 テストドキュメントを作成中...');
    console.log('📊 Firestore接続確認中...');
    console.log('🔍 使用するdb:', db);
    console.log('🔍 使用するapp:', app);
    
    // テスト用のドキュメントを作成して削除
    const testCollection = collection(db!, 'test');
    console.log('📝 テストコレクション参照作成完了');
    
    const docRef = await addDoc(testCollection, {
      test: true,
      timestamp: Timestamp.now(),
      message: 'Firebase接続テスト',
      createdAt: Timestamp.now(),
    });
    
    console.log('✅ テストドキュメント作成成功:', docRef.id);
    console.log('🗑️ テストドキュメントを削除中...');
    
    // 作成したテストドキュメントを削除
    await deleteDoc(docRef);
    
    console.log('✅ テストドキュメント削除成功');
    console.log('✅ Firebase接続テスト成功');
    return true;
  } catch (error) {
    console.error('❌ Firebase接続テスト失敗:', error);
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
      console.error('エラータイプ:', error.name);
      console.error('エラースタック:', error.stack);
    }
    return false;
  }
};

// ポイ活関連の関数
export const poiService = {
  // タスクを追加
  async addTask(task: Omit<PoiTask, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = await addDoc(collection(db!, 'poi_tasks'), {
        ...task,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('タスクの追加に失敗しました:', error);
      throw error;
    }
  },

  // 全てのタスクを取得
  async getAllTasks() {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, 'poi_tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: PoiTask[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as PoiTask);
      });
      
      return tasks;
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
      throw error;
    }
  },

  // 欲しいものを追加
  async addWish(wish: Omit<PoiWish, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = await addDoc(collection(db!, 'poi_wishes'), {
        ...wish,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('欲しいものの追加に失敗しました:', error);
      throw error;
    }
  },

  // 全ての欲しいものを取得
  async getAllWishes() {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, 'poi_wishes'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const wishes: PoiWish[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        wishes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as PoiWish);
      });
      
      return wishes;
    } catch (error) {
      console.error('欲しいものの取得に失敗しました:', error);
      throw error;
    }
  },

  // 記録を追加
  async addRecord(record: Omit<PoiRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = await addDoc(collection(db!, 'poi_records'), {
        ...record,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      // 通知を作成
      const createdRecord = {
        id: docRef.id,
        ...record,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PoiRecord;
      await createPoiAddedNotification(createdRecord, record.childId);
      
      return docRef.id;
    } catch (error) {
      console.error('記録の追加に失敗しました:', error);
      throw error;
    }
  },

  // 子供の記録を取得
  async getChildRecords(childId: string) {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, 'poi_records'),
        where('childId', '==', childId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: PoiRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as PoiRecord);
      });
      
      return records;
    } catch (error) {
      console.error('記録の取得に失敗しました:', error);
      throw error;
    }
  },
};

// ポイ活子供関連の関数
export const poiChildService = {
  // 子供のデータを初期化または更新
  async initializeOrUpdateChild(childId: string, name: string, points: number = 0) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const childRef = doc(db!, POI_CHILDREN_COLLECTION, childId);
      const childDoc = await getDoc(childRef);
      
      if (childDoc.exists()) {
        // 既存のデータを更新
        await updateDoc(childRef, {
          totalPoints: points,
          updatedAt: Timestamp.now(),
        });
        console.log(`子供 ${childId} のポイントを ${points} に更新しました`);
      } else {
        // 新しいデータを作成
        await setDoc(childRef, {
          id: childId,
          name: name,
          totalPoints: points,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`子供 ${childId} のデータを初期化しました（ポイント: ${points}）`);
      }
    } catch (error) {
      console.error('子供のデータ初期化/更新に失敗しました:', error);
      throw error;
    }
  },

  // 子供のポイントを更新
  async updateChildPoints(childId: string, points: number) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const childRef = doc(db!, POI_CHILDREN_COLLECTION, childId);
      const childDoc = await getDoc(childRef);
      
      if (childDoc.exists()) {
        // 既存のデータを更新
        await updateDoc(childRef, {
          totalPoints: points,
          updatedAt: Timestamp.now(),
        });
        console.log(`子供 ${childId} のポイントを ${points} に更新しました`);
      } else {
        // データが存在しない場合は初期化
        const childName = childId === 'alice' ? 'ありす' : childId === 'kosumo' ? 'こすも' : '子供';
        await this.initializeOrUpdateChild(childId, childName, points);
      }
    } catch (error) {
      console.error('ポイントの更新に失敗しました:', error);
      throw error;
    }
  },

  // 子供の情報を取得
  async getChild(childId: string) {
    if (!isFirebaseInitialized()) {
      return null;
    }
    
    try {
      const childRef = doc(db!, POI_CHILDREN_COLLECTION, childId);
      const childDoc = await getDoc(childRef);
      
      if (childDoc.exists()) {
        const data = childDoc.data();
        return {
          id: childDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('子供の情報取得に失敗しました:', error);
      throw error;
    }
  },

  // 全ての子供の情報を取得
  async getAllChildren() {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, POI_CHILDREN_COLLECTION),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const children: { id: string; name: string; totalPoints: number }[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        children.push({
          id: doc.id,
          name: data.name,
          totalPoints: data.totalPoints || 0,
        });
      });
      
      return children;
    } catch (error) {
      console.error('子供の情報取得に失敗しました:', error);
      throw error;
    }
  },

  // 子供の情報をリアルタイムで監視
  subscribeToChildren(callback: (children: { id: string; name: string; totalPoints: number }[]) => void) {
    console.log('👀 poiChildService.subscribeToChildren 開始');
    
    if (!isFirebaseInitialized()) {
      console.warn('⚠️ Firebaseが初期化されていないため、リアルタイム監視を開始できません');
      return () => {};
    }
    
    try {
      const q = query(
        collection(db!, POI_CHILDREN_COLLECTION),
        orderBy('createdAt', 'asc')
      );
      console.log('📡 Firestoreリアルタイム監視を開始');
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log(`📊 Firestoreから ${querySnapshot.size} 件の子供データを受信`);
        const children: { id: string; name: string; totalPoints: number }[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const child = {
            id: doc.id,
            name: data.name,
            totalPoints: data.totalPoints || 0,
          };
          children.push(child);
          console.log(`👶 子供データ: ${child.id} - ${child.name} - ${child.totalPoints}ポイント`);
        });
        console.log('🔄 コールバックを実行:', children);
        callback(children);
      }, (error) => {
        console.error('❌ Firestoreリアルタイム監視エラー:', error);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ 子供の情報監視に失敗しました:', error);
      return () => {};
    }
  },
};

// 通知関連の関数
export const notificationService = {
  // 通知を追加
  async addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = await addDoc(collection(db!, NOTIFICATIONS_COLLECTION), {
        ...notification,
        createdAt: Timestamp.now(),
      });
      console.log('通知を追加しました:', notification.title);
      return docRef.id;
    } catch (error) {
      console.error('通知の追加に失敗しました:', error);
      throw error;
    }
  },

  // 全ての通知を取得
  async getAllNotifications() {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, NOTIFICATIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Notification);
      });
      
      return notifications;
    } catch (error) {
      console.error('通知の取得に失敗しました:', error);
      throw error;
    }
  },

  // 未読通知を取得
  async getUnreadNotifications() {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db!, NOTIFICATIONS_COLLECTION),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Notification);
      });
      
      return notifications;
    } catch (error) {
      console.error('未読通知の取得に失敗しました:', error);
      throw error;
    }
  },

  // 通知を既読にする
  async markAsRead(notificationId: string) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const notificationRef = doc(db!, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
      });
      console.log('通知を既読にしました:', notificationId);
    } catch (error) {
      console.error('通知の既読化に失敗しました:', error);
      throw error;
    }
  },

  // 全ての通知を既読にする
  async markAllAsRead() {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const q = query(
        collection(db!, NOTIFICATIONS_COLLECTION),
        where('isRead', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );
      
      await Promise.all(updatePromises);
      console.log(`${querySnapshot.docs.length}件の通知を既読にしました`);
    } catch (error) {
      console.error('通知の一括既読化に失敗しました:', error);
      throw error;
    }
  },

  // 通知を削除
  async deleteNotification(notificationId: string) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      await deleteDoc(doc(db!, NOTIFICATIONS_COLLECTION, notificationId));
      console.log('通知を削除しました:', notificationId);
    } catch (error) {
      console.error('通知の削除に失敗しました:', error);
      throw error;
    }
  },

  // 古い通知を削除（30日以上前）
  async deleteOldNotifications() {
    if (!isFirebaseInitialized()) {
      return;
    }
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        collection(db!, NOTIFICATIONS_COLLECTION),
        where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      console.log(`${querySnapshot.docs.length}件の古い通知を削除しました`);
    } catch (error) {
      console.error('古い通知の削除に失敗しました:', error);
    }
  },

  // リアルタイムで通知を監視
  subscribeToNotifications(callback: (notifications: Notification[]) => void) {
    if (!isFirebaseInitialized()) {
      callback([]);
      return () => {};
    }
    
    try {
      const q = query(
        collection(db!, NOTIFICATIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Notification);
        });
        callback(notifications);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('通知の監視に失敗しました:', error);
      return () => {};
    }
  },

  // 未読通知をリアルタイムで監視
  subscribeToUnreadNotifications(callback: (notifications: Notification[]) => void) {
    if (!isFirebaseInitialized()) {
      callback([]);
      return () => {};
    }
    
    try {
      const q = query(
        collection(db!, NOTIFICATIONS_COLLECTION),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Notification);
        });
        callback(notifications);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('未読通知の監視に失敗しました:', error);
      return () => {};
    }
  },
};

