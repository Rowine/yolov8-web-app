import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detect, detectVideo } from "./utils/detect";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const capturedImageRef = useRef(null);

  // model configs
  const modelName = "yolov8n_best_04-14-25";

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.origin}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {loading.loading && (
        <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📷 YOLOv8 Live Detection App
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            YOLOv8 live detection application on browser powered by{" "}
            <code className="bg-gray-200 rounded px-2 py-1">tensorflow.js</code>
          </p>
          <p className="text-gray-600">
            Serving :{" "}
            <code className="bg-gray-200 rounded px-2 py-1">{modelName}</code>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative aspect-video w-full max-w-4xl mx-auto mb-6 rounded-lg overflow-hidden">
            <img
              src="#"
              ref={imageRef}
              className="hidden absolute inset-0 w-full h-full object-contain"
              onLoad={() => detect(imageRef.current, model, canvasRef.current)}
            />
            <img
              src="#"
              ref={capturedImageRef}
              className="hidden absolute inset-0 w-full h-full object-contain"
              alt="Captured frame"
            />
            <video
              autoPlay
              muted
              ref={cameraRef}
              className="absolute inset-0 w-full h-full object-contain"
              onPlay={() =>
                detectVideo(cameraRef.current, model, canvasRef.current)
              }
            />
            <video
              autoPlay
              muted
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain"
              onPlay={() =>
                detectVideo(videoRef.current, model, canvasRef.current)
              }
            />
            <canvas
              width={model.inputShape[1]}
              height={model.inputShape[2]}
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          <ButtonHandler
            imageRef={imageRef}
            cameraRef={cameraRef}
            videoRef={videoRef}
            capturedImageRef={capturedImageRef}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
