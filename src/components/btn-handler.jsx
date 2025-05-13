import { useState } from "react";
import { Webcam } from "../utils/webcam";

const ButtonHandler = ({ cameraRef, capturedImageRef }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const webcam = new Webcam(); // webcam handler

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;

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
        onClick={() => {
          if (cameraRef.current && cameraRef.current.srcObject) {
            const context = canvas.getContext("2d");
            context.drawImage(
              cameraRef.current,
              0,
              0,
              canvas.width,
              canvas.height
            );
            const dataUrl = canvas.toDataURL("image/png");
            capturedImageRef.current.src = dataUrl;
            capturedImageRef.current.style.display = "block";
          } else {
            alert("Webcam not open!");
          }
        }}
      >
        Capture Photo
      </button>
    </div>
  );
};

export default ButtonHandler;
