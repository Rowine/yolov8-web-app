import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import ResultPage from "./components/ResultPage";
import { detect } from "./utils/detect";

const HomePage = ({ model, loading }) => {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
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

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
    modelName: "yolov8n_best_04-14-25",
  }); // init model & input shape

  // references
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const capturedImageRef = useRef(null);

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.origin}/${model.modelName}_web_model/model.json`,
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
        ...model,
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage model={model} loading={loading} />}
        />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
};

export default App;
