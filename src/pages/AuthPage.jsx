import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../config";

const AuthButton = ({ to, variant = "primary", children }) => (
  <Link
    to={to}
    className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
      variant === "primary"
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-white border-2 border-green-600 text-green-600 hover:bg-green-50"
    }`}
  >
    {children}
    <ArrowRight className="ml-2 h-5 w-5" />
  </Link>
);

const AuthPage = () => {
  return (
    <main className="h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/icon-192x192.png"
              alt="Rice Plant Logo"
              className="h-20 w-20"
              loading="lazy"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-green-800">
            Rice Disease Detection
          </h1>
          <p className="mt-2 text-gray-600">
            Helping farmers identify and treat rice diseases
          </p>
        </div>

        <div className="space-y-4">
          <AuthButton to={ROUTES.LOGIN}>Login to Your Account</AuthButton>

          <AuthButton to={ROUTES.SIGNUP} variant="secondary">
            Create New Account
          </AuthButton>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
