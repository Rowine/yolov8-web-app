import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { auth } from "../../config/firebase";
import useUserStore from "../../store/userStore";
import { InputField } from "./InputField";

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    showPassword: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await useUserStore.getState().setUser(userCredential.user);
      navigate("/");
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <main className="h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-4">
        <div className="mb-3">
          <Link
            to="/auth"
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Login to check your rice plants</p>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            placeholder="farmer@example.com"
            icon={<Mail className="h-5 w-5 text-gray-400" />}
          />

          <InputField
            id="password"
            name="password"
            type={formData.showPassword ? "text" : "password"}
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="focus:outline-none"
              >
                {formData.showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            }
          />

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-base font-medium transition-colors"
          >
            Login
          </button>

          <div className="text-center mt-2">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};
