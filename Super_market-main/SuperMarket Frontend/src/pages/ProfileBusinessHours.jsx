import React, { useState, useEffect } from "react";
import {
  Clock, Save, X, Edit3, Sun, Moon, Calendar,
  Check, AlertCircle, Loader2, Info
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
];

const ProfileBusinessHours = () => {
  const [profile, setProfile] = useState({
    opening_time: "09:00",
    closing_time: "21:00",
    working_days: "Monday to Sunday",
    open_all_days: true,
  });
  const [isEditing, setIsEditing] = useState(false);
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
        toast.error("Failed to load business hours");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({ ...profile, [name]: type === "checkbox" ? checked : value });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hr = parseInt(h);
    const ampm = hr >= 12 ? "PM" : "AM";
    const hour12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${hour12}:${m} ${ampm}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      const accountEmail = getAccountEmail();
      if (!accountEmail) {
        toast.error("Could not determine user email.");
        setSaving(false);
        return;
      }
      form.append("account_email", accountEmail);
      ["opening_time", "closing_time", "working_days"].forEach((k) => {
        if (profile[k] !== undefined) form.append(k, profile[k]);
      });
      await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Business hours updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save business hours.");
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [openH, openM] = (profile.opening_time || "09:00").split(":").map(Number);
    const [closeH, closeM] = (profile.closing_time || "21:00").split(":").map(Number);
    
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { isOpen: true, message: "Currently Open" };
    } else if (currentTime < openTime) {
      return { isOpen: false, message: `Opens at ${formatTime(profile.opening_time)}` };
    } else {
      return { isOpen: false, message: "Closed for today" };
    }
  };

  const status = getCurrentStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading business hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Business Hours</h2>
              </div>
              <p className="text-green-100">
                Set your store's operating hours and working days
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg"
              >
                <Edit3 size={18} />
                Edit Hours
              </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {isEditing ? (
            <div className="space-y-6">
              {/* Time Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <div className="p-1.5 rounded-lg bg-amber-100">
                      <Sun size={14} className="text-amber-600" />
                    </div>
                    Opening Time
                  </label>
                  <input
                    type="time"
                    name="opening_time"
                    value={profile.opening_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <div className="p-1.5 rounded-lg bg-indigo-100">
                      <Moon size={14} className="text-indigo-600" />
                    </div>
                    Closing Time
                  </label>
                  <input
                    type="time"
                    name="closing_time"
                    value={profile.closing_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
              </div>

              {/* Working Days */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <Calendar size={14} className="text-green-600" />
                  </div>
                  Working Days
                </label>
                <input
                  type="text"
                  name="working_days"
                  value={profile.working_days}
                  onChange={handleChange}
                  placeholder="e.g., Monday to Saturday"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400">Enter working days like "Monday to Saturday" or "All days"</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Status */}
              <div className={`p-6 rounded-xl ${status.isOpen ? "bg-green-50 border-2 border-green-200" : "bg-gray-50 border-2 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${status.isOpen ? "bg-green-100" : "bg-gray-200"}`}>
                      {status.isOpen ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${status.isOpen ? "text-green-700" : "text-gray-700"}`}>
                        {status.message}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {formatTime(profile.opening_time)} - {formatTime(profile.closing_time)}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    status.isOpen 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {status.isOpen ? "OPEN" : "CLOSED"}
                  </div>
                </div>
              </div>

              {/* Hours Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Sun className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-semibold text-gray-700">Opening Time</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatTime(profile.opening_time)}</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Moon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-gray-700">Closing Time</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatTime(profile.closing_time)}</p>
                </div>
              </div>

              {/* Working Days */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Working Days</span>
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-4">{profile.working_days || "Not specified"}</p>
                
                {/* Day Pills */}
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isWorking = profile.working_days?.toLowerCase().includes(day.label.toLowerCase()) ||
                      profile.working_days?.toLowerCase().includes(day.short.toLowerCase()) ||
                      profile.working_days?.toLowerCase().includes("all") ||
                      profile.working_days?.toLowerCase().includes("everyday");
                    
                    return (
                      <span
                        key={day.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isWorking
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {day.short}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Business Hours Tips</h3>
            <p className="text-gray-600 text-sm">
              Accurate business hours help customers know when to visit your store. 
              These hours may be displayed on your store profile and used for order scheduling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBusinessHours;