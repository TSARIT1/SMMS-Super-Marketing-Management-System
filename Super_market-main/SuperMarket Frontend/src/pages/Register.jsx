import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Store,
  MapPin,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lock,
  Users,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    shop_name: "",
    shop_address: "",
    referred_by: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (
      formData.full_name &&
      formData.email &&
      formData.phone &&
      formData.password
    )
      setStep(2);
    else toast.error(t("register.fillPersonalDetails"));
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!(formData.shop_name && formData.shop_address)) {
      toast.error(t("register.fillShopDetails"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        shopName: formData.shop_name,
        shopAddress: formData.shop_address,
        referredBy: formData.referred_by || null,
      };
      // lazy import api util to avoid top-level bundling issues
      const api = (await import("../utils/api")).default;
      const res = await api.post("/register", payload);
      setSubmitted(true);
      // Auto-login (store user and token locally) and navigate to onboarding
      const user = res?.data?.user || res?.data;
      const token = res?.data?.token;
      try {
        localStorage.setItem("user", JSON.stringify(user));
        if (token) {
          localStorage.setItem("token", token);
        }
      } catch (err) {
        console.debug("Failed to persist user", err);
      }

      if (res?.data?.subscription) {
        setTrialInfo(res.data.subscription);
        setTimeout(() => toast.success(t("register.registeredTrialStarted")), 400);
        // navigate to onboarding for smooth setup process
        setTimeout(() => navigate("/onboarding"), 1500);
      } else {
        setTimeout(() => toast.success(t("register.registeredSuccess")), 400);
        // Start onboarding process
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      console.error("Registration failed", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex justify-center items-center p-1">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8 transition-all duration-300 border-t-4 border-green-500">
        {/* Header */}
        <div>
          <Toaster position="top-right" />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
            <Store className="text-green-600" /> {t("register.title")}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8 relative">
          <div
            className={`absolute top-1/2 left-0 w-full h-[3px] bg-gray-200 rounded-full`}
          ></div>
          <div
            className={`absolute top-1/2 left-0 h-[3px] bg-green-500 rounded-full transition-all duration-500 ${
              step === 1 ? "w-1/2" : "w-full"
            }`}
          ></div>
          <div
            className={`step-circle ${step >= 1 ? "bg-green-500" : "bg-gray-300"}`}
          >
            <User size={16} color="white" />
          </div>
          <div
            className={`step-circle ${step === 2 ? "bg-green-500" : "bg-gray-300"}`}
          >
            <Store size={16} color="white" />
          </div>
        </div>

        {/* Step 1 — Personal Info */}
        {step === 1 && !submitted && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <User size={16} className="text-green-600" /> {t("register.fullName")}
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder={t("register.fullNamePlaceholder")}
                className="input"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <Mail size={16} className="text-green-600" /> {t("register.email")}
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("register.emailPlaceholder")}
                className="input"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <Phone size={16} className="text-green-600" /> {t("register.phone")}
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("register.phonePlaceholder")}
                className="input"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <Lock size={16} className="text-green-600" /> {t("register.password")}
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("register.passwordPlaceholder")}
                className="input"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={loading}
                className={`btn-primary flex items-center gap-2 cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? t("register.pleaseWait") : t("register.next") } <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Shop Details */}
        {step === 2 && !submitted && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <Store size={16} className="text-green-600" /> {t("register.shopName")}
              </label>
              <input
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder={t("register.shopNamePlaceholder")}
                className="input"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <MapPin size={16} className="text-green-600" /> {t("register.shopAddress")}
              </label>
              <textarea
                name="shop_address"
                value={formData.shop_address}
                onChange={handleChange}
                placeholder={t("register.shopAddressPlaceholder")}
                className="input h-24 resize-none"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium flex items-center gap-2">
                <Users size={16} className="text-green-600" /> {t("register.referredBy")} <span className="text-xs text-gray-500">({t("register.optional")})</span>
              </label>
              <input
                name="referred_by"
                type="text"
                value={formData.referred_by}
                onChange={handleChange}
                placeholder={t("register.referredByPlaceholder")}
                className="input"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="btn-secondary flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft size={16} /> {t("register.back")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`btn-primary flex items-center gap-2 cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? t("register.registering") : t("register.registerButton")}
              </button>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {submitted && (
          <div className="text-center py-12 animate-fadeIn">
            <CheckCircle
              size={64}
              className="mx-auto text-green-500 mb-4 animate-bounce"
            />
            <h3 className="text-xl font-semibold text-gray-800">
              {t("register.registrationSuccessful")}
            </h3>
            <p className="text-gray-600 mt-2">
              {t("register.welcome", { name: formData.full_name })} 👋
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {t("register.shopRegistered", { shop: formData.shop_name })}
            </p>

            {trialInfo ? (
              <div className="mt-4 bg-yellow-50 text-yellow-700 p-3 rounded">
                {t("register.freeTrialActive")} {" "}
                <span className="font-semibold">
                  {trialInfo.trialEndDate || trialInfo.endDate}
                </span>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-600">{t("register.noTrialActive")}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
