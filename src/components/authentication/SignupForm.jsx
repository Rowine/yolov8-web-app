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
    phone: "+63",
    password: "",
    showPassword: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Don't allow deletion of +63 prefix
      if (!value.startsWith("+63")) {
        return;
      }

      // Remove non-numeric characters except + and only from the part after +63
      let cleanValue = "+63" + value.slice(3).replace(/[^\d]/g, "");

      // Limit total length (Philippines mobile numbers: +63 + 10 digits = 13 chars)
      if (cleanValue.length <= 13) {
        setFormData((prev) => ({ ...prev, [name]: cleanValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => {
    setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password, phone, name } = formData;

    // Basic required field validation
    if (!email || !password || !phone || !name) {
      setError("Please fill in all required fields");
      return;
    }

    // Name validation
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    if (name.trim().length > 50) {
      setError("Name must be less than 50 characters");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      setError("Name can only contain letters and spaces");
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError(
        "Please enter a valid email address (letters, numbers, dots, hyphens, and underscores only)"
      );
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/(?=.*[a-z])/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/(?=.*\d)/.test(password)) {
      setError("Password must contain at least one number");
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
        phone: phone.replace("+", ""), // Remove + sign for database storage
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
    <main className="h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md [@media(max-height:500px)]:max-w-3xl bg-white rounded-xl shadow-sm p-4">
        <div className="mb-2">
          <Link
            to="/auth"
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">
            Create Your Account
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Join our community of rice farmers
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 [@media(max-height:500px)]:grid-cols-2 gap-3"
        >
          <InputField
            id="name"
            name="name"
            type="text"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            icon={<User className="h-4 w-4 text-gray-400" />}
          />

          <InputField
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            placeholder="farmer@example.com"
            icon={<Mail className="h-4 w-4 text-gray-400" />}
          />

          <div className="space-y-1">
            <InputField
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+639123456789"
              icon={<Phone className="h-4 w-4 text-gray-400" />}
            />
            <p className="text-xs text-gray-500">
              We'll send alerts about your crops to this number.
            </p>
          </div>

          <div className="space-y-1">
            <InputField
              id="password"
              name="password"
              type={formData.showPassword ? "text" : "password"}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none"
                >
                  {formData.showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              }
            />
            <p className="text-xs text-gray-500">
              At least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="[@media(max-height:500px)]:col-span-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-base font-medium transition-colors"
            >
              Create Account
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};
