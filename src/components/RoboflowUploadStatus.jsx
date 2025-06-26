import React, { useState, useEffect } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { getUnsyncedRoboflowUploads } from "../store/offlineStore";
import { WifiOff, Upload, CheckCircle, Clock } from "lucide-react";

export const RoboflowUploadStatus = ({ isUploading, isSuccess, error }) => {
  const isOnline = useOnlineStatus();
  const [pendingUploads, setPendingUploads] = useState(0);

  // Check for pending uploads when component mounts and when online status changes
  useEffect(() => {
    const checkPendingUploads = async () => {
      try {
        const unsyncedUploads = await getUnsyncedRoboflowUploads();
        setPendingUploads(unsyncedUploads.length);
      } catch (error) {
        console.error("Error checking pending uploads:", error);
      }
    };

    checkPendingUploads();

    // Check every 30 seconds if offline
    let interval;
    if (!isOnline && pendingUploads > 0) {
      interval = setInterval(checkPendingUploads, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, pendingUploads]);

  // Don't show anything if no uploads are happening and no pending uploads
  if (!isUploading && !isSuccess && !error && pendingUploads === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Current upload status */}
      {(isUploading || isSuccess || error) && (
        <div
          className={`
          mb-2 p-3 rounded-lg shadow-lg border-l-4 max-w-sm
          ${
            error
              ? "bg-red-50 border-red-400 text-red-700"
              : isSuccess
              ? "bg-green-50 border-green-400 text-green-700"
              : "bg-blue-50 border-blue-400 text-blue-700"
          }
        `}
        >
          <div className="flex items-center">
            {error ? (
              <>
                <span className="text-sm font-medium">Upload Failed</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  {isOnline ? "Uploaded to Roboflow" : "Saved for Upload"}
                </span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                <span className="text-sm font-medium">
                  {isOnline
                    ? "Uploading to Roboflow..."
                    : "Saving for Upload..."}
                </span>
              </>
            )}
          </div>
          {error && <p className="text-xs mt-1 opacity-90">{error}</p>}
        </div>
      )}

      {/* Pending uploads notification */}
      {pendingUploads > 0 && (
        <div
          className={`
          p-3 rounded-lg shadow-lg border-l-4 max-w-sm
          ${
            isOnline
              ? "bg-blue-50 border-blue-400 text-blue-700"
              : "bg-yellow-50 border-yellow-400 text-yellow-700"
          }
        `}
        >
          <div className="flex items-center">
            {isOnline ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                <span className="text-sm font-medium">Syncing Uploads...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Offline Mode</span>
              </>
            )}
          </div>
          <div className="flex items-center mt-1">
            <Clock className="w-3 h-3 mr-1 opacity-75" />
            <p className="text-xs opacity-90">
              {pendingUploads} upload{pendingUploads !== 1 ? "s" : ""} pending
              {isOnline ? " - syncing now" : " - will sync when online"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
