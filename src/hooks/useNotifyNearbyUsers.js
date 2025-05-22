import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { findNearbyUsers } from '../utils/locationUtils';
import { notifyNearbyUsers } from '../utils/smsService';

/**
 * Custom hook to handle nearby users notification
 * @returns {Object} Hook methods and state
 */
export const useNotifyNearbyUsers = (currentUserId) => {
  const [isNotifying, setIsNotifying] = useState(false);
  const [error, setError] = useState(null);

  const notifyUsers = async (currentLocation, detectedIssues) => {
    setIsNotifying(true);
    setError(null);

    try {
      // Fetch all users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      // Find users within 10km radius
      const nearbyUsers = findNearbyUsers(currentLocation, allUsers);

      // Send notifications to nearby users (excluding current user)
      await notifyNearbyUsers(currentLocation, detectedIssues, nearbyUsers, currentUserId);

      // Return count of notified users (excluding current user)
      return nearbyUsers.filter(user => user.uid !== currentUserId).length;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsNotifying(false);
    }
  };

  return {
    notifyUsers,
    isNotifying,
    error
  };
}; 