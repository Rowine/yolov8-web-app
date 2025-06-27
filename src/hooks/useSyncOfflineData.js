import { useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  getUnsyncedDetections,
  markDetectionAsSynced,
  deleteDetection,
  getUnsyncedNotifications,
  markNotificationAsSynced,
  deleteNotification,
  getUnsyncedRoboflowUploads,
  markRoboflowUploadAsSynced,
  deleteRoboflowUpload
} from '../store/offlineStore';
import { useOnlineStatus } from './useOnlineStatus';
import { notifyNearbyUsers } from '../utils/smsService';
import { findNearbyUsers } from '../utils/locationUtils';
import { uploadToRoboflow, uploadClassificationToRoboflow } from '../utils/export/roboflowAPI';
import { createRoboflowDataset } from '../utils/export/annotationExport';
import useUserStore from '../store/userStore';

export const useSyncOfflineData = () => {
  const isOnline = useOnlineStatus();
  const { isAuthenticated, user } = useUserStore();

  useEffect(() => {
    if (!isOnline || !isAuthenticated || !user) return;

    const syncOfflineData = async () => {
      try {
        // Fetch all users from Firestore for nearby notifications
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
              userId: user.uid, // Associate detection with current user
              timestamp: serverTimestamp(),
            });
            await markDetectionAsSynced(detection.id);
            await deleteDetection(detection.id);
            console.log(`Synced detection ${detection.id} successfully`);
          } catch (error) {
            console.error("Error syncing detection:", error);
          }
        }

        // Sync Roboflow uploads
        const unsyncedUploads = await getUnsyncedRoboflowUploads();
        for (const upload of unsyncedUploads) {
          try {
            await syncRoboflowUpload(upload);
            await markRoboflowUploadAsSynced(upload.id);
            await deleteRoboflowUpload(upload.id);
            console.log(`Synced Roboflow upload ${upload.id} successfully`);
          } catch (error) {
            console.error("Error syncing Roboflow upload:", error);
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

        if (unsynced.length > 0) {
          console.log(`Successfully synced ${unsynced.length} detections`);
        }
        if (unsyncedUploads.length > 0) {
          console.log(`Successfully synced ${unsyncedUploads.length} Roboflow uploads`);
        }
      } catch (error) {
        console.error("Error in sync process:", error);
      }
    };

    syncOfflineData();
  }, [isOnline, isAuthenticated, user]);
};

/**
 * Helper function to sync individual Roboflow uploads
 * @param {Object} upload - The upload data from offline store
 */
const syncRoboflowUpload = async (upload) => {
  // Get credentials from environment variables for security
  const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
  const classificationProjectId = import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID;
  const detectionProjectId = import.meta.env.VITE_ROBOFLOW_PROJECT_ID;

  if (!apiKey) {
    throw new Error('Roboflow API key not configured');
  }

  const { uploadType, imageData, detections, isRiceLeaf, classification } = upload;

  if (uploadType === 'auto-upload') {
    // Auto upload to both classification and detection projects
    const uploadPromises = [];

    // 1. Upload to Classification Project
    if (classificationProjectId && classification) {
      try {
        const classificationDataset = createClassificationDataset(imageData, classification, isRiceLeaf);
        uploadPromises.push(
          uploadClassificationToRoboflow(classificationDataset, apiKey, classificationProjectId)
            .catch(err => console.error('Classification upload failed during sync:', err))
        );
      } catch (err) {
        console.error('Error creating classification dataset during sync:', err);
      }
    }

    // 2. Upload to Detection Project (only if it's a rice leaf)
    if (detectionProjectId && isRiceLeaf) {
      try {
        let detectionDataset;

        if (detections && detections.length > 0) {
          // Has detections - upload with annotations
          detectionDataset = createRoboflowDataset(imageData, detections);
        } else {
          // Healthy rice leaf - upload unlabeled
          detectionDataset = createUnlabeledDataset(imageData);
        }

        uploadPromises.push(
          uploadToRoboflow(detectionDataset, apiKey, detectionProjectId)
            .catch(err => console.error('Detection upload failed during sync:', err))
        );
      } catch (err) {
        console.error('Error creating detection dataset during sync:', err);
      }
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      await Promise.allSettled(uploadPromises);
    }
  } else if (uploadType === 'manual-upload') {
    // Manual upload to detection project
    const dataset = createRoboflowDataset(imageData, detections);
    await uploadToRoboflow(dataset, apiKey, detectionProjectId);
  }
};

/**
 * Helper function to create classification dataset (same as in useRoboflow.js)
 */
const createClassificationDataset = (imageData, classification, isRiceLeaf) => {
  const base64Image = imageData.split(',')[1];
  const className = isRiceLeaf ? 'rice_leaf' : 'not_rice_leaf';

  return {
    image: base64Image,
    annotations: '',
    labelmap: { 0: className },
    format: 'classification',
    metadata: {
      confidence: classification.confidence,
      originalPrediction: classification.prediction,
      isRiceLeaf: isRiceLeaf,
      finalClassName: className
    }
  };
};

/**
 * Helper function to create unlabeled dataset (same as in useRoboflow.js)
 */
const createUnlabeledDataset = (imageData) => {
  const base64Image = imageData.split(',')[1];

  return {
    image: base64Image,
    annotations: '',
    labelmap: {},
    format: 'unlabeled',
    metadata: {
      type: 'healthy_rice_leaf',
      unlabeled: true
    }
  };
}; 