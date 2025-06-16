import { useRef, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import useUserStore from "../store/userStore";
import useModelStore from "../store/modelStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CameraControls } from "../components/CameraControls";
import { Sidebar } from "../components/Sidebar";

const CameraPlaceholder = () => (
  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
    <div className="text-center p-2">
      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
        <Camera className="h-6 w-6 text-green-600" />
      </div>
      <p className="text-base font-medium">Click "Start Camera" to begin</p>
      <p className="text-xs">
        Position your rice plant in the frame for best results
      </p>
    </div>
  </div>
);

const HomePage = () => {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const { user } = useUserStore();
  const {
    loading,
    progress,
    error,
    initializeModel,
    net,
    inputShape,
    modelName,
  } = useModelStore();
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  // Development logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && user) {
      console.log("Current User Details:", {
        name: user.name,
        email: user.email,
        phone: user.phone,
        uid: user.uid,
        farmLocation: user.farmLocation,
        createdAt: user.createdAt,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <LoadingSpinner>
        Loading models... {(progress * 100).toFixed(0)}%
        <div className="text-xs mt-1 text-gray-500">
          {progress < 0.8
            ? "Loading detection model..."
            : "Loading classification model..."}
        </div>
      </LoadingSpinner>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-green-50 flex flex-col">
      <Sidebar />

      <div className="flex-1 px-2 py-2 flex flex-col max-w-5xl mx-auto w-full">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-green-800 mb-1">
            Rice Pest & Disease Detection
          </h1>
          <p className="text-sm text-gray-600">
            Take a photo of your rice plant to detect diseases •{" "}
            <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
              {modelName}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 flex-1 flex flex-col">
          <div className="relative flex-1 mb-2 border-2 border-dashed border-green-200 rounded-lg overflow-hidden">
            <video
              autoPlay
              muted
              ref={cameraRef}
              className="absolute inset-0 w-full h-full object-contain"
              onPlay={() => setIsCameraActive(true)}
              onEnded={() => setIsCameraActive(false)}
            />
            <canvas
              width={inputShape[1]}
              height={inputShape[2]}
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
            />

            {!isCameraActive && <CameraPlaceholder />}
          </div>

          <CameraControls
            cameraRef={cameraRef}
            canvasRef={canvasRef}
            model={{ net, inputShape, modelName }}
            onCameraStart={() => setIsCameraActive(true)}
            onCameraStop={() => setIsCameraActive(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
