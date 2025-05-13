import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Webcam } from "../utils/webcam";
import { detect } from "../utils/detect";
import labels from "../utils/labels.json";

const ButtonHandler = ({ cameraRef, canvasRef, model }) => {
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
        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
          streaming === "camera"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => {
          // if not streaming
          if (streaming === null) {
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing camera streaming
          else if (streaming === "camera") {
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
          }
        }}
      >
        {streaming === "camera" ? "Close" : "Open"} Webcam
      </button>
      <button
        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
          streaming === "camera"
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-gray-300 cursor-not-allowed text-gray-500"
        }`}
        onClick={handleCapture}
        disabled={streaming !== "camera"}
      >
        Capture Photo
      </button>
    </div>
  );
};

export default ButtonHandler;
