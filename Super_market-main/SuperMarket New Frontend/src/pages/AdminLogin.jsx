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
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [backendUp, setBackendUp] = useState(true);
  const [checkingBackend, setCheckingBackend] = useState(false);

  const navigate = useNavigate();

  const checkBackend = async () => {
    setCheckingBackend(true);
    try {
      await api.get("/subscription-plans/active");
      setBackendUp(true);
    } catch (err) {
      console.warn('Backend health check failed', err);
      setBackendUp(false);
    } finally {
      setCheckingBackend(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  React.useEffect(() => {
    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!backendUp) {
      toast.error("Backend unreachable. Please start the server on http://localhost:8080 and retry.");
      return;
    }

    if (!formData.emailOrPhone || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // call backend login
      const res = await api.post("/admin/login", {
        email: formData.emailOrPhone,
        password: formData.password,
      });

      const token = res?.data?.token;
      const userId = res?.data?.userId || res?.data?.id;
      const email = res?.data?.email || formData.emailOrPhone;
      const fullName = res?.data?.fullName || res?.data?.name || "Super Admin";
      // Normalize any legacy 'ADMIN' role to 'SUPER_ADMIN'
      const roleFromRes = res?.data?.role;
      const role =
        roleFromRes === "ADMIN" ? "SUPER_ADMIN" : roleFromRes || "SUPER_ADMIN";

      if (token) {
        localStorage.setItem("adminToken", token);
      }

      localStorage.setItem(
        "admin",
        JSON.stringify({ id: userId, email, fullName, role }),
      );

      setLoggedIn(true);
      // short delay to show success UI
      setTimeout(() => navigate("/superadmindashboard"), 700);
    } catch (err) {
      console.error("Admin login failed", err);
      // Network specific message is more actionable
      const isNetworkError =
        err?.message === "Network Error" || err?.code === "ERR_NETWORK";
      if (isNetworkError) {
        toast.error(
          "Cannot reach backend. Make sure the server is running on http://localhost:8080",
        );
      } else {
        const msg = err?.response?.data?.message || err?.message || "Login failed. Please try again.";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center p-6">
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border-t-4 border-blue-500 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 text-blue-600 text-3xl font-bold">
            <Store size={28} /> Super Admin Portal
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Login to access the super admin dashboard
          </p>
        </div>

        {/* Success View */}
        {!backendUp && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            Backend unreachable. <strong>Start the backend at http://localhost:8080</strong> to enable login.
            <button
              onClick={checkBackend}
              disabled={checkingBackend}
              className="ml-3 inline-block px-3 py-1 bg-yellow-600 text-white rounded text-xs"
            >
              {checkingBackend ? "Checking..." : "Retry"}
            </button>
          </div>
        )}

        {loggedIn ? (
          <div className="text-center py-10 animate-fadeIn">
            <CheckCircle2
              size={64}
              className="mx-auto text-blue-500 mb-4 animate-pulse"
            />
            <h3 className="text-xl font-semibold text-gray-800">
              Welcome Super Admin 👋
            </h3>
            <p className="text-gray-600 mt-2">
              Redirecting to super admin dashboard...
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email / Phone */}
            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="text-blue-600" size={18} />
                Email or Phone
              </label>
              <div className="relative">
                <input
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  placeholder="Enter admin email or phone number"
                  className="input pr-10"
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
                <Lock className="text-blue-600" size={18} />
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
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-500 cursor-pointer hover:text-blue-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary flex items-center justify-center gap-2 ${
                loading ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Super Admin Login
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
