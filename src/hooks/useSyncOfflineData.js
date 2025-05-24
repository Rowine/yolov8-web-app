import { useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUnsyncedDetections, markDetectionAsSynced, deleteDetection } from '../store/offlineStore';
import { useOnlineStatus } from './useOnlineStatus';

export const useSyncOfflineData = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) return;

    const syncOfflineDetections = async () => {
      try {
        const unsynced = await getUnsyncedDetections();

        for (const detection of unsynced) {
          try {
            // Add to Firestore
            await addDoc(collection(db, "detections"), {
              ...detection,
              timestamp: serverTimestamp(),
            });

            // Mark as synced and remove from IndexedDB
            await markDetectionAsSynced(detection.id);
            await deleteDetection(detection.id);
          } catch (error) {
            console.error("Error syncing detection:", error);
          }
        }
      } catch (error) {
        console.error("Error syncing offline detections:", error);
      }
    };

    syncOfflineDetections();
  }, [isOnline]);
}; 