import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { saveOfflineNotification } from "../store/offlineStore";
import { notifyNearbyUsers } from "../utils/smsService";
import { findNearbyUsers } from "../utils/locationUtils";
import { WifiOff, X } from "lucide-react";
import useUserStore from "../store/userStore";

const NOTIFICATION_RADIUS_KM = 10; // Configurable radius for notifications

export const DetectionNotifier = ({ detectedIssues, currentLocation }) => {
  const isOnline = useOnlineStatus();
  const { user } = useUserStore();
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Find nearby users when detection occurs
  useEffect(() => {
    const findUsers = async () => {
      if (!detectedIssues?.length || !currentLocation || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get all users from Firestore
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const allUsers = usersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        // Find nearby users using the locationUtils function
        const nearby = findNearbyUsers(
          currentLocation,
          allUsers,
          NOTIFICATION_RADIUS_KM
        );
        setNearbyUsers(nearby);
      } catch (error) {
        console.error("Error finding nearby users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    findUsers();
  }, [detectedIssues, currentLocation, user]);

  const handleNotifyUsers = async () => {
    if (isNotifying || !nearbyUsers.length) return; // Only check for notifying state and empty users

    try {
      setIsNotifying(true);

      if (isOnline) {
        // If online, notify users directly
        const count = await notifyNearbyUsers(
          currentLocation,
          detectedIssues,
          nearbyUsers,
          user.uid
        );
        setNotifiedCount(count);
      } else {
        // If offline, save for later sync
        await saveOfflineNotification({
          currentLocation,
          detectedIssues,
          nearbyUsers,
          currentUserId: user.uid,
        });
        setNotifiedCount(nearbyUsers.length - 1); // Subtract current user
      }
      setNotificationSent(true);
    } catch (error) {
      console.error("Error in notification process:", error);
    } finally {
      setIsNotifying(false);
    }
  };

  if (!detectedIssues?.length || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Detection Alert</h3>
        <p className="text-sm text-gray-600">
          {detectedIssues.length} issue(s) detected in your area
        </p>

        {isLoading ? (
          <div className="text-sm text-gray-600">Finding nearby farmers...</div>
        ) : nearbyUsers.length > 0 ? (
          <>
            <p className="text-sm text-gray-600">
              {nearbyUsers.length - 1} farmers found within{" "}
              {NOTIFICATION_RADIUS_KM}km
            </p>

            {!isOnline && (
              <div className="flex items-center text-sm text-gray-500">
                <WifiOff className="w-4 h-4 mr-2" />
                Notifications will be sent when back online
              </div>
            )}

            {notificationSent ? (
              <p className="text-sm text-green-600">
                ✓ {isOnline ? "Notified" : "Will notify"} {notifiedCount} nearby
                farmers
              </p>
            ) : (
              <button
                onClick={handleNotifyUsers}
                disabled={isNotifying}
                className={`
                  w-full px-4 py-2 text-sm font-medium text-white rounded-md
                  ${
                    isNotifying
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {isNotifying
                  ? "Sending notifications..."
                  : "Notify Nearby Farmers"}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600">
            No farmers found within {NOTIFICATION_RADIUS_KM}km
          </p>
        )}
      </div>
    </div>
  );
};
