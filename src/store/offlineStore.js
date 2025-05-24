import { openDB } from 'idb';

const DB_NAME = 'rice-detection-app';
const DB_VERSION = 1;
const STORE_NAME = 'offline-detections';

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store of objects
      const store = db.createObjectStore(STORE_NAME, {
        // The 'id' property will be the key.
        keyPath: 'id',
        // If it isn't explicitly set, create a value by auto incrementing.
        autoIncrement: true,
      });
      // Create an index on the 'timestamp' property
      store.createIndex('timestamp', 'timestamp');
    },
  });
  return db;
};

export const saveOfflineDetection = async (detection) => {
  const db = await initDB();
  try {
    await db.add(STORE_NAME, {
      ...detection,
      timestamp: new Date().toISOString(),
      synced: false,
    });
  } catch (error) {
    console.error('Error saving offline detection:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const getUnsyncedDetections = async () => {
  const db = await initDB();
  try {
    return await db.getAllFromIndex(STORE_NAME, 'timestamp');
  } catch (error) {
    console.error('Error getting unsynced detections:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const markDetectionAsSynced = async (id) => {
  const db = await initDB();
  try {
    await db.put(STORE_NAME, { id, synced: true });
  } catch (error) {
    console.error('Error marking detection as synced:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const deleteDetection = async (id) => {
  const db = await initDB();
  try {
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error('Error deleting detection:', error);
    throw error;
  } finally {
    db.close();
  }
}; 