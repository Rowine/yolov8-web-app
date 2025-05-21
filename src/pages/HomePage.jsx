import { useRef, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import useUserStore from "../store/userStore";
import useModelStore from "../store/modelStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CameraControls } from "../components/CameraControls";
import { Sidebar } from "../components/Sidebar";

const CameraPlaceholder = () => (
  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
    <div className="text-center p-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
        <Camera className="h-8 w-8 text-green-600" />
      </div>
      <p className="text-lg font-medium">Click "Start Camera" to begin</p>
      <p className="text-sm">
        Position your rice plant in the frame for best results
      </p>
    </div>
  </div>
);

const HomePage = () => {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const { initialize, user } = useUserStore();
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
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

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
        Loading model... {(progress * 100).toFixed(2)}%
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
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Sidebar />

      <div className="flex-1 px-4 py-8 flex flex-col max-w-5xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Rice Pest & Disease Detection
          </h1>
          <p className="text-base text-gray-600 mb-1">
            Take a photo of your rice plant to detect diseases
          </p>
          <p className="text-gray-600 text-sm">
            Using:{" "}
            <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
              {modelName}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex-1 flex flex-col mb-6">
          <div className="relative flex-1 mb-6 border-2 border-dashed border-green-200 rounded-lg overflow-hidden">
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
