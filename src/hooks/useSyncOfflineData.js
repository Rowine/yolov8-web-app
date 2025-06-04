import { useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  getUnsyncedDetections,
  markDetectionAsSynced,
  deleteDetection,
  getUnsyncedNotifications,
  markNotificationAsSynced,
  deleteNotification
} from '../store/offlineStore';
import { useOnlineStatus } from './useOnlineStatus';
import { notifyNearbyUsers } from '../utils/smsService';
import { findNearbyUsers } from '../utils/locationUtils';

export const useSyncOfflineData = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) return;

    const syncOfflineData = async () => {
      try {
        // Fetch all users from Firestore
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const allUsers = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));

        // Sync detections
        const unsynced = await getUnsyncedDetections();
        for (const detection of unsynced) {
          try {
            await addDoc(collection(db, "detections"), {
              ...detection,
              timestamp: serverTimestamp(),
            });
            await markDetectionAsSynced(detection.id);
            await deleteDetection(detection.id);
          } catch (error) {
            console.error("Error syncing detection:", error);
          }
        }

        // Sync notifications and send SMS for today's notifications only
        const unsyncedNotifications = await getUnsyncedNotifications();

        // Group notifications by detection location to avoid duplicate notifications
        const notificationGroups = unsyncedNotifications.reduce((groups, notification) => {
          const locationKey = `${notification.currentLocation.lat},${notification.currentLocation.lng}`;
          if (!groups[locationKey]) {
            groups[locationKey] = {
              currentLocation: notification.currentLocation,
              detectedIssues: notification.detectedIssues,
              recipients: []
            };
          }
          groups[locationKey].recipients.push({
            uid: notification.recipientId,
            phone: notification.phoneNumber,
            farmLocation: notification.recipientLocation
          });
          return groups;
        }, {});

        // Process each group of notifications
        for (const group of Object.values(notificationGroups)) {
          try {
            // Find nearby users using the locationUtils function
            const nearbyUsers = findNearbyUsers(group.currentLocation, allUsers);

            // Use the existing notifyNearbyUsers function
            await notifyNearbyUsers(
              group.currentLocation,
              group.detectedIssues,
              nearbyUsers,
              '' // currentUserId is empty since we're syncing notifications
            );

            // Mark all notifications in this group as synced and delete them
            const notificationIds = unsyncedNotifications
              .filter(n =>
                n.currentLocation.lat === group.currentLocation.lat &&
                n.currentLocation.lng === group.currentLocation.lng
              )
              .map(n => n.id);

            for (const id of notificationIds) {
              await markNotificationAsSynced(id);
              await deleteNotification(id);
            }
          } catch (error) {
            console.error("Error processing notification group:", error);
          }
        }
      } catch (error) {
        console.error("Error in sync process:", error);
      }
    };

    syncOfflineData();
  }, [isOnline]);
}; 