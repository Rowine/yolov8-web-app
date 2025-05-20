import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ArrowLeft, Mail, Lock, Phone, Eye, EyeOff, User } from "lucide-react";
import { auth, db } from "../../config/firebase";
import useUserStore from "../../store/userStore";
import { InputField } from "./InputField";

export const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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

    const { email, password, phone, name } = formData;

    if (!email || !password || !phone) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email: user.email,
        phone,
        createdAt: new Date(),
      });

      await useUserStore.getState().setUser(user);
      navigate("/location");
    } catch (error) {
      console.error("Error registering user:", error);
      setError(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <Link
            to="/auth"
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Create Your Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join our community of rice farmers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="name"
            name="name"
            type="text"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            icon={<User className="h-5 w-5 text-gray-400" />}
          />

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

          <div className="space-y-2">
            <InputField
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
              icon={<Phone className="h-5 w-5 text-gray-400" />}
            />
            <p className="text-sm text-gray-500">
              We'll send alerts about your crops to this number
            </p>
          </div>

          <div className="space-y-2">
            <InputField
              id="password"
              name="password"
              type={formData.showPassword ? "text" : "password"}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
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
            <p className="text-sm text-gray-500">Use at least 8 characters</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition-colors"
          >
            Create Account
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};
