// IndexedDB Database Manager
class DBManager {
  constructor() {
    this.dbName = 'PWADemoDB';
    this.version = 1;
    this.db = null;
  }

  // Open database connection
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('appData')) {
          const objectStore = db.createObjectStore('appData', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }

        console.log('Database setup complete');
      };
    });
  }

  // Save data to IndexedDB
  async saveData(storeName, data) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const dataWithTimestamp = {
        ...data,
        timestamp: new Date().toISOString()
      };

      const request = store.add(dataWithTimestamp);

      request.onsuccess = () => {
        console.log('Data saved:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save data');
        reject(request.error);
      };
    });
  }

  // Get all data from store
  async getAllData(storeName) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get single item by ID
  async getData(storeName, id) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Update data
  async updateData(storeName, data) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Delete data
  async deleteData(storeName, id) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Clear all data from store
  async clearStore(storeName) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Add to sync queue
  async addToSyncQueue(data) {
    return this.saveData('syncQueue', {
      text: data,
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  // Get pending sync items
  async getPendingSyncs() {
    return this.getAllData('syncQueue');
  }

  // Clear sync queue
  async clearSyncQueue() {
    return this.clearStore('syncQueue');
  }
}

// Create global instance
const dbManager = new DBManager();

// Initialize on load
dbManager.openDB().catch(console.error);
