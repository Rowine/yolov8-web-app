import { useNavigate } from "react-router-dom";
import { useWebcam } from "../hooks/useWebcam";
import { useDetection } from "../hooks/useDetection";
import labels from "../utils/data/labels.json";

const CameraButton = ({ isStreaming, onClick, className }) => (
  <button
    className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${
      isStreaming
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "bg-green-600 hover:bg-green-700 text-white"
    } ${className}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      {isStreaming ? "Stop Camera" : "Start Camera"}
    </div>
  </button>
);

const CaptureButton = ({ isEnabled, onClick }) => (
  <button
    className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center gap-2 ${
      isEnabled
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-gray-100 text-gray-400 cursor-not-allowed"
    }`}
    onClick={onClick}
    disabled={!isEnabled}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
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
    Capture Photo
  </button>
);

export const CameraControls = ({
  cameraRef,
  canvasRef,
  model,
  onCameraStart,
  onCameraStop,
}) => {
  const navigate = useNavigate();
  const { isStreaming, startCamera, stopCamera } = useWebcam({
    onStart: onCameraStart,
    onStop: onCameraStop,
  });
  const { processImage, isProcessing, error } = useDetection(model);

  const handleCapture = async () => {
    if (!cameraRef.current?.srcObject) {
      alert("Webcam not open!");
      return;
    }

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    const videoWidth = cameraRef.current.videoWidth;
    const videoHeight = cameraRef.current.videoHeight;

    tempCanvas.width = videoWidth;
    tempCanvas.height = videoHeight;
    tempCtx.drawImage(cameraRef.current, 0, 0, videoWidth, videoHeight);

    const imageData = tempCanvas.toDataURL("image/png");
    const detections = await processImage(tempCanvas);

    if (detections) {
      navigate("/result", { state: { imageData, detections } });
    } else if (error) {
      console.error("Detection failed:", error);
      alert("Failed to process image. Please try again.");
    }
  };

  const handleCameraToggle = () => {
    if (!isStreaming) {
      startCamera(cameraRef);
    } else {
      stopCamera(cameraRef);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <CameraButton isStreaming={isStreaming} onClick={handleCameraToggle} />
      <CaptureButton
        isEnabled={isStreaming && !isProcessing}
        onClick={handleCapture}
      />
    </div>
  );
};
