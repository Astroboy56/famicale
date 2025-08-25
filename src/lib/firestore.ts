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
import { Event, TodoItem } from '@/types';

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
