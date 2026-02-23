import React, { useState, useEffect } from "react";
import {
  Phone, MapPin, Mail, Globe, Save, X, Edit3,
  Building, Clock, ExternalLink, Copy, CheckCircle,
  Loader2, MessageSquare
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

const ProfileContact = () => {
  const [profile, setProfile] = useState({
    shop_address: "",
    phone_number: "",
    email: "",
    website: "",
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
        toast.error("Failed to load contact information");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
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
      ["shop_address", "phone_number", "email", "website"].forEach((k) => {
        if (profile[k] !== undefined) form.append(k, profile[k]);
      });
      await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Contact information updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save contact information.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const contactItems = [
    {
      icon: MapPin,
      label: "Store Address",
      value: profile.shop_address,
      key: "shop_address",
      type: "textarea",
      placeholder: "Enter your complete store address",
      color: "emerald",
      copyable: false
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: profile.phone_number,
      key: "phone_number",
      type: "tel",
      placeholder: "+91 9876543210",
      color: "blue",
      copyable: true
    },
    {
      icon: Mail,
      label: "Email Address",
      value: profile.email,
      key: "email",
      type: "email",
      placeholder: "store@example.com",
      color: "purple",
      copyable: true
    },
    {
      icon: Globe,
      label: "Website",
      value: profile.website,
      key: "website",
      type: "url",
      placeholder: "www.yourstore.com",
      color: "indigo",
      copyable: true,
      isLink: true
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" },
      blue: { bg: "bg-blue-50", icon: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
      purple: { bg: "bg-purple-50", icon: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
      indigo: { bg: "bg-indigo-50", icon: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Contact Information</h2>
              </div>
              <p className="text-emerald-100">
                Manage your store's contact details and location
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <Edit3 size={18} />
                Edit Details
              </button>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="p-6 sm:p-8">
          {isEditing ? (
            <div className="space-y-6">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const colorClasses = getColorClasses(item.color);
                return (
                  <div key={item.key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <div className={`p-1.5 rounded-lg ${colorClasses.icon}`}>
                        <Icon size={14} className={colorClasses.text} />
                      </div>
                      {item.label}
                    </label>
                    {item.type === "textarea" ? (
                      <textarea
                        name={item.key}
                        value={profile[item.key] || ""}
                        onChange={handleChange}
                        rows={3}
                        placeholder={item.placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                      />
                    ) : (
                      <input
                        type={item.type}
                        name={item.key}
                        value={profile[item.key] || ""}
                        onChange={handleChange}
                        placeholder={item.placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    )}
                  </div>
                );
              })}

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
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const colorClasses = getColorClasses(item.color);
                const hasValue = profile[item.key];
                
                return (
                  <div
                    key={item.key}
                    className={`group relative p-5 rounded-xl border-2 transition-all duration-200 ${
                      hasValue
                        ? `${colorClasses.bg} ${colorClasses.border}`
                        : "bg-gray-50 border-gray-200 border-dashed"
                    } ${item.key === "shop_address" ? "lg:col-span-2" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${colorClasses.icon} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                        {hasValue ? (
                          <p className="text-gray-900 font-medium break-words">
                            {item.value}
                          </p>
                        ) : (
                          <p className="text-gray-400 italic">Not provided</p>
                        )}
                      </div>
                      {hasValue && item.copyable && (
                        <button
                          onClick={() => copyToClipboard(profile[item.key], item.label)}
                          className="p-2 hover:bg-white/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy to clipboard"
                        >
                          <Copy size={16} className="text-gray-400" />
                        </button>
                      )}
                      {hasValue && item.isLink && (
                        <a
                          href={profile[item.key]?.startsWith("http") ? profile[item.key] : `https://${profile[item.key]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ExternalLink size={16} className="text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Keep Your Contact Info Updated</h3>
            <p className="text-gray-600 text-sm">
              Accurate contact information helps customers find your store and reach you easily. 
              This information may also be used for order notifications and support communications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContact;