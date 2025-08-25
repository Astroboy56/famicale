import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Event, TodoItem, PoiTask, PoiWish, PoiRecord } from '@/types';

// Firebase初期化チェック
const isFirebaseInitialized = () => {
  const initialized = db !== null && db !== undefined;
  if (!initialized) {
    console.error('Firebaseが初期化されていません。環境変数を確認してください。');
  }
  return initialized;
};

// コレクション参照
const EVENTS_COLLECTION = 'events';
const TODOS_COLLECTION = 'todos';
const POI_CHILDREN_COLLECTION = 'poi_children';

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
        Object.entries(event).filter(([_, value]) => value !== undefined)
      );

      console.log('Firestoreに保存するデータ:', cleanEvent);

      const docRef = await addDoc(collection(db!, EVENTS_COLLECTION), {
        ...cleanEvent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('予定追加が完了しました。ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('予定の追加に失敗しました:', error);
      throw error;
    }
  },

  // 特定の月の予定を取得
  async getEventsByMonth(year: number, month: number) {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      const q = query(
        collection(db!, EVENTS_COLLECTION),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
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
      
      return events;
    } catch (error) {
      console.error('予定の取得に失敗しました:', error);
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
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const eventRef = doc(db!, EVENTS_COLLECTION, eventId);
      await updateDoc(eventRef, {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
      });
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
      await deleteDoc(doc(db!, EVENTS_COLLECTION, eventId));
    } catch (error) {
      console.error('予定の削除に失敗しました:', error);
      throw error;
    }
  },

  // リアルタイムで予定を監視
  subscribeToEvents(year: number, month: number, callback: (events: Event[]) => void) {
    if (!isFirebaseInitialized()) {
      callback([]);
      return () => {};
    }
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const q = query(
      collection(db!, EVENTS_COLLECTION),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
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
      callback(events);
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
  if (!isFirebaseInitialized()) {
    console.error('❌ Firebaseが初期化されていません');
    return false;
  }
  
  try {
    // テスト用のドキュメントを作成して削除
    const testCollection = collection(db!, 'test');
    const docRef = await addDoc(testCollection, {
      test: true,
      timestamp: Timestamp.now(),
    });
    
    // 作成したテストドキュメントを削除
    await deleteDoc(docRef);
    
    console.log('✅ Firebase接続テスト成功');
    return true;
  } catch (error) {
    console.error('❌ Firebase接続テスト失敗:', error);
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
  // 子供のポイントを更新
  async updateChildPoints(childId: string, points: number) {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const childRef = doc(db!, POI_CHILDREN_COLLECTION, childId);
      await updateDoc(childRef, {
        totalPoints: points,
        updatedAt: Timestamp.now(),
      });
      console.log(`子供 ${childId} のポイントを ${points} に更新しました`);
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
      const children: any[] = [];
      
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
  subscribeToChildren(callback: (children: any[]) => void) {
    if (!isFirebaseInitialized()) {
      return () => {};
    }
    
    try {
      const q = query(
        collection(db!, POI_CHILDREN_COLLECTION),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const children: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          children.push({
            id: doc.id,
            name: data.name,
            totalPoints: data.totalPoints || 0,
          });
        });
        callback(children);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('子供の情報監視に失敗しました:', error);
      return () => {};
    }
  },
};
