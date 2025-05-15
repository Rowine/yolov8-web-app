import { useRef, useEffect, useState } from "react";
import useUserStore from "../store/userStore";
import Loader from "../components/loader";
import ButtonHandler from "../components/btn-handler";
import Sidebar from "../components/Sidebar";

const HomePage = ({ model, loading }) => {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const { initialize, user } = useUserStore();
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Development only
  useEffect(() => {
    if (user) {
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

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Sidebar />
      {loading.loading && (
        <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>
      )}

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
              {model.modelName}
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
              width={model.inputShape[1]}
              height={model.inputShape[2]}
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Placeholder message when no camera is active */}
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center p-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    Click "Start Camera" to begin
                  </p>
                  <p className="text-sm">
                    Position your rice plant in the frame for best results
                  </p>
                </div>
              </div>
            )}
          </div>

          <ButtonHandler
            cameraRef={cameraRef}
            canvasRef={canvasRef}
            model={model}
            onCameraStart={() => setIsCameraActive(true)}
            onCameraStop={() => setIsCameraActive(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
