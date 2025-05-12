import { useState, useRef } from "react";
import { Webcam } from "../utils/webcam";

const ButtonHandler = ({ imageRef, cameraRef, videoRef, capturedImageRef }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const inputImageRef = useRef(null); // video input reference
  const inputVideoRef = useRef(null); // video input reference
  const webcam = new Webcam(); // webcam handler

  // closing image
  const closeImage = () => {
    const url = imageRef.current.src;
    imageRef.current.src = "#"; // restore image source
    URL.revokeObjectURL(url); // revoke url

    setStreaming(null); // set streaming to null
    inputImageRef.current.value = ""; // reset input image
    imageRef.current.style.display = "none"; // hide image
  };

  // closing video streaming
  const closeVideo = () => {
    const url = videoRef.current.src;
    videoRef.current.src = ""; // restore video source
    URL.revokeObjectURL(url); // revoke url

    setStreaming(null); // set streaming to null
    inputVideoRef.current.value = ""; // reset input video
    videoRef.current.style.display = "none"; // hide video
  };

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {/* Image Handler */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          imageRef.current.src = url; // set video source
          imageRef.current.style.display = "block"; // show video
          setStreaming("image"); // set streaming to video
        }}
        ref={inputImageRef}
      />
      <button
        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
          streaming === "image"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => {
          // if not streaming
          if (streaming === null) inputImageRef.current.click();
          // closing image streaming
          else if (streaming === "image") closeImage();
          else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming video or webcam
        }}
      >
        {streaming === "image" ? "Close" : "Open"} Image
      </button>

      {/* Video Handler */}
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          if (streaming === "image") closeImage(); // closing image streaming
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          videoRef.current.src = url; // set video source
          videoRef.current.addEventListener("ended", () => closeVideo()); // add ended video listener
          videoRef.current.style.display = "block"; // show video
          setStreaming("video"); // set streaming to video
        }}
        ref={inputVideoRef}
      />
      <button
        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
          streaming === "video"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => {
          // if not streaming
          if (streaming === null || streaming === "image")
            inputVideoRef.current.click();
          // closing video streaming
          else if (streaming === "video") closeVideo();
          else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming webcam
        }}
      >
        {streaming === "video" ? "Close" : "Open"} Video
      </button>

      {/* Webcam Handler */}
      <button
        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
          streaming === "camera"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => {
          // if not streaming
          if (streaming === null || streaming === "image") {
            // closing image streaming
            if (streaming === "image") closeImage();
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing video streaming
          else if (streaming === "camera") {
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
          } else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming video
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
            // call detection once image is loaded (handled by `onLoad`)
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
