import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
const AuthPage = () => {
  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/icon-192x192.png"
              alt="Rice Plant Logo"
              className="h-20 w-20"
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
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition-colors"
          >
            Login to Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>

          <Link
            to="/signup"
            className="flex items-center justify-center w-full py-3 px-4 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg text-lg font-medium transition-colors"
          >
            Create New Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
