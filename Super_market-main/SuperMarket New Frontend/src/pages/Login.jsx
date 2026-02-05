import React, { useState } from "react";
import {
  Mail,
  Phone,
  Lock,
  Store,
  LogIn,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Don't clear error immediately - let user see what went wrong
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submissions
    if (isSubmitting || loading) {
      return;
    }

    if (!formData.emailOrPhone || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError("");

    try {
      // Call backend login API
      const response = await api.post("/login", {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
      });

      // Store user and token from response
      const { user, token } = response.data;
      
      if (!user || !token) {
        throw new Error("Invalid response format from server");
      }
      
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      
      console.log("✅ Login successful!", user.email);
      
      // Navigate to dashboard immediately without showing success screen
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      setIsSubmitting(false);
      
      console.error("❌ Login failed:", err.response?.status, err.response?.data?.message || err.message);
      
      // Build detailed error message
      let errorMessage = "";
      let errorDetails = "";
      
      if (err.response?.status === 401) {
        errorMessage = "Invalid email/phone or password.";
        errorDetails = "Please check your credentials and try again. Make sure you're using the correct email/phone and password.";
      } else if (err.response?.status === 403) {
        const message = err.response.data?.message || err.response.data?.error;
        errorMessage = "Access Denied";
        errorDetails = message || "Your account is blocked. Please contact support.";
      } else if (err.response?.status === 404) {
        errorMessage = "Account not found.";
        errorDetails = "Please make sure you've registered first. Click 'Register Your Account' below to create an account.";
      } else if (!err.response) {
        errorMessage = "Cannot connect to server.";
        errorDetails = "Please check if the backend is running on port 8080. Error: Network request failed.";
      } else {
        const serverError = err.response?.data?.message || err.response?.data?.error;
        errorMessage = "Login failed.";
        errorDetails = serverError || `Server returned error code ${err.response?.status}. Please try again.`;
      }
      
      setError(`${errorMessage} ${errorDetails}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border-t-4 border-green-500 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 text-green-600 text-3xl font-bold">
            <Store size={28} /> SmartMarket
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Login to manage your supermarket dashboard
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-5 py-4 rounded-lg animate-fadeIn shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold text-base mb-2">Login Failed</p>
                    <p className="text-sm font-medium leading-relaxed">{error}</p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-700 transition text-xl font-bold"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
                {(error.includes("not found") || error.includes("Invalid email")) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      🎯 <strong>Quick Solutions:</strong>
                    </p>
                    <div className="space-y-2">
                      <a 
                        href="/register" 
                        className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        📝 Register Your Account
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            emailOrPhone: "demo@tsaritservices.com",
                            password: "demo123"
                          });
                          setError("");
                        }}
                        className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        🔑 Try Demo Account
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Demo: demo@tsaritservices.com / demo123
                    </p>
                  </div>
                )}
                {error.includes("backend") && (
                  <p className="text-sm mt-2 text-red-600">
                    💡 <strong>Tip:</strong> Make sure the backend server is running on port 8080.
                  </p>
                )}
              </div>
            )}
            
            {/* Email / Phone */}
            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="text-green-600" size={18} />
                Email or Phone
              </label>
              <div className="relative">
                <input
                  name="emailOrPhone"
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  placeholder="Enter email or phone number"
                  className="input pr-10"
                  autoComplete="username"
                  required
                />
                <Phone
                  size={18}
                  className="absolute right-3 top-4 text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <Lock className="text-green-600" size={18} />
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="input pr-10"
                  autoComplete="current-password"
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-500 cursor-pointer hover:text-green-600 transition"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-green-600 hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className={`w-full btn-primary flex items-center justify-center gap-2 ${
                loading || isSubmitting ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Login
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow h-[1px] bg-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">or</span>
              <div className="flex-grow h-[1px] bg-gray-300"></div>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-green-600 font-medium hover:underline"
              >
                Register now
              </a>
            </p>
          </form>
      </div>
    </div>
  );
}
