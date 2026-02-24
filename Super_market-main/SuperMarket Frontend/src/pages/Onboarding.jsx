import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  FileText,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  SkipForward,
  Save,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../utils/api";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    // Profile Information
    fullName: "",
    phone: "",
    email: "",

    // Shop Details
    shopName: "",
    shopAddress: "",
    shopType: "",
    establishedYear: "",

    // Documents
    gstCertificate: null,
    shopRegistrationCertificate: null,
    panCard: null,
    aadhaarCard: null,
    otherDocuments: [],

    // Business Information
    gstNumber: "",
    panNumber: "",
    businessCategory: "",
    employeeCount: "",
  });

  const [filePreviews, setFilePreviews] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Load user data from localStorage
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setOnboardingData(prev => ({
          ...prev,
          fullName: user.fullName || user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          shopName: user.shopName || user.shop_name || "",
          shopAddress: user.shopAddress || user.shop_address || "",
        }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOnboardingData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only JPG, PNG, or PDF files");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }

      setOnboardingData(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => ({
            ...prev,
            [fieldName]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews(prev => ({
          ...prev,
          [fieldName]: null
        }));
      }
    }
  };

  const validateStep = (currentStep) => {
    const errors = {};

    if (currentStep === 1) {
      if (!onboardingData.fullName.trim()) errors.fullName = "Full name is required";
      if (!onboardingData.phone.trim()) errors.phone = "Phone number is required";
      if (!onboardingData.email.trim()) errors.email = "Email is required";
    }

    if (currentStep === 2) {
      if (!onboardingData.shopName.trim()) errors.shopName = "Shop name is required";
      if (!onboardingData.shopAddress.trim()) errors.shopAddress = "Shop address is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSkip = () => {
    // Mark onboarding as completed but skipped
    localStorage.setItem("onboardingCompleted", "true");
    localStorage.setItem("onboardingSkipped", "true");
    navigate("/dashboard");
  };

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const adminRaw = localStorage.getItem("admin");
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        return admin?.id;
      }
    } catch { /* ignore */ }
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        return user?.id;
      }
    } catch { /* ignore */ }
    return null;
  };

  const handleComplete = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error("User session not found. Please login again.");
        navigate("/login");
        return;
      }

      const formData = new FormData();

      // Add userId first (required by backend)
      formData.append("userId", userId);

      // Add basic data
      formData.append("fullName", onboardingData.fullName);
      formData.append("email", onboardingData.email);
      formData.append("phone", onboardingData.phone);
      formData.append("shopName", onboardingData.shopName);
      formData.append("shopAddress", onboardingData.shopAddress);
      formData.append("shopType", onboardingData.shopType);
      formData.append("establishedYear", onboardingData.establishedYear);
      formData.append("gstNumber", onboardingData.gstNumber);
      formData.append("panNumber", onboardingData.panNumber);
      formData.append("businessCategory", onboardingData.businessCategory);
      formData.append("employeeCount", onboardingData.employeeCount);

      // Add files
      if (onboardingData.gstCertificate) {
        formData.append("gstCertificate", onboardingData.gstCertificate);
      }
      if (onboardingData.shopRegistrationCertificate) {
        formData.append("shopRegistrationCertificate", onboardingData.shopRegistrationCertificate);
      }
      if (onboardingData.panCard) {
        formData.append("panCard", onboardingData.panCard);
      }
      if (onboardingData.aadhaarCard) {
        formData.append("aadhaarCard", onboardingData.aadhaarCard);
      }

      // Add other documents
      onboardingData.otherDocuments.forEach((file) => {
        formData.append("otherDocuments", file);
      });

      // Submit onboarding data
      await api.post("/onboarding/complete", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Mark as completed
      localStorage.setItem("onboardingCompleted", "true");
      localStorage.setItem("onboardingSkipped", "false");

      toast.success("Onboarding completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= stepNum
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > stepNum ? <CheckCircle size={16} /> : stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`w-12 h-1 transition-colors ${
                  step > stepNum ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User size={48} className="mx-auto text-green-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={onboardingData.fullName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              validationErrors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {validationErrors.fullName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={onboardingData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              validationErrors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your phone number"
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={onboardingData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              validationErrors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email address"
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText size={48} className="mx-auto text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Shop Details</h3>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Name *
          </label>
          <input
            type="text"
            name="shopName"
            value={onboardingData.shopName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.shopName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your shop name"
          />
          {validationErrors.shopName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.shopName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Address *
          </label>
          <textarea
            name="shopAddress"
            value={onboardingData.shopAddress}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.shopAddress ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your complete shop address"
          />
          {validationErrors.shopAddress && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.shopAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Type
            </label>
            <select
              name="shopType"
              value={onboardingData.shopType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="grocery">Grocery Store</option>
              <option value="supermarket">Supermarket</option>
              <option value="convenience">Convenience Store</option>
              <option value="departmental">Departmental Store</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Established Year
            </label>
            <input
              type="number"
              name="establishedYear"
              value={onboardingData.establishedYear}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2020"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Upload size={48} className="mx-auto text-purple-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Documents & Verification</h3>
        <p className="text-gray-600">Upload your business documents (optional)</p>
      </div>

      <div className="space-y-6">
        {/* GST Certificate */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GST Certificate
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileChange(e, 'gstCertificate')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {filePreviews.gstCertificate && (
            <img
              src={filePreviews.gstCertificate}
              alt="GST Certificate Preview"
              className="mt-2 max-w-full h-32 object-cover rounded"
            />
          )}
        </div>

        {/* Shop Registration Certificate */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Registration Certificate
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileChange(e, 'shopRegistrationCertificate')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {filePreviews.shopRegistrationCertificate && (
            <img
              src={filePreviews.shopRegistrationCertificate}
              alt="Shop Registration Preview"
              className="mt-2 max-w-full h-32 object-cover rounded"
            />
          )}
        </div>

        {/* PAN Card */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Card
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileChange(e, 'panCard')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {filePreviews.panCard && (
            <img
              src={filePreviews.panCard}
              alt="PAN Card Preview"
              className="mt-2 max-w-full h-32 object-cover rounded"
            />
          )}
        </div>

        {/* Aadhaar Card */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Card
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileChange(e, 'aadhaarCard')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {filePreviews.aadhaarCard && (
            <img
              src={filePreviews.aadhaarCard}
              alt="Aadhaar Card Preview"
              className="mt-2 max-w-full h-32 object-cover rounded"
            />
          )}
        </div>

        {/* Business Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Business Information (Optional)</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="gstNumber"
              value={onboardingData.gstNumber}
              onChange={handleInputChange}
              placeholder="GST Number"
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              name="panNumber"
              value={onboardingData.panNumber}
              onChange={handleInputChange}
              placeholder="PAN Number"
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              name="businessCategory"
              value={onboardingData.businessCategory}
              onChange={handleInputChange}
              placeholder="Business Category"
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="number"
              name="employeeCount"
              value={onboardingData.employeeCount}
              onChange={handleInputChange}
              placeholder="Employee Count"
              min="1"
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-8">
      <div className="flex items-center gap-4">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <SkipForward size={16} />
          Skip for Now
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Completing...
              </>
            ) : (
              <>
                <Save size={16} />
                Complete Setup
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SuperMarket!</h1>
          <p className="text-gray-600">Let's set up your account in just a few steps</p>
        </div>

        {/* Progress Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        {renderNavigation()}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Why complete onboarding?</p>
              <p>This helps us provide you with a personalized experience and ensures compliance with business regulations. You can always update this information later in your profile settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
