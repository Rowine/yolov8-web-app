import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Webcam } from "../utils/webcam";
import { detect } from "../utils/detect";
import labels from "../utils/labels.json";

const ButtonHandler = ({
  cameraRef,
  canvasRef,
  model,
  onCameraStart,
  onCameraStop,
}) => {
  const [streaming, setStreaming] = useState(null);
  const navigate = useNavigate();
  const webcam = new Webcam();

  const handleCapture = async () => {
    if (cameraRef.current && cameraRef.current.srcObject) {
      // Create a temporary canvas for capturing
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      // Set canvas size to match video dimensions
      const videoWidth = cameraRef.current.videoWidth;
      const videoHeight = cameraRef.current.videoHeight;
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;

      // Draw the current frame from video
      tempCtx.drawImage(cameraRef.current, 0, 0, videoWidth, videoHeight);

      // Get the image data
      const imageData = tempCanvas.toDataURL("image/png");

      try {
        // Run detection on the canvas
        const rawDetections = await detect(tempCanvas, model);

        // Process detections to ensure correct class names and normalized coordinates
        const processedDetections = rawDetections.map((det) => {
          // Get the class name from the class index
          const classIndex = det.classIndex || 0;
          const className = labels[classIndex];

          // Normalize bounding box coordinates (convert to 0-1 range)
          const normalizedBbox = det.bbox.map((coord, idx) => {
            // Even indices (0,2) are y coordinates, odd indices (1,3) are x coordinates
            return idx % 2 === 0 ? coord / videoHeight : coord / videoWidth;
          });

          return {
            class: className,
            confidence: det.confidence,
            bbox: normalizedBbox,
          };
        });

        // Navigate to results page with the captured image and detections
        navigate("/result", {
          state: {
            imageData,
            detections: processedDetections,
          },
        });
      } catch (error) {
        console.error("Detection failed:", error);
        alert("Failed to process image. Please try again.");
      }
    } else {
      alert("Webcam not open!");
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {/* Webcam Handler */}
      <button
        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${
          streaming === "camera"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
        onClick={() => {
          // if not streaming
          if (streaming === null) {
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
            onCameraStart?.(); // call the callback if provided
          }
          // closing camera streaming
          else if (streaming === "camera") {
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
            onCameraStop?.(); // call the callback if provided
          }
        }}
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
          {streaming === "camera" ? "Stop Camera" : "Start Camera"}
        </div>
      </button>
      <button
        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center gap-2 ${
          streaming === "camera"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        onClick={handleCapture}
        disabled={streaming !== "camera"}
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
    </div>
  );
};

export default ButtonHandler;
