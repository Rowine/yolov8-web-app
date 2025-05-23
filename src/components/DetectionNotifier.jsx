import { useNotifyNearbyUsers } from "../hooks/useNotifyNearbyUsers";
import { useState } from "react";
import useUserStore from "../store/userStore";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export const DetectionNotifier = ({ detectedIssues, currentLocation }) => {
  const { user } = useUserStore();
  const { notifyUsers, isNotifying, error } = useNotifyNearbyUsers(user.uid);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const isOnline = useOnlineStatus();

  const handleNotifyUsers = async () => {
    if (!isOnline) return;

    try {
      const count = await notifyUsers(currentLocation, detectedIssues);
      setNotifiedCount(count);
      setNotificationSent(true);
    } catch (err) {
      console.error("Failed to notify users:", err);
    }
  };

  if (!detectedIssues?.length) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Detection Alert</h3>
        <p className="text-sm text-gray-600">
          {detectedIssues.length} issue(s) detected in your area
        </p>

        {!isOnline && (
          <div className="flex items-center text-sm text-gray-500">
            <WifiOff className="w-4 h-4 mr-2" />
            Notifications unavailable while offline
          </div>
        )}

        {error && <p className="text-sm text-red-600">Error: {error}</p>}

        {notificationSent ? (
          <p className="text-sm text-green-600">
            ✓ Notified {notifiedCount} nearby farmers
          </p>
        ) : (
          <button
            onClick={handleNotifyUsers}
            disabled={isNotifying || !isOnline}
            className={`
              w-full px-4 py-2 text-sm font-medium text-white rounded-md
              ${
                isNotifying || !isOnline
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
            title={!isOnline ? "This feature requires internet connection" : ""}
          >
            {isNotifying ? "Notifying..." : "Notify Nearby Farmers"}
          </button>
        )}
      </div>
    </div>
  );
};
