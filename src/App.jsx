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

const App = () => {
  const { initialize } = useUserStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

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
