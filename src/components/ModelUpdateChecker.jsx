import { useState, useEffect } from "react";
import { Download, RefreshCw, Check } from "lucide-react";
import useModelVersionStore from "../store/modelVersionStore";
import useModelStore from "../store/modelStore";

export const ModelUpdateChecker = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    currentVersion,
    latestVersion,
    availableVersions,
    updateAvailable,
    isChecking,
    error,
    checkForUpdates,
    downloadAndUpdateModel,
  } = useModelVersionStore();
  const { resetModel, initializeModel } = useModelStore();

  useEffect(() => {
    checkForUpdates();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const success = await downloadAndUpdateModel(latestVersion);
      if (success) {
        // Reset and reinitialize the model with new version
        await resetModel();
        await initializeModel();
      }
    } catch (err) {
      console.error("Error updating model:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!updateAvailable || !latestVersion || !availableVersions[latestVersion]) {
    return null;
  }

  const latestVersionInfo = availableVersions[latestVersion];

  return (
    <div className="p-4 bg-white border border-green-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Model Update Available
          </h3>
          <p className="text-sm text-gray-500">
            {latestVersionInfo.description}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span>Current: {currentVersion}</span>
            <span>→</span>
            <span>Latest: {latestVersion}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => checkForUpdates()}
            disabled={isChecking}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            title="Check for updates"
          >
            <RefreshCw
              className={`w-5 h-5 ${isChecking ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors ${
              isUpdating
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Update Now
              </>
            )}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
