import React, { useState, useEffect } from "react";
import {
  Edit3, Store, Building, Clock, User, Shield, Copy, Share2,
  Camera, Save, X, MessageSquare, Upload, MapPin, Phone,
  Mail, Globe, Calendar, Tag, Check, AlertCircle, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

const ProfileOverview = () => {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [categoriesText, setCategoriesText] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const [profile, setProfile] = useState({
    shop_name: "",
    shop_type: "",
    tagline: "",
    established_year: "",
    professional_number: null,
    product_categories: [],
    profile_photo: "",
    store_area: "",
    referral_code: "",
    reference_code: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setFetchingProfile(true);
      try {
        const email = getAccountEmail();
        if (!email) return;
        const resp = await api.get("/profile", { params: { email } });
        const data = resp.data || {};
        if (!data.accepted_payment_methods) data.accepted_payment_methods = [];
        if (!data.product_categories) data.product_categories = [];
        setProfile((prev) => ({ ...prev, ...data }));
        setPhotoPreview(data.profile_photo || null);
        setCategoriesText((data.product_categories || []).join(", "));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile data");
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({ ...profile, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File is too large. Maximum size is 10MB.");
        e.target.value = ''; // Reset input
        return;
      }
      
      console.log("📸 File selected:", file.name, "Size:", file.size, "Type:", file.type);
      const fileURL = URL.createObjectURL(file);
      setPhotoPreview(fileURL);
      setProfilePhotoFile(file);
      toast.success("Photo selected. Click 'Save Changes' to upload.");
    }
  };

  const openEditModal = () => {
    setCategoriesText((profile.product_categories || []).join(", "));
    setIsEditing(true);
  };

  const validateProfile = () => {
    const errors = {};
    const email = (profile.email || "").trim();
    const phone = (profile.phone_number || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (email && !emailRegex.test(email)) errors.email = "Enter a valid email";
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ""))) errors.phone_number = "Enter a valid phone number";
    return Object.keys(errors).length ? errors : null;
  };

  const handleSave = async () => {
    const errors = validateProfile();
    if (errors) {
      toast.error("Please fix validation errors");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      const accountEmail = getAccountEmail();
      if (!accountEmail) {
        setSaving(false);
        toast.error("Could not determine user email to save profile.");
        return;
      }
      form.append("account_email", accountEmail);
      const keysToAppend = ["shop_name", "shop_type", "tagline", "established_year", "store_area", "facebook", "instagram", "google_business_rating"];
      keysToAppend.forEach((k) => {
        if (profile[k] !== undefined && profile[k] !== null) form.append(k, profile[k]);
      });
      const cats = categoriesText && categoriesText.trim() ? categoriesText.split(",").map((s) => s.trim()).filter(Boolean) : profile.product_categories || [];
      cats.forEach((c) => form.append("product_categories", c));
      
      // Log profile photo file info
      console.log("📸 Profile photo file to upload:", profilePhotoFile);
      if (profilePhotoFile) {
        console.log("📸 Profile photo details - Name:", profilePhotoFile.name, "Size:", profilePhotoFile.size, "Type:", profilePhotoFile.type);
        form.append("profile_photo", profilePhotoFile);
      }
      
      // Log all form data entries
      console.log("📸 Form data entries:");
      for (let pair of form.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
      
      const resp = await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      const data = resp.data || {};
      console.log("📸 Profile update response:", data);
      console.log("📸 Profile photo URL in response:", data.profile_photo);
      setProfile((prev) => ({ ...prev, ...data }));
      setPhotoPreview(data.profile_photo || photoPreview);
      setIsEditing(false);
      // Dispatch event to notify other components about profile update
      window.dispatchEvent(new CustomEvent("profile:update"));
      toast.success("Store profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      console.error("Error response:", err.response?.data);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const copyReferralCode = () => {
    const code = profile.referral_code || profile.reference_code;
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success("Referral code copied!");
    }
  };

  // Get user ID for display
  const getUserId = () => {
    try {
      const adminData = localStorage.getItem("admin");
      const userData = localStorage.getItem("user");
      return adminData ? JSON.parse(adminData)?.id : userData ? JSON.parse(userData)?.id : "N/A";
    } catch {
      return "N/A";
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover Background */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-12 left-6 sm:left-8">
            <div className="relative">
              <img
                src={photoPreview || profile.profile_photo || "https://via.placeholder.com/150?text=Store"}
                alt="Store"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
              />
              <button
                onClick={openEditModal}
                className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              >
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-colors shadow-lg"
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button
              onClick={() => navigate("/support")}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors border border-white/30"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Support</span>
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-6 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.shop_name || "Your Store Name"}
                </h2>
                {profile.professional_number && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-full text-sm font-semibold shadow-md">
                    <Shield size={14} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500 mb-4">
                {profile.tagline || "Add a tagline to your store"}
              </p>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  <User size={14} />
                  ID: {getUserId()}
                </span>
                {profile.established_year && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <Calendar size={14} />
                    Since {profile.established_year}
                  </span>
                )}
                {profile.store_area && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                    <Store size={14} />
                    {profile.store_area} sq.ft
                  </span>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {(profile.product_categories || []).slice(0, 6).map((c, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
                  >
                    {c}
                  </span>
                ))}
                {(profile.product_categories || []).length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                    +{(profile.product_categories || []).length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Referral Code */}
            {(profile.referral_code || profile.reference_code) && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1.5 bg-white rounded-lg font-mono font-semibold text-emerald-700 border border-emerald-200">
                    {profile.referral_code || profile.reference_code}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Copy code"
                  >
                    <Copy size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Store Type Card */}
        <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Store Type</h3>
          </div>
          <p className="text-gray-600 text-lg">{profile.shop_type || "Not specified"}</p>
        </div>

        {/* Professional ID Card */}
        <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Professional ID</h3>
          </div>
          <p className="text-gray-600 text-lg">{profile.professional_number || "Not available"}</p>
        </div>

        {/* Store Area Card */}
        <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Store Area</h3>
          </div>
          <p className="text-gray-600 text-lg">{profile.store_area ? `${profile.store_area} sq.ft` : "Not specified"}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Edit Store Profile</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Store Photo */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Upload size={16} />
                  Store Photo
                </h4>
                <div className="flex items-center gap-4">
                  <img
                    src={photoPreview || profile.profile_photo || "https://via.placeholder.com/100?text=Photo"}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <label className="block">
                      <span className="sr-only">Choose profile photo</span>
                      <input
                        type="file"
                        name="profile_photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. No size limit.</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Store size={16} />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="shop_name"
                      placeholder="Enter shop name"
                      value={profile.shop_name || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Type</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="shop_type"
                      placeholder="e.g., Supermarket, Grocery"
                      value={profile.shop_type || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="tagline"
                      placeholder="A catchy tagline for your store"
                      value={profile.tagline || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="established_year"
                      placeholder="e.g., 2020"
                      value={profile.established_year || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Area (sq.ft)</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="store_area"
                      placeholder="e.g., 2500"
                      value={profile.store_area || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  Product Categories
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    name="product_categories"
                    placeholder="e.g., Groceries, Fresh Produce, Dairy, Beverages"
                    value={categoriesText}
                    onChange={(e) => setCategoriesText(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate categories with commas</p>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe size={16} />
                  Social Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="facebook"
                      placeholder="Facebook handle or URL"
                      value={profile.facebook || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      name="instagram"
                      placeholder="Instagram handle or URL"
                      value={profile.instagram || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
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
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;