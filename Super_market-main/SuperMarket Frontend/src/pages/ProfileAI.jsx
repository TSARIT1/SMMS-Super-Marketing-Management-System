import React, { useState, useEffect } from "react";
import {
  Zap, Bot, Brain, Cpu, MessageSquare, Printer,
  ToggleLeft, ToggleRight, Loader2, Sparkles, Info,
  Check
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

const ProfileAI = () => {
  const [profile, setProfile] = useState({
    ai_mode: "manual",
    ai_enabled: true,
    voice_ai_enabled: true,
    auto_inventory_management: false,
    auto_order_processing: false,
    ai_load_balancing: true,
    billing_mode: "manual",
    auto_billing_confirm: false,
    paper_size: "80mm",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAccountEmail = () => {
    try {
      const adminRaw = localStorage.getItem("admin");
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        if (admin?.email) return admin.email;
      }
    } catch { /* ignore */ }
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user?.email) return user.email;
      }
    } catch { /* ignore */ }
    return null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const email = getAccountEmail();
        if (!email) return;
        const resp = await api.get("/profile", { params: { email } });
        if (resp.data) {
          setProfile((prev) => ({ ...prev, ...resp.data }));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load AI configuration");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleToggle = async (field) => {
    const newValue = !profile[field];
    setProfile({ ...profile, [field]: newValue });
    setSaving(true);
    try {
      const form = new FormData();
      const accountEmail = getAccountEmail();
      if (!accountEmail) return;
      form.append("account_email", accountEmail);
      form.append(field, newValue);
      await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      const fieldName = field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      toast.success(`${fieldName} ${newValue ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error("Failed to update:", err);
      setProfile({ ...profile, [field]: !newValue });
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = async (field, value) => {
    const oldValue = profile[field];
    setProfile({ ...profile, [field]: value });
    setSaving(true);
    try {
      const form = new FormData();
      const accountEmail = getAccountEmail();
      if (!accountEmail) return;
      form.append("account_email", accountEmail);
      form.append(field, value);
      await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`${field.replace(/_/g, " ")} changed to ${value}`);
    } catch (err) {
      console.error("Failed to update:", err);
      setProfile({ ...profile, [field]: oldValue });
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const aiFeatures = [
    {
      key: "ai_enabled",
      label: "AI Features",
      desc: "Enable AI-powered features for your store",
      icon: Bot,
      color: "purple"
    },
    {
      key: "voice_ai_enabled",
      label: "Voice AI Assistant",
      desc: "Enable voice commands and assistant",
      icon: MessageSquare,
      color: "blue"
    },
    {
      key: "auto_inventory_management",
      label: "Auto Inventory Management",
      desc: "AI automatically manages stock levels",
      icon: Cpu,
      color: "emerald"
    },
    {
      key: "auto_order_processing",
      label: "Auto Order Processing",
      desc: "AI processes orders automatically",
      icon: Brain,
      color: "amber"
    },
    {
      key: "ai_load_balancing",
      label: "AI Load Balancing",
      desc: "Distribute AI workload efficiently",
      icon: Zap,
      color: "rose"
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: { bg: "bg-purple-50", icon: "bg-purple-100", text: "text-purple-600", active: "bg-purple-600" },
      blue: { bg: "bg-blue-50", icon: "bg-blue-100", text: "text-blue-600", active: "bg-blue-600" },
      emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100", text: "text-emerald-600", active: "bg-emerald-600" },
      amber: { bg: "bg-amber-50", icon: "bg-amber-100", text: "text-amber-600", active: "bg-amber-600" },
      rose: { bg: "bg-rose-50", icon: "bg-rose-100", text: "text-rose-600", active: "bg-rose-600" },
    };
    return colors[color] || colors.purple;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading AI configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">AI Configuration</h2>
          </div>
          <p className="text-purple-100">
            Configure AI features, automation settings, and billing preferences
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* AI Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Operation Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleModeChange("ai_mode", "manual")}
                disabled={saving}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  profile.ai_mode === "manual"
                    ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/10"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${profile.ai_mode === "manual" ? "bg-purple-100" : "bg-gray-100"}`}>
                    <ToggleLeft className={`w-5 h-5 ${profile.ai_mode === "manual" ? "text-purple-600" : "text-gray-500"}`} />
                  </div>
                  <span className={`font-semibold ${profile.ai_mode === "manual" ? "text-purple-700" : "text-gray-700"}`}>
                    Manual Mode
                  </span>
                  {profile.ai_mode === "manual" && (
                    <Check className="w-5 h-5 text-purple-600 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  You control when AI features are used. Full control over operations.
                </p>
              </button>

              <button
                onClick={() => handleModeChange("ai_mode", "auto")}
                disabled={saving}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  profile.ai_mode === "auto"
                    ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/10"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${profile.ai_mode === "auto" ? "bg-purple-100" : "bg-gray-100"}`}>
                    <ToggleRight className={`w-5 h-5 ${profile.ai_mode === "auto" ? "text-purple-600" : "text-gray-500"}`} />
                  </div>
                  <span className={`font-semibold ${profile.ai_mode === "auto" ? "text-purple-700" : "text-gray-700"}`}>
                    Auto Mode
                  </span>
                  {profile.ai_mode === "auto" && (
                    <Check className="w-5 h-5 text-purple-600 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  AI handles operations automatically. Hands-free experience.
                </p>
              </button>
            </div>
          </div>

          {/* AI Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              AI Features
            </h3>
            <div className="space-y-3">
              {aiFeatures.map((feature) => {
                const Icon = feature.icon;
                const colorClasses = getColorClasses(feature.color);
                const isEnabled = profile[feature.key];
                
                return (
                  <div
                    key={feature.key}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isEnabled ? `${colorClasses.bg} border-transparent` : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${isEnabled ? colorClasses.icon : "bg-gray-100"}`}>
                          <Icon className={`w-5 h-5 ${isEnabled ? colorClasses.text : "text-gray-400"}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isEnabled ? "text-gray-900" : "text-gray-600"}`}>
                            {feature.label}
                          </p>
                          <p className="text-sm text-gray-500">{feature.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(feature.key)}
                        disabled={saving}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                          isEnabled ? colorClasses.active : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            isEnabled ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing System */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Printer className="w-5 h-5 text-purple-600" />
              AI Billing System
            </h3>
            
            <div className="space-y-4">
              {/* Billing Mode */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Billing Mode</p>
                    <p className="text-sm text-gray-500">Choose how bills are generated</p>
                  </div>
                  <div className="flex gap-2">
                    {["manual", "ai"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleModeChange("billing_mode", mode)}
                        disabled={saving}
                        className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all ${
                          profile.billing_mode === mode
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto Confirm */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Auto Confirm Bills</p>
                    <p className="text-sm text-gray-500">Automatically confirm generated bills</p>
                  </div>
                  <button
                    onClick={() => handleToggle("auto_billing_confirm")}
                    disabled={saving}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                      profile.auto_billing_confirm ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        profile.auto_billing_confirm ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Paper Size</p>
                    <p className="text-sm text-gray-500">Select receipt paper size</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["58mm", "80mm", "A4", "A5"].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleModeChange("paper_size", size)}
                        disabled={saving}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          profile.paper_size === size
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Info className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">About AI Features</h3>
            <p className="text-gray-600 text-sm">
              AI features help automate your store operations. In Manual mode, you have full control over when AI is used. 
              In Auto mode, AI will intelligently handle operations based on your preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAI;