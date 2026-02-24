import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'albadel-offline';
const DB_VERSION = 1;

export interface OfflineOrder {
  offlineId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  variantId: string;
  totalCents: number;
  paidAmount: number;
  paymentMethod: string;
  createdAt: string | Date;
  [key: string]: any; // Catch-all for other fields
}

class OfflineManager {
  private dbInstance: Promise<IDBPDatabase> | null = null;

  private get db(): Promise<IDBPDatabase> {
    if (typeof window === 'undefined') {
      throw new Error('OfflineManager: indexedDB is only available in the browser.');
    }
    if (!this.dbInstance) {
      this.dbInstance = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Lookups
          if (!db.objectStoreNames.contains('services')) {
            db.createObjectStore('services', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('fines')) {
            db.createObjectStore('fines', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('customers')) {
            db.createObjectStore('customers', { keyPath: 'id' });
          }
          // Pending Actions
          if (!db.objectStoreNames.contains('pending_orders')) {
            db.createObjectStore('pending_orders', { keyPath: 'offlineId' });
          }
          // Metadata
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata');
          }
        },
      });
    }
    return this.dbInstance;
  }

  // --- Lookups ---

  async savePrefetchedData(data: { services: any[]; fines: any[]; customers: any[] }) {
    const db = await this.db;
    const tx = db.transaction(['services', 'fines', 'customers', 'metadata'], 'readwrite');

    // Clear old data
    await tx.objectStore('services').clear();
    await tx.objectStore('fines').clear();
    await tx.objectStore('customers').clear();

    // Store new data
    for (const service of data.services) await tx.objectStore('services').put(service);
    for (const fine of data.fines) await tx.objectStore('fines').put(fine);
    for (const customer of data.customers) await tx.objectStore('customers').put(customer);

    await tx.objectStore('metadata').put(new Date().toISOString(), 'last_prefetch');
    await tx.done;
  }

  async getServices() {
    const db = await this.db;
    return db.getAll('services');
  }

  async getFines() {
    const db = await this.db;
    return db.getAll('fines');
  }

  async getCustomers() {
    const db = await this.db;
    return db.getAll('customers');
  }

  async searchCustomers(query: string) {
    const customers = await this.getCustomers();
    if (!query) return customers.slice(0, 50);
    const q = query.toLowerCase();
    return customers
      .filter(
        c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.idNumber?.includes(q)
      )
      .slice(0, 50);
  }

  // --- Orders ---

  async saveOfflineOrder(order: OfflineOrder) {
    const db = await this.db;
    return db.put('pending_orders', order);
  }

  async getPendingOrders() {
    const db = await this.db;
    return db.getAll('pending_orders');
  }

  async removePendingOrder(offlineId: string) {
    const db = await this.db;
    return db.delete('pending_orders', offlineId);
  }

  // Generate a unique offline ID: OFF - DEVICE_RAND - TIMESTAMP
  generateOfflineId() {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `OFF-${rand}-${Date.now()}`;
  }

  // --- Sync ---

  async syncOrders() {
    const pending = await this.getPendingOrders();
    if (pending.length === 0) return { success: true, results: [] };

    try {
      const response = await fetch('/api/admin/offline/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: pending }),
      });

      if (!response.ok) throw new Error('Sync failed');

      const data = await response.json();
      if (data.success) {
        // Remove successfully synced orders
        for (const result of data.results) {
          if (result.status === 'created' || result.status === 'synced') {
            await this.removePendingOrder(result.offlineId);
          }
        }
      }
      return data;
    } catch (error) {
      console.error('Offline Sync Error:', error);
      return { success: false, error: String(error) };
    }
  }
}

export const offlineManager = new OfflineManager();
