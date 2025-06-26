import { openDB } from 'idb';

const DB_NAME = 'rice-detection-app';
const DB_VERSION = 3; // Increased version for Roboflow uploads store
const DETECTIONS_STORE = 'offline-detections';
const NOTIFICATIONS_STORE = 'offline-notifications';
const ROBOFLOW_UPLOADS_STORE = 'offline-roboflow-uploads';

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Create detections store if it doesn't exist
      if (!db.objectStoreNames.contains(DETECTIONS_STORE)) {
        const detectionsStore = db.createObjectStore(DETECTIONS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        detectionsStore.createIndex('timestamp', 'timestamp');
      }

      // Create notifications store if it doesn't exist
      if (!db.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
        const notificationsStore = db.createObjectStore(NOTIFICATIONS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        notificationsStore.createIndex('timestamp', 'timestamp');
        // Add index for recipient phone number
        notificationsStore.createIndex('phoneNumber', 'phoneNumber');
      }

      // Create Roboflow uploads store if it doesn't exist
      if (!db.objectStoreNames.contains(ROBOFLOW_UPLOADS_STORE)) {
        const uploadsStore = db.createObjectStore(ROBOFLOW_UPLOADS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        uploadsStore.createIndex('timestamp', 'timestamp');
        uploadsStore.createIndex('uploadType', 'uploadType'); // 'classification', 'detection', 'feedback'
      }
    },
  });
  return db;
};

// Detection related functions
export const saveOfflineDetection = async (detection) => {
  const db = await initDB();
  try {
    await db.add(DETECTIONS_STORE, {
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
    return await db.getAllFromIndex(DETECTIONS_STORE, 'timestamp');
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
    await db.put(DETECTIONS_STORE, { id, synced: true });
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
    await db.delete(DETECTIONS_STORE, id);
  } catch (error) {
    console.error('Error deleting detection:', error);
    throw error;
  } finally {
    db.close();
  }
};

// Notification related functions
export const saveOfflineNotification = async ({ currentLocation, detectedIssues, nearbyUsers, currentUserId }) => {
  const db = await initDB();
  try {
    // Save a notification entry for each nearby user
    for (const user of nearbyUsers) {
      if (user.uid === currentUserId || !user.phone) continue;

      await db.add(NOTIFICATIONS_STORE, {
        currentLocation,
        detectedIssues,
        recipientId: user.uid,
        phoneNumber: user.phone,
        recipientLocation: user.farmLocation,
        timestamp: new Date().toISOString(),
        synced: false,
      });
    }
  } catch (error) {
    console.error('Error saving offline notification:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const getUnsyncedNotifications = async () => {
  const db = await initDB();
  try {
    const notifications = await db.getAllFromIndex(NOTIFICATIONS_STORE, 'timestamp');
    // Filter out notifications older than today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return notifications.filter(notification => {
      const notificationDate = new Date(notification.timestamp);
      return notificationDate >= today;
    });
  } catch (error) {
    console.error('Error getting unsynced notifications:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const markNotificationAsSynced = async (id) => {
  const db = await initDB();
  try {
    await db.put(NOTIFICATIONS_STORE, { id, synced: true });
  } catch (error) {
    console.error('Error marking notification as synced:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const deleteNotification = async (id) => {
  const db = await initDB();
  try {
    await db.delete(NOTIFICATIONS_STORE, id);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  } finally {
    db.close();
  }
};

// Roboflow upload related functions
export const saveOfflineRoboflowUpload = async (uploadData) => {
  const db = await initDB();
  try {
    await db.add(ROBOFLOW_UPLOADS_STORE, {
      ...uploadData,
      timestamp: new Date().toISOString(),
      synced: false,
    });
  } catch (error) {
    console.error('Error saving offline Roboflow upload:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const getUnsyncedRoboflowUploads = async () => {
  const db = await initDB();
  try {
    return await db.getAllFromIndex(ROBOFLOW_UPLOADS_STORE, 'timestamp');
  } catch (error) {
    console.error('Error getting unsynced Roboflow uploads:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const markRoboflowUploadAsSynced = async (id) => {
  const db = await initDB();
  try {
    await db.put(ROBOFLOW_UPLOADS_STORE, { id, synced: true });
  } catch (error) {
    console.error('Error marking Roboflow upload as synced:', error);
    throw error;
  } finally {
    db.close();
  }
};

export const deleteRoboflowUpload = async (id) => {
  const db = await initDB();
  try {
    await db.delete(ROBOFLOW_UPLOADS_STORE, id);
  } catch (error) {
    console.error('Error deleting Roboflow upload:', error);
    throw error;
  } finally {
    db.close();
  }
}; 