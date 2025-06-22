
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
  serverTimestamp,
  Timestamp
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
    callback(this.syncStatus); // Call immediately with current status
    
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
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Load sync status from localStorage
    const savedStatus = localStorage.getItem(SYNC_STATUS_KEY);
    if (savedStatus) {
      const parsed = JSON.parse(savedStatus);
      this.syncStatus = { ...this.syncStatus, ...parsed };
    }

    // Auto-sync if online
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

      // Try to sync to cloud if online
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
      return data ? JSON.parse(data) : [];
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
        const docRef = doc(db, COLLECTION_NAME, item.id);
        await setDoc(docRef, {
          ...item,
          synced: true,
          lastModified: serverTimestamp()
        });
      }

      // Update local data to mark as synced
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
          date: data.date?.toDate?.() || data.date,
          lastModified: data.lastModified?.toDate?.() || data.lastModified
        } as HealthMetric);
      });

      // Merge with local data (conflict resolution)
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

  // Merge local and cloud data with conflict resolution
  private mergeData(localData: HealthMetric[], cloudData: HealthMetric[]): HealthMetric[] {
    const merged = new Map<string, HealthMetric>();

    // Add local data first
    localData.forEach(item => {
      merged.set(item.id, item);
    });

    // Add/update with cloud data based on conflict resolution strategy
    cloudData.forEach(cloudItem => {
      const localItem = merged.get(cloudItem.id);
      
      if (!localItem) {
        // New item from cloud
        merged.set(cloudItem.id, cloudItem);
      } else {
        // Conflict resolution
        if (this.syncStatus.conflictResolution === 'server-wins') {
          merged.set(cloudItem.id, cloudItem);
        } else if (this.syncStatus.conflictResolution === 'client-wins') {
          // Keep local version
        } else if (this.syncStatus.conflictResolution === 'latest-wins') {
          const cloudTime = cloudItem.lastModified?.getTime() || 0;
          const localTime = localItem.lastModified?.getTime() || 0;
          
          if (cloudTime > localTime) {
            merged.set(cloudItem.id, cloudItem);
          }
        }
      }
    });

    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Real-time listener for cloud updates
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
      const data: HealthMetric[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          ...docData,
          id: doc.id,
          date: docData.date?.toDate?.() || docData.date,
          lastModified: docData.lastModified?.toDate?.() || docData.lastModified
        } as HealthMetric);
      });

      // Update local cache
      const mergedData = this.mergeData(this.getLocalData(), data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
      }
      
      callback(mergedData);
    });
  }

  // Export data
  exportData(): string {
    const data = this.getLocalData();
    return JSON.stringify(data, null, 2);
  }

  // Import data
  async importData(jsonData: string): Promise<void> {
    try {
      const importedData: HealthMetric[] = JSON.parse(jsonData);
      
      // Validate data structure
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid data format');
      }

      // Add imported data to existing data
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

      // Sync to cloud if online
      if (this.syncStatus.isOnline) {
        await this.syncToCloud();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Backup data to cloud
  async createBackup(): Promise<string> {
    try {
      const data = this.getLocalData();
      const backupId = `backup_${Date.now()}`;
      
      const backupDoc = doc(db, 'backups', backupId);
      await setDoc(backupDoc, {
        data,
        timestamp: serverTimestamp(),
        version: '1.0'
      });

      return backupId;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId: string): Promise<void> {
    try {
      const backupDoc = doc(db, 'backups', backupId);
      const docSnap = await getDoc(backupDoc);
      
      if (docSnap.exists()) {
        const backup = docSnap.data();
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backup.data));
        }
        
        this.syncStatus.hasPendingChanges = false;
        this.syncStatus.lastSync = new Date();
        this.saveSyncStatus();
        this.notifyListeners();
      } else {
        throw new Error('Backup not found');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  private saveSyncStatus() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Update conflict resolution strategy
  setConflictResolution(strategy: 'server-wins' | 'client-wins' | 'latest-wins') {
    this.syncStatus.conflictResolution = strategy;
    this.saveSyncStatus();
    this.notifyListeners();
  }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager();
