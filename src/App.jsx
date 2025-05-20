import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

// Pages
import ResultPage from "./pages/ResultPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import LocationPage from "./pages/LocationPage";
import ProfilePage from "./pages/ProfilePage";
import DetectionHistoryPage from "./pages/DetectionHistoryPage";

// Components
import { LoginForm } from "./components/authentication/LoginForm";
import { SignupForm } from "./components/authentication/SignupForm";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Store & Config
import useUserStore from "./store/userStore";
import { ROUTES } from "./config";

const App = () => {
  const [modelState, setModelState] = useState({
    loading: true,
    progress: 0,
    net: null,
    inputShape: [1, 0, 0, 3],
    modelName: "yolov8n_best_04-14-25",
  });

  const { initialize } = useUserStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    const initializeModel = async () => {
      await tf.ready();

      try {
        const yolov8 = await tf.loadGraphModel(
          `${window.location.origin}/${modelState.modelName}_web_model/model.json`,
          {
            onProgress: (fractions) => {
              setModelState((prev) => ({
                ...prev,
                loading: true,
                progress: fractions,
              }));
            },
          }
        );

        // Warm up model
        const dummyInput = tf.ones(yolov8.inputs[0].shape);
        const warmupResults = yolov8.execute(dummyInput);

        setModelState((prev) => ({
          ...prev,
          loading: false,
          progress: 1,
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
        }));

        // Cleanup memory
        tf.dispose([warmupResults, dummyInput]);
      } catch (error) {
        console.error("Error initializing model:", error);
        setModelState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load model",
        }));
      }
    };

    initializeModel();
  }, []);

  if (modelState.loading) {
    return (
      <LoadingSpinner>
        Loading model... {Math.round(modelState.progress * 100)}%
      </LoadingSpinner>
    );
  }

  if (modelState.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-600 p-4">
        <p>{modelState.error}</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path={ROUTES.AUTH} element={<AuthPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginForm />} />
        <Route path={ROUTES.SIGNUP} element={<SignupForm />} />

        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <HomePage model={modelState} />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.RESULT}
          element={
            <ProtectedRoute>
              <ResultPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.LOCATION}
          element={
            <ProtectedRoute>
              <LocationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.HISTORY}
          element={
            <ProtectedRoute>
              <DetectionHistoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
