import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { HealthMetric, SyncStatus } from './types';

const COLLECTION_NAME = 'celeste_health_data';
const LOCAL_STORAGE_KEY = 'celeste_dashboard_data';
const SYNC_STATUS_KEY = 'celeste_sync_status';

export class DataSyncManager {
  private syncStatus: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
    lastSync: null,
    hasPendingChanges: false,
    conflictResolution: 'server-wins'
  };

  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.initializeSync();
    this.setupOnlineListener();
  }

  // Subscribe to sync status changes
  onSyncStatusChange(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback);
    callback(this.syncStatus);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.syncStatus));
  }

  private setupOnlineListener() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.syncToCloud();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  private initializeSync() {
    if (typeof window === 'undefined') return;
    
    const savedStatus = localStorage.getItem(SYNC_STATUS_KEY);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        this.syncStatus = { ...this.syncStatus, ...parsed };
      } catch (e) {
        console.error("Error parsing sync status from localStorage", e);
      }
    }

    if (this.syncStatus.isOnline) {
      this.syncToCloud();
    }
  }

  // Save data locally
  async saveLocal(data: HealthMetric): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const existingData = this.getLocalData();
      const updatedData = [...existingData, { ...data, id: Date.now().toString() }];
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
      
      this.syncStatus.hasPendingChanges = true;
      this.saveSyncStatus();
      this.notifyListeners();

      if (this.syncStatus.isOnline) {
        await this.syncToCloud();
      }
    } catch (error) {
      console.error('Error saving data locally:', error);
      throw error;
    }
  }

  // Get local data
  getLocalData(): HealthMetric[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
        return [];
      }
      
      const parsedData: any[] = JSON.parse(data);

      // ¡OPTIMIZACIÓN APLICADA!
      // Se convierten las fechas que vienen como string desde localStorage
      // a objetos Date. Esto resuelve el error "Invalid time value".
      return parsedData.map(item => ({
        ...item,
        date: new Date(item.date),
        lastModified: item.lastModified ? new Date(item.lastModified) : undefined,
      }));

    } catch (error) {
      console.error('Error reading local data:', error);
      return [];
    }
  }

  // Sync to cloud
  async syncToCloud(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      return;
    }

    try {
      const localData = this.getLocalData();
      const pendingData = localData.filter(item => !item.synced);

      for (const item of pendingData) {
        // Asegurarse de que el ID es un string válido para Firestore
        const docId = String(item.id || Date.now());
        const docRef = doc(db, COLLECTION_NAME, docId);
        await setDoc(docRef, {
          ...item,
          id: docId, // Asegura que el ID esté en el documento
          synced: true,
          lastModified: serverTimestamp()
        });
      }

      if (typeof window !== 'undefined') {
        const updatedData = localData.map(item => ({ ...item, synced: true }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
      }

      this.syncStatus.lastSync = new Date();
      this.syncStatus.hasPendingChanges = false;
      this.saveSyncStatus();
      this.notifyListeners();

    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw error;
    }
  }

  // Sync from cloud
  async syncFromCloud(): Promise<HealthMetric[]> {
    if (!this.syncStatus.isOnline) {
      return this.getLocalData();
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('lastModified', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const cloudData: HealthMetric[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cloudData.push({
          ...data,
          id: doc.id,
          date: data.date?.toDate?.() || new Date(data.date),
          lastModified: data.lastModified?.toDate?.() || new Date(data.lastModified)
        } as HealthMetric);
      });

      const mergedData = this.mergeData(this.getLocalData(), cloudData);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
      }

      this.syncStatus.lastSync = new Date();
      this.syncStatus.hasPendingChanges = false;
      this.saveSyncStatus();
      this.notifyListeners();

      return mergedData;
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      return this.getLocalData();
    }
  }

  // Merge local and cloud data
  private mergeData(localData: HealthMetric[], cloudData: HealthMetric[]): HealthMetric[] {
    const merged = new Map<string, HealthMetric>();

    localData.forEach(item => {
      merged.set(item.id, { ...item, date: new Date(item.date) });
    });

    cloudData.forEach(cloudItem => {
      const localItem = merged.get(cloudItem.id);
      if (!localItem || (cloudItem.lastModified && localItem.lastModified && new Date(cloudItem.lastModified) > new Date(localItem.lastModified))) {
        merged.set(cloudItem.id, { ...cloudItem, date: new Date(cloudItem.date) });
      }
    });

    return Array.from(merged.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Real-time listener
  subscribeToCloudUpdates(callback: (data: HealthMetric[]) => void) {
    if (!this.syncStatus.isOnline) {
      callback(this.getLocalData());
      return () => {};
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('lastModified', 'desc'),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const cloudData: HealthMetric[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        cloudData.push({
          ...docData,
          id: doc.id,
          date: docData.date?.toDate?.() || new Date(docData.date),
          lastModified: docData.lastModified?.toDate?.() || new Date(docData.lastModified)
        } as HealthMetric);
      });

      const mergedData = this.mergeData(this.getLocalData(), cloudData);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
      }
      
      callback(mergedData);
    }, (error) => {
      console.error("Error subscribing to cloud updates:", error);
      // En caso de error, devuelve los datos locales para mantener la app funcional.
      callback(this.getLocalData());
    });
  }

  // ... [El resto de las funciones como exportData, importData, etc. se mantienen igual]
  
  // Export data
  exportData(): string {
    const data = this.getLocalData();
    return JSON.stringify(data, null, 2);
  }

  // Import data
  async importData(jsonData: string): Promise<void> {
    try {
      const importedData: HealthMetric[] = JSON.parse(jsonData);
      
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid data format');
      }

      const existingData = this.getLocalData();
      const mergedData = [...existingData, ...importedData.map(item => ({
        ...item,
        id: `imported_${Date.now()}_${Math.random()}`,
        synced: false
      }))];

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
      }
      
      this.syncStatus.hasPendingChanges = true;
      this.saveSyncStatus();
      this.notifyListeners();

      if (this.syncStatus.isOnline) {
        await this.syncToCloud();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  private saveSyncStatus() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
}

export const dataSyncManager = new DataSyncManager();