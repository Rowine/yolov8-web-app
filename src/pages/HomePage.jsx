import { useRef, useEffect } from "react";
import useUserStore from "../store/userStore";
import Loader from "../components/loader";
import ButtonHandler from "../components/btn-handler";
import Sidebar from "../components/Sidebar";

const HomePage = ({ model, loading }) => {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const { initialize } = useUserStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Sidebar />
      {loading.loading && (
        <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>
      )}

      <div className="flex-1 px-4 py-4 flex flex-col">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📷 YOLOv8 Live Detection App
          </h1>
          <p className="text-base text-gray-600 mb-1">
            YOLOv8 live detection application on browser powered by{" "}
            <code className="bg-gray-200 rounded px-2 py-1">tensorflow.js</code>
          </p>
          <p className="text-gray-600 text-sm">
            Serving :{" "}
            <code className="bg-gray-200 rounded px-2 py-1">
              {model.modelName}
            </code>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <div className="relative flex-1 mb-4">
            <video
              autoPlay
              muted
              ref={cameraRef}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <canvas
              width={model.inputShape[1]}
              height={model.inputShape[2]}
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          <ButtonHandler
            cameraRef={cameraRef}
            canvasRef={canvasRef}
            model={model}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
