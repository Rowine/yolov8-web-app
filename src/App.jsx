import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

// Store & Config
import useUserStore from "./store/userStore";
import { ROUTES } from "./config";
import { useSyncOfflineData } from "./hooks/useSyncOfflineData";
import { useFullscreen } from "./hooks/useFullscreen";

const App = () => {
  const { initialize } = useUserStore();
  const { enterFullscreen, isPWA, isSupported } = useFullscreen();

  // Initialize user authentication
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Initialize offline data syncing
  useSyncOfflineData();

  // Initialize fullscreen mode for PWA
  useEffect(() => {
    const initializeFullscreen = async () => {
      // Small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Only auto-enter fullscreen if running as PWA and fullscreen is supported
      if (isPWA && isSupported) {
        try {
          await enterFullscreen();
          console.log("PWA launched in fullscreen mode");
        } catch (error) {
          console.warn("Could not enter fullscreen automatically:", error);
        }
      }

      // For web browsers, add body class to help with styling
      if (isPWA) {
        document.body.classList.add("pwa-mode");
      }
    };

    initializeFullscreen();
  }, [isPWA, isSupported, enterFullscreen]);

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
              <HomePage />
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
