import React, { useState } from "react";
import { Mail, KeyRound, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Mock backend emails
  const validEmails = [
    "demo@market.com",
    "user@store.in",
    "naveen@supermarket.in",
  ];

  const handleEmailSubmit = (e) => {
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
    setTimeout(() => {
      if (validEmails.includes(email.toLowerCase())) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otpCode);
        toast.success(`OTP sent to ${email}`);
        setStep(2);
      } else {
        toast.error("Email not found! Please register first.");
      }
      setLoading(false);
    }, 1500);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    if (otp !== generatedOtp) {
      toast.error("Invalid OTP! Please try again.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success("OTP Verified ✅ Redirecting to login...");
      setLoading(false);
      setStep(3);

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }, 1200);
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
            {step === 1 && "Enter your email to receive a verification code."}
            {step === 2 && "Enter the 6-digit OTP sent to your email."}
            {step === 3 && "Verification successful. Redirecting..."}
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
                  <Loader2 size={18} className="animate-spin" /> Sending OTP...
                </>
              ) : (
                <>Send OTP</>
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

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-5 animate-fadeIn">
            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <KeyRound className="text-green-600" size={18} /> Enter 6-digit
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="input text-center tracking-widest font-semibold text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>Verify OTP</>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Change Email
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-10 animate-fadeIn">
            <CheckCircle2
              size={64}
              className="mx-auto text-green-500 mb-4 animate-pulse"
            />
            <h3 className="text-xl font-semibold text-gray-800">
              Verified Successfully!
            </h3>
            <p className="text-gray-600 mt-2">Redirecting to Login Page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
