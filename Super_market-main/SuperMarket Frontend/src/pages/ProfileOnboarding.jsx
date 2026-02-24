import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle, Circle, FileText, Upload, Calendar, Building,
  User, FileCheck, AlertCircle, Loader2,
  Edit3, X, Save, Sparkles, ExternalLink
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";
import { getCurrentUserId } from "../utils/auth";

const ProfileOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState(null);
  const [businessInfo, setBusinessInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRefs = {
    gstCertificate: useRef(null),
    shopRegistrationCertificate: useRef(null),
    panCard: useRef(null),
    aadhaarCard: useRef(null)
  };

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        toast.error("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await api.get(`/onboarding/status?userId=${userId}`);
      const data = response.data;

      setOnboardingData(data);

      // Parse business info if available
      if (data.businessInfo) {
        try {
          const parsed = typeof data.businessInfo === 'string' 
            ? JSON.parse(data.businessInfo) 
            : data.businessInfo;
          setBusinessInfo(parsed);
        } catch (e) {
          console.error("Error parsing business info:", e);
        }
      }
    } catch (error) {
      console.error("Failed to fetch onboarding data:", error);
      // Set default data on error so the page still renders
      setOnboardingData({
        isCompleted: false,
        isSkipped: false,
        currentStep: 1,
        personalInfoCompleted: false,
        shopDetailsCompleted: false,
        documentsUploaded: false
      });
      toast.error("Failed to load onboarding details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = getCurrentUserId();
      await api.post("/onboarding/update-progress", {
        userId,
        step: onboardingData.currentStep || 3,
        ...businessInfo
      });
      toast.success("Onboarding details updated successfully!");
      setIsEditing(false);
      fetchOnboardingData();
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // AI-powered analysis of onboarding data
  const analyzeWithAI = async () => {
    setAiAnalyzing(true);
    try {
      const userId = getCurrentUserId();
      const response = await api.post("/onboarding/ai/analyze", {
        userId,
        onboardingData: businessInfo
      });
      
      if (response.data?.suggestions) {
        setAiSuggestions(response.data.suggestions);
        toast.success("AI analysis completed!");
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Generate local suggestions if API fails
      const localSuggestions = generateLocalSuggestions();
      setAiSuggestions(localSuggestions);
      toast.success("Analysis completed with local insights");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const generateLocalSuggestions = () => {
    const suggestions = [];
    
    if (!businessInfo.gstNumber && !onboardingData?.gstCertificatePath) {
      suggestions.push({
        type: "warning",
        message: "GST registration is recommended for businesses with turnover above ₹40 lakhs",
        action: "Add GST Number"
      });
    }
    
    if (!businessInfo.panNumber) {
      suggestions.push({
        type: "info",
        message: "PAN number is essential for tax compliance and business verification",
        action: "Add PAN Number"
      });
    }
    
    if (!onboardingData?.documentsUploaded) {
      suggestions.push({
        type: "warning",
        message: "Uploading documents helps verify your business faster",
        action: "Upload Documents"
      });
    }
    
    if (!businessInfo.employeeCount || businessInfo.employeeCount === "0") {
      suggestions.push({
        type: "info",
        message: "Adding employee count helps us customize features for your business size",
        action: "Add Employee Count"
      });
    }

    if (!businessInfo.businessCategory) {
      suggestions.push({
        type: "info",
        message: "Selecting a business category helps personalize your dashboard",
        action: "Select Category"
      });
    }

    return suggestions;
  };

  const getCompletionPercentage = () => {
    if (!onboardingData) return 0;
    let completed = 0;
    let total = 5;
    
    if (onboardingData.personalInfoCompleted) completed++;
    if (onboardingData.shopDetailsCompleted) completed++;
    if (onboardingData.documentsUploaded) completed++;
    if (businessInfo.gstNumber || businessInfo.panNumber) completed++;
    if (businessInfo.businessCategory) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Handle document upload
  const handleDocumentUpload = async (documentType, file) => {
    if (!file) return;

    setUploadingDoc(documentType);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        toast.error("User not found. Please login again.");
        setUploadingDoc(null);
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("documentType", documentType);
      formData.append("file", file);

      const response = await api.post("/onboarding/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data?.success) {
        toast.success("Document uploaded successfully!");
        // Refresh onboarding data to show the new document
        fetchOnboardingData();
      } else {
        toast.error(response.data?.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to upload document. Please try again.";
      toast.error(errorMessage);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Document configuration for rendering
  const documentConfig = [
    {
      key: "gst_certificate",
      label: "GST Certificate",
      pathKey: "gstCertificatePath",
      refKey: "gstCertificate"
    },
    {
      key: "shop_registration_certificate",
      label: "Shop Registration",
      pathKey: "shopRegistrationCertificatePath",
      refKey: "shopRegistrationCertificate"
    },
    {
      key: "pan_card",
      label: "PAN Card",
      pathKey: "panCardPath",
      refKey: "panCard"
    },
    {
      key: "aadhaar_card",
      label: "Aadhaar Card",
      pathKey: "aadhaarCardPath",
      refKey: "aadhaarCard"
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading onboarding details...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Onboarding Details</h2>
              </div>
              <p className="text-purple-100">
                View and manage your business onboarding information
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={analyzeWithAI}
                disabled={aiAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors border border-white/30 disabled:opacity-50"
              >
                {aiAnalyzing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                AI Analysis
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors shadow-lg"
              >
                <Edit3 size={16} />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Profile Completion</span>
            <span className="text-sm font-bold text-indigo-600">{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              {onboardingData?.personalInfoCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <span className="text-sm text-gray-600">Personal Info</span>
            </div>
            <div className="flex items-center gap-2">
              {onboardingData?.shopDetailsCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <span className="text-sm text-gray-600">Shop Details</span>
            </div>
            <div className="flex items-center gap-2">
              {onboardingData?.documentsUploaded ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <span className="text-sm text-gray-600">Documents</span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="p-6 bg-gray-50 flex flex-wrap gap-3">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            onboardingData?.isCompleted 
              ? "bg-green-100 text-green-700" 
              : "bg-amber-100 text-amber-700"
          }`}>
            {onboardingData?.isCompleted ? (
              <>
                <CheckCircle size={16} />
                Completed
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                In Progress
              </>
            )}
          </span>
          {onboardingData?.isSkipped && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              <AlertCircle size={16} />
              Skipped Initially
            </span>
          )}
          {onboardingData?.completedAt && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              <Calendar size={16} />
              Completed: {formatDate(onboardingData.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  suggestion.type === 'warning' 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  suggestion.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                  <button className="text-sm font-medium text-purple-600 hover:text-purple-700 mt-1">
                    {suggestion.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={businessInfo.fullName || ""}
                  onChange={(e) => handleEditChange('fullName', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{businessInfo.fullName || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={businessInfo.phone || ""}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{businessInfo.phone || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Email Address</label>
              <p className="text-gray-900 font-medium">{businessInfo.email || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Shop Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Shop Details</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Shop Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={businessInfo.shopName || ""}
                  onChange={(e) => handleEditChange('shopName', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{businessInfo.shopName || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Shop Address</label>
              {isEditing ? (
                <textarea
                  value={businessInfo.shopAddress || ""}
                  onChange={(e) => handleEditChange('shopAddress', e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{businessInfo.shopAddress || "Not provided"}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Shop Type</label>
                {isEditing ? (
                  <select
                    value={businessInfo.shopType || ""}
                    onChange={(e) => handleEditChange('shopType', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="convenience">Convenience Store</option>
                    <option value="departmental">Departmental Store</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium capitalize">{businessInfo.shopType || "Not specified"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Established Year</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={businessInfo.establishedYear || ""}
                    onChange={(e) => handleEditChange('establishedYear', e.target.value)}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{businessInfo.establishedYear || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Business Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">GST Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={businessInfo.gstNumber || ""}
                    onChange={(e) => handleEditChange('gstNumber', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium font-mono text-sm">{businessInfo.gstNumber || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">PAN Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={businessInfo.panNumber || ""}
                    onChange={(e) => handleEditChange('panNumber', e.target.value)}
                    placeholder="AAAAA0000A"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium font-mono text-sm">{businessInfo.panNumber || "Not provided"}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Business Category</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={businessInfo.businessCategory || ""}
                    onChange={(e) => handleEditChange('businessCategory', e.target.value)}
                    placeholder="e.g., Retail, Wholesale"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{businessInfo.businessCategory || "Not specified"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Employee Count</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={businessInfo.employeeCount || ""}
                    onChange={(e) => handleEditChange('employeeCount', e.target.value)}
                    min="1"
                    placeholder="e.g., 5"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{businessInfo.employeeCount || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Upload className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Uploaded Documents</h3>
          </div>
          <div className="space-y-3">
            {documentConfig.map((doc) => {
              const docPath = onboardingData?.[doc.pathKey];
              const isUploading = uploadingDoc === doc.key;
              
              return (
                <div key={doc.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {docPath ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    <span className="text-sm text-gray-700">{doc.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {docPath && (
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/${docPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View <ExternalLink size={14} />
                      </a>
                    )}
                    <input
                      type="file"
                      ref={fileInputRefs[doc.refKey]}
                      onChange={(e) => handleDocumentUpload(doc.key, e.target.files[0])}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRefs[doc.refKey]?.current?.click()}
                      disabled={isUploading}
                      className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        docPath 
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      } disabled:opacity-50`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Uploading...
                        </>
                      ) : docPath ? (
                        <>
                          <Upload size={14} />
                          Replace
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Upload documents in any format. No file size restrictions.
          </p>
        </div>
      </div>

      {/* Save Button (when editing) */}
      {isEditing && (
        <div className="fixed bottom-6 right-6 flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200 shadow-lg"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg"
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
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Calendar className="w-5 h-5 text-cyan-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Onboarding Timeline</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
            <div>
              <p className="font-medium text-gray-900">Onboarding Started</p>
              <p className="text-sm text-gray-500">{formatDate(onboardingData?.createdAt)}</p>
            </div>
          </div>
          {onboardingData?.personalInfoCompleted && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <p className="font-medium text-gray-900">Personal Information Completed</p>
              </div>
            </div>
          )}
          {onboardingData?.shopDetailsCompleted && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="font-medium text-gray-900">Shop Details Completed</p>
              </div>
            </div>
          )}
          {onboardingData?.documentsUploaded && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5" />
              <div>
                <p className="font-medium text-gray-900">Documents Uploaded</p>
              </div>
            </div>
          )}
          {onboardingData?.isCompleted && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5" />
              <div>
                <p className="font-medium text-gray-900">Onboarding Completed</p>
                <p className="text-sm text-gray-500">{formatDate(onboardingData?.completedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;