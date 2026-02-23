import React, { useState } from "react";
import { Mail, KeyRound, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      toast.success("Password reset link sent to your email");
      setStep(2);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset link. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex justify-center items-center p-6">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border-t-4 border-green-500 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-700 flex justify-center items-center gap-2">
            <KeyRound className="text-green-600" size={24} /> Forgot Password
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 && "Enter your email to receive a password reset link."}
            {step === 2 && "Check your email for the reset link."}
          </p>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form
            onSubmit={handleEmailSubmit}
            className="space-y-5 animate-fadeIn"
          >
            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="text-green-600" size={18} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending...
                </>
              ) : (
                <>Send Reset Link</>
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              <a
                href="/login"
                className="flex items-center justify-center gap-1 text-green-600 hover:underline mt-2"
              >
                <ArrowLeft size={14} /> Back to Login
              </a>
            </p>
          </form>
        )}

        {/* Step 2: Success */}
        {step === 2 && (
          <div className="text-center py-10 animate-fadeIn">
            <CheckCircle2
              size={64}
              className="mx-auto text-green-500 mb-4 animate-pulse"
            />
            <h3 className="text-xl font-semibold text-gray-800">
              Reset Link Sent!
            </h3>
            <p className="text-gray-600 mt-2">
              Check your email for the password reset link.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-1 text-green-600 hover:underline mt-4"
            >
              <ArrowLeft size={14} /> Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
