import React, { useState, useEffect } from "react";
import {
  Edit3,
  LogOut,
  Store,
  CreditCard,
  MapPin,
  Building,
  Phone,
  Mail,
  Globe,
  Clock,
  MessageSquare,
  Shield,
  Star,
  Camera,
  Upload,
  Save,
  X,
  Crown,
  Zap,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PricingCard from "../components/PricingCard";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import api from "../utils/api";
import PendingPaymentStatus from "../components/PendingPaymentStatus";
import IconButton from "../components/ui/IconButton";
import Badge from "../components/ui/Badge";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [categoriesText, setCategoriesText] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [_availablePlans, setAvailablePlans] = useState([]);
  const [_plansLoading, setPlansLoading] = useState(false);
  const [_plansError, setPlansError] = useState(false);
  const [_showPlans, setShowPlans] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const navigate = useNavigate();

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [aiSupportPrompt, setAiSupportPrompt] = useState("");
  const [aiSupportSuggestions, setAiSupportSuggestions] = useState([]);
  const [aiSupportLoading, setAiSupportLoading] = useState(false);

  // Fetch user support tickets
  const fetchSupportTickets = async () => {
    try {
      setTicketsLoading(true);
      let userId;
      try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          userId = u?.id;
        }
      } catch (err) {
        console.debug("Failed to parse user from localStorage", err);
      }
      if (!userId) userId = localStorage.getItem("userId") || "1";
      const response = await api.get(`/tickets/user/${userId}`);
      setSupportTickets(response.data || []);
    } catch (err) {
      console.error("Error fetching support tickets:", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const runSupportAiAssist = (prompt, openModal) => {
    const trimmed = (prompt || "").trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    setAiSupportLoading(true);

    let category = "General";
    if (normalized.includes("payment") || normalized.includes("billing")) {
      category = "Billing";
    } else if (normalized.includes("login") || normalized.includes("password")) {
      category = "Account";
    } else if (normalized.includes("inventory") || normalized.includes("stock")) {
      category = "Inventory";
    } else if (normalized.includes("order") || normalized.includes("cart")) {
      category = "Orders";
    } else if (normalized.includes("subscription") || normalized.includes("plan")) {
      category = "Subscription";
    }

    let priority = "MEDIUM";
    if (
      normalized.includes("urgent") ||
      normalized.includes("crash") ||
      normalized.includes("error") ||
      normalized.includes("failed")
    ) {
      priority = "HIGH";
    } else if (normalized.includes("how") || normalized.includes("question")) {
      priority = "LOW";
    }

    const subject = `${category} support: ${trimmed.slice(0, 48)}${
      trimmed.length > 48 ? "..." : ""
    }`;
    const description = [
      `Issue summary: ${trimmed}`,
      "",
      "Steps to reproduce:",
      "1. ",
      "2. ",
      "",
      "Expected result:",
      "",
      "Actual result:",
    ].join("\n");

    const suggestions = [];
    if (category === "Billing") {
      suggestions.push(
        "Check your payment gateway settings and recent payment status.",
        "Verify subscription status in the Plans page.",
        "Confirm billing email and invoice details are correct.",
      );
    } else if (category === "Account") {
      suggestions.push(
        "Try logging out and back in to refresh your session.",
        "Reset your password if login fails.",
        "Confirm your email is verified and correct.",
      );
    } else if (category === "Inventory") {
      suggestions.push(
        "Check stock levels and category filters.",
        "Refresh the inventory list and retry the action.",
        "Confirm product SKU and pricing details.",
      );
    } else if (category === "Orders") {
      suggestions.push(
        "Confirm the cart items and quantities.",
        "Retry placing the order after refresh.",
        "Check delivery and payment settings.",
      );
    } else {
      suggestions.push(
        "Refresh the page and try the action again.",
        "Provide screenshots or steps for faster support.",
        "Include any error message text if available.",
      );
    }

    setTimeout(() => {
      setAiSupportSuggestions(suggestions);
      setSupportForm((prev) => ({
        ...prev,
        subject,
        description,
        priority,
        category,
      }));
      setAiSupportLoading(false);
      if (openModal) setShowSupportModal(true);
    }, 500);
  };

  const [profile, setProfile] = useState({
    // Store Basic Information
    shop_name: "FreshMart Superstore",
    shop_type: "Supermarket",
    tagline: "Your Daily Needs, Delivered Fresh",
    established_year: "2018",
    professional_number: null, // Professional ID like TITSMMS001

    // AI Configuration
    ai_mode: "manual", // "manual" or "auto"
    ai_enabled: true,
    voice_ai_enabled: true,
    auto_inventory_management: false,
    auto_order_processing: false,
    ai_load_balancing: true,

    // Billing Configuration
    billing_mode: "manual", // "manual" or "ai"
    auto_billing_confirm: false,
    paper_size: "80mm", // "58mm", "80mm", "A4", "A5"

    // Contact Information
    shop_address: "123, Market Road, Madanapalle, Andhra Pradesh - 517325",
    phone_number: "+91 9491301258",
    email: "info@tsaritservices.com",
    website: "www.freshmart.com",

    // Business Hours
    opening_time: "07:00",
    closing_time: "22:00",
    working_days: "Monday to Sunday",

    // Store Features
    delivery_available: true,
    home_delivery: true,
    parking_available: true,
    accepts_online_orders: true,

    // Payment Information
    bank_account_name: "FreshMart Superstore",
    bank_account_number: "12345678901234",
    bank_name: "State Bank of India",
    ifsc_code: "SBIN0001234",
    upi_id: "freshmart@oksbi",

    // Business Registration Details
    gst_number: "29ABCDE1234F1Z5",
    tin_number: "12345678901",
    pan_number: "ABCDE1234F",
    
    // Tax Configuration
    tax_rate: 10, // Tax rate in percentage (e.g., 10 for 10%)
    gst_enabled: true,
    
    // Payment Gateway Configuration - Paytm
    paytm_merchant_id: "",
    paytm_merchant_key: "",
    paytm_webhook_url: "",
    paytm_enabled: false,
    
    // Payment Gateway Configuration - PhonePe
    phonepe_merchant_id: "",
    phonepe_salt_key: "",
    phonepe_salt_index: "",
    phonepe_enabled: false,
    
    // Payment Gateway Configuration - Razorpay
    razorpay_key_id: "",
    razorpay_key_secret: "",
    razorpay_webhook_secret: "",
    razorpay_enabled: false,
    
    // Payment Gateway Configuration - PayU Money
    payu_merchant_key: "",
    payu_salt: "",
    payu_enabled: false,
    cin_number: "U74999MH2021PTC123456",

    // Discount Information
    discount_offers: "10% off on first order | 5% cashback above ₹1000",

    // Additional Payment Methods
    accepted_payment_methods: [
      "Cash",
      "UPI",
      "Credit Card",
      "Debit Card",
      "Net Banking",
    ],

    // Store Categories
    product_categories: [
      "Groceries",
      "Fresh Produce",
      "Dairy",
      "Beverages",
      "Snacks",
      "Household",
    ],

    // Social Media
    facebook: "freshmart_superstore",
    instagram: "@freshmart_official",
    google_business_rating: "",

    // Store Capacity
    store_area: "2500",
    employees_count: "15",

    // Files
    qr_code: null,
    profile_photo:
      "https://www.sigmaonline.in/wp-content/themes/estore/images/placeholder-shop.jpg",
    store_photos: [],
  });

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleArrayChange = (field, value, checked) => {
    if (checked) {
      setProfile({
        ...profile,
        [field]: [...profile[field], value],
      });
    } else {
      setProfile({
        ...profile,
        [field]: profile[field].filter((item) => item !== value),
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      if (e.target.name === "qr_code") {
        setQrPreview(fileURL);
        setQrFile(file);
      }
      if (e.target.name === "profile_photo") {
        setPhotoPreview(fileURL);
        setProfilePhotoFile(file);
      }
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
    const bankAcc = (profile.bank_account_number || "").trim();
    const ifsc = (profile.ifsc_code || "").trim().toUpperCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/; // allow optional + and 7-15 digits
    const bankRegex = /^[0-9]{6,18}$/; // 6-18 digits
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i; // Standard IFSC pattern

    if (!email || !emailRegex.test(email)) errors.email = "Enter a valid email";
    if (!phone || !phoneRegex.test(phone))
      errors.phone_number = "Enter a valid phone number";
    if (bankAcc && !bankRegex.test(bankAcc))
      errors.bank_account_number = "Enter a valid account number (6-18 digits)";
    if (ifsc && !ifscRegex.test(ifsc))
      errors.ifsc_code = "IFSC should match format (AAAA0######)";
    return Object.keys(errors).length ? errors : null;
  };

  const handleSave = async () => {
    const errors = validateProfile();
    if (errors) {
      setValidationErrors(errors);
      toast.error("Please fix validation errors");
      return;
    }

    setSaving(true);
    try {
      // Prepare form data
      const form = new FormData();
      // Ensure email present
      let email = profile.email || null;
      if (!email) {
        try {
          const adminRaw = localStorage.getItem("admin");
          if (adminRaw) {
            const admin = JSON.parse(adminRaw);
            if (admin && admin.email) email = admin.email;
          }
        } catch {
          /* ignore */
        }
      }
      if (!email) {
        try {
          const userRaw = localStorage.getItem("user");
          if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user && user.email) email = user.email;
          }
        } catch {
          /* ignore */
        }
      }
      if (!email) {
        setSaving(false);
        toast.error("Could not determine user email to save profile.");
        return;
      }
      form.append("email", email);

      // Append simple fields
      const keysToAppend = [
        "shop_name",
        "shop_type",
        "tagline",
        "established_year",
        "shop_address",
        "phone_number",
        "website",
        "opening_time",
        "closing_time",
        "working_days",
        "bank_account_name",
        "bank_account_number",
        "bank_name",
        "ifsc_code",
        "upi_id",
        "gst_number",
        "tin_number",
        "pan_number",
        "cin_number",
        "discount_offers",
        "facebook",
        "instagram",
        "google_business_rating",
        "store_area",
        "employees_count",
        // Tax Configuration
        "tax_rate",
        // Payment Gateway - Paytm
        "paytm_merchant_id",
        "paytm_merchant_key",
        "paytm_webhook_url",
        // Payment Gateway - PhonePe
        "phonepe_merchant_id",
        "phonepe_salt_key",
        "phonepe_salt_index",
        // Payment Gateway - Razorpay
        "razorpay_key_id",
        "razorpay_key_secret",
        "razorpay_webhook_secret",
        // Payment Gateway - PayU Money
        "payu_merchant_key",
        "payu_salt",
        // AI Configuration fields
        "ai_mode",
        // AI Billing fields
        "billing_mode",
        "paper_size",
      ];
      keysToAppend.forEach((k) => {
        if (profile[k] !== undefined && profile[k] !== null)
          form.append(k, profile[k]);
      });

      // Booleans - append in camelCase and snake_case for compatibility
      const boolMap = {
        home_delivery: "homeDelivery",
        parking_available: "parkingAvailable",
        accepts_online_orders: "acceptsOnlineOrders",
        delivery_available: "deliveryAvailable",
        gst_enabled: "gstEnabled",
        ai_enabled: "aiEnabled",
        voice_ai_enabled: "voiceAiEnabled",
        auto_inventory_management: "autoInventoryManagement",
        auto_order_processing: "autoOrderProcessing",
        ai_load_balancing: "aiLoadBalancing",
        auto_billing_confirm: "autoBillingConfirm",
        paytm_enabled: "paytmEnabled",
        phonepe_enabled: "phonepeEnabled",
        razorpay_enabled: "razorpayEnabled",
        payu_enabled: "payuEnabled",
      };
      Object.keys(boolMap).forEach((snake) => {
        const camel = boolMap[snake];
        if (profile[snake] !== undefined) {
          form.append(camel, profile[snake]);
          form.append(snake, profile[snake]);
        }
      });

      // Arrays
      (profile.accepted_payment_methods || []).forEach((pm) =>
        form.append("accepted_payment_methods", pm),
      );

      // Product categories from categoriesText if present, else from profile array
      const cats =
        categoriesText && categoriesText.trim()
          ? categoriesText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : profile.product_categories || [];
      cats.forEach((c) => form.append("product_categories", c));

      // Files
      if (profilePhotoFile) form.append("profile_photo", profilePhotoFile);
      if (qrFile) form.append("qr_code", qrFile);

      // Send update
      const resp = await api.put("/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = resp.data || {};
      setProfile((prev) => ({ ...prev, ...data }));
      setPhotoPreview(data.profile_photo || photoPreview);
      setQrPreview(data.qr_code || qrPreview);
      setIsEditing(false);
      setValidationErrors({});
      toast.success("✅ Store profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: "", description: "", priority: "MEDIUM", category: "General" });
  const [supportFiles, setSupportFiles] = useState([]);

  const handleLogout = () => setConfirmLogoutOpen(true);

  const performLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully");
    setConfirmLogoutOpen(false);
    navigate("/login");
  };

    // Helper functions for support tickets
    const getStatusIcon = (status) => {
      switch (status) {
        case "OPEN":
          return <Clock size={16} className="text-orange-500" />;
        case "IN_PROGRESS":
          return <RefreshCw size={16} className="text-blue-500" />;
        case "RESOLVED":
          return <CheckCircle size={16} className="text-green-500" />;
        case "CLOSED":
          return <X size={16} className="text-gray-500" />;
        default:
          return <AlertCircle size={16} className="text-red-500" />;
      }
    };

    const getStatusColor = (status) => {
      switch (status?.toUpperCase()) {
        case "OPEN":
          return "bg-orange-100 text-orange-800";
        case "IN_PROGRESS":
          return "bg-blue-100 text-blue-800";
        case "RESOLVED":
          return "bg-green-100 text-green-800";
        case "CLOSED":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-red-100 text-red-800";
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority?.toUpperCase()) {
        case "HIGH":
          return "bg-red-100 text-red-800";
        case "MEDIUM":
          return "bg-yellow-100 text-yellow-800";
        case "LOW":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  // AI Configuration Handlers
  const handleAIModeChange = async (mode) => {
    try {
      const updatedProfile = { ...profile, ai_mode: mode };
      setProfile(updatedProfile);

      // Save to backend
      const form = new FormData();
      let email = profile.email || null;
      if (!email) {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const admin = JSON.parse(adminRaw);
          if (admin && admin.email) email = admin.email;
        }
      }
      if (email) {
        form.append("email", email);
        form.append("ai_mode", mode);

        await api.put("/profile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(`AI mode changed to ${mode === 'auto' ? 'Auto AI' : 'Manual AI'}`);
      }
    } catch (err) {
      console.error("Failed to update AI mode:", err);
      toast.error("Failed to update AI mode");
    }
  };

  const handleAIFeatureToggle = async (feature) => {
    try {
      const currentValue = profile[feature];
      const newValue = !currentValue;
      const updatedProfile = { ...profile, [feature]: newValue };
      setProfile(updatedProfile);

      // Save to backend
      const form = new FormData();
      let email = profile.email || null;
      if (!email) {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const admin = JSON.parse(adminRaw);
          if (admin && admin.email) email = admin.email;
        }
      }
      if (email) {
        form.append("email", email);
        form.append(feature, newValue);

        await api.put("/profile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const featureName = feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        toast.success(`${featureName} ${newValue ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      console.error(`Failed to toggle ${feature}:`, err);
      toast.error(`Failed to update ${feature}`);
    }
  };

  const handlePaperSizeChange = async (size) => {
    try {
      const updatedProfile = { ...profile, paper_size: size };
      setProfile(updatedProfile);
      // send update to backend
      await api.put('/profile', { paper_size: size });
      toast.success('Paper size updated');
    } catch (err) {
      console.error('Failed to update paper size:', err);
      toast.error('Failed to update paper size');
    }
  };

  const handleBillingModeChange = async (mode) => {
    try {
      const updatedProfile = { ...profile, billing_mode: mode };
      setProfile(updatedProfile);

      // Save to backend
      const form = new FormData();
      let email = profile.email || null;
      if (!email) {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const admin = JSON.parse(adminRaw);
          if (admin && admin.email) email = admin.email;
        }
      }
      if (email) {
        form.append("email", email);
        form.append("billing_mode", mode);

        await api.put("/profile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(`Billing mode changed to ${mode === 'ai' ? 'AI' : 'Manual'}`);
      }
    } catch (err) {
      console.error("Failed to update billing mode:", err);
      toast.error("Failed to update billing mode");
    }
  };

  const handleBillingAction = async (action) => {
    try {
      switch (action) {
        case 'generate':
          toast.success("Generating bill...");
          // Add bill generation logic here
          break;
        case 'process':
          if (profile.billing_mode === 'manual' || !profile.auto_billing_confirm) {
            // Show confirmation for manual mode or when auto-confirm is disabled
            const confirmed = window.confirm("Are you sure you want to process this payment?");
            if (!confirmed) return;
          }
          toast.success("Processing payment...");
          // Add payment processing logic here
          break;
        case 'history':
          toast.info("Opening billing history...");
          // Add billing history logic here
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Failed to ${action} billing:`, err);
      toast.error(`Failed to ${action} billing`);
    }
  };

  // Fetch user subscription
  const fetchSubscription = async () => {
    try {
      const headers = {};
      try {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const a = JSON.parse(adminRaw);
          if (a && a.id) headers["userId"] = a.id;
        }
      } catch (err) {
        console.warn('Failed to parse admin info in fetchSubscription', err);
      }
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u && u.id) headers["userId"] = headers["userId"] || u.id;
        }
      } catch (err) {
        console.warn('Failed to parse user info in fetchSubscription', err);
      }

      const response = await api.get("/subscription", { headers });
      setSubscription(response.data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }
  };

  // Fetch available plans
  const fetchAvailablePlans = async () => {
    setPlansLoading(true);
    setPlansError(false);
    try {
      const response = await api.get("/subscription-plans/active");
      const plans = Array.isArray(response.data) ? response.data : [];
      setAvailablePlans(plans);
    } catch (err) {
      console.error("Error fetching available plans:", err);
      setPlansError(true);
      setAvailablePlans([]); // Ensure it's always an array
      toast.error("Failed to load subscription plans. Please try again later.");
    } finally {
      setPlansLoading(false);
    }
  };

  // Handle plan selection
  const handleSelectPlan = async (plan) => {
    try {
      // Get user ID from localStorage
      let userId = null;
      try {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const admin = JSON.parse(adminRaw);
          if (admin && admin.id) userId = admin.id;
        }
      } catch (err) {
        console.warn('Failed to parse admin info', err);
      }
      if (!userId) {
        try {
          const userRaw = localStorage.getItem("user");
          if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user && user.id) userId = user.id;
          }
        } catch (err) {
          console.warn('Failed to parse user info', err);
        }
      }

      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      const headers = { userId: userId.toString() };

      const response = await api.post(
        `/subscription/subscribe/${plan.id}`,
        {},
        { headers },
      );
      console.debug("Create subscription response:", response.data);
      const { order, plan: planData } = response.data || {};

      // If the plan is free or backend returns no order, treat as immediate activation
      const isFree =
        (planData && Number(planData.price) === 0) || Number(plan.price) === 0;
      if (!order || isFree) {
        toast.success("Subscription activated successfully.");
        await fetchSubscription();
        setShowPlans(false);
        return;
      }

      // Normalize order fields for Razorpay compatibility
      const orderId = order.orderId || order.id || order.order_id;
      const keyId = order.keyId || order.key_id || order.key;
      const amountForRzp =
        order.amount != null
          ? Number(order.amount) < 1000
            ? Number(order.amount) * 100
            : Number(order.amount)
          : undefined;

      if (!orderId || !keyId || amountForRzp === undefined) {
        toast.error("Invalid order data received from server.");
        return;
      }

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount: amountForRzp,
        currency: order.currency || order.currencyCode || "INR",
        order_id: orderId,
        name: "TSAR IT SMMS",
        description: `Subscription for ${planData?.planName || plan.planName || plan.name}`,
        handler: async function (response) {
          try {
            // Verify payment and create subscription
            await api.post("/payment/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planType: plan.planType || planData?.planType,
              amount: planData?.price || plan.price,
            });

            toast.success(
              "Payment successful! Your subscription has been activated.",
            );
            // Refresh subscription data
            await fetchSubscription();
            setShowPlans(false);
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User Name",
          email: "info@tsaritservices.com",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error creating subscription order:", err);
      const status = err?.response?.status;
      const backendMsg =
        err?.response?.data?.message || err?.response?.data?.error;
      const msg =
        backendMsg ||
        err?.message ||
        "Failed to initiate payment. Please try again.";
      toast.error(`${msg}${status ? ` (status ${status})` : ""}`);

      // If user not authenticated / backend returned 401 => prompt to login
      if (status === 401) {
        navigate("/login");
        return;
      }
    }
  };

  // Initialize data on component mount
  const location = useLocation();

  const fetchProfile = async () => {
    setFetchingProfile(true);
    try {
      // Try admin first, then user
      let email = null;
      try {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const admin = JSON.parse(adminRaw);
          if (admin && admin.email) email = admin.email;
        }
      } catch {
        /* ignore */
      }

      if (!email) {
        try {
          const userRaw = localStorage.getItem("user");
          if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user && user.email) email = user.email;
          }
        } catch {
          /* ignore */
        }
      }

      if (!email) return; // nothing to fetch

      const resp = await api.get("/profile", { params: { email } });
      const data = resp.data || {};
      // Ensure arrays exist
      if (!data.accepted_payment_methods) data.accepted_payment_methods = [];
      if (!data.product_categories) data.product_categories = [];
      setProfile((prev) => ({ ...prev, ...data }));
      setPhotoPreview(data.profile_photo || null);
      setQrPreview(data.qr_code || null);
      setCategoriesText((data.product_categories || []).join(", "));
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setFetchingProfile(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchAvailablePlans();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (location && location.state && location.state.showPlans) {
      setShowPlans(true);
      // clear state so modal does not reopen on refresh
      try {
        window.history.replaceState({}, document.title);
      } catch {
        /* ignore */
      }
    }
  }, [location]);

  // Countdown for subscription expiry (with percent used/left)
  useEffect(() => {
    const parseDate = (d) => {
      if (!d) return null;
      const maybeDate = new Date(d);
      if (!isNaN(maybeDate)) return maybeDate;
      const num = Number(d);
      if (!isNaN(num)) return new Date(num > 1e12 ? num : num * 1000);
      return null;
    };

    const computeTimeLeft = (start, end) => {
      const endDate = parseDate(end);
      if (!endDate) return null;
      const startDate = parseDate(start) || new Date();
      const total = endDate.getTime() - startDate.getTime();
      const remainingMs = endDate.getTime() - Date.now();
      if (remainingMs <= 0)
        return {
          expired: true,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          percentUsed: 100,
          percentLeft: 0,
        };
      const secs = Math.floor(remainingMs / 1000);
      const days = Math.floor(secs / 86400);
      const hours = Math.floor((secs % 86400) / 3600);
      const minutes = Math.floor((secs % 3600) / 60);
      const seconds = secs % 60;
      let percentUsed = 0;
      if (total > 0) {
        percentUsed = Math.min(
          100,
          Math.max(
            0,
            Math.round(((Date.now() - startDate.getTime()) / total) * 100),
          ),
        );
      }
      const percentLeft = Math.max(0, 100 - percentUsed);
      return {
        expired: false,
        days,
        hours,
        minutes,
        seconds,
        percentUsed,
        percentLeft,
      };
    };

    let timer;
    if (subscription) {
      const end = subscription.endDate || subscription.end_date;
      const start = subscription.startDate || subscription.start_date;
      const update = () => setTimeLeft(computeTimeLeft(start, end));
      update();
      timer = setInterval(update, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(timer);
  }, [subscription]);

  const paymentMethods = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Wallet",
    "EMI",
  ];

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <ConfirmModal
        open={confirmLogoutOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={performLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
        confirmLabel="Logout"
        cancelLabel="Cancel"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="card overflow-hidden mb-6 fade-up">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 lg:p-8 text-white relative">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <img
                    src={photoPreview || profile.profile_photo}
                    alt="Store"
                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                  <button
                    onClick={openEditModal}
                    disabled={fetchingProfile}
                    className={`absolute -bottom-2 -right-2 bg-white text-blue-600 rounded-full p-1 sm:p-2 shadow-lg hover:bg-gray-100 transition ${fetchingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Camera size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-2">
                    <Building
                      size={20}
                      className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white"
                    />
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {profile.shop_name}
                    </h2>
                    {subscription && subscription.isActive && (
                      <Badge color="green" className="ml-3">
                        Pro
                      </Badge>
                    )}
                    {fetchingProfile && (
                      <svg
                        className="ml-2 w-4 h-4 text-white animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-2">
                    {profile.tagline}
                  </p>
                  {(() => {
                    try {
                      const adminData = localStorage.getItem("admin");
                      const userData = localStorage.getItem("user");
                      const userId = adminData ? JSON.parse(adminData)?.id : userData ? JSON.parse(userData)?.id : localStorage.getItem("userId") || "N/A";
                      return (
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm">
                            <User size={12} className="sm:w-3 sm:h-3" />
                            Account ID: <span className="font-mono font-semibold">{userId}</span>
                          </span>
                        </div>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                  {profile.professional_number && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <span className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 sm:px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-lg">
                        <Shield size={14} className="sm:w-4 sm:h-4" />
                        Professional ID: {profile.professional_number}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                      <Clock size={12} className="sm:w-3 sm:h-3" />
                      Since {profile.established_year}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                      <Store size={12} className="sm:w-3 sm:h-3" />
                      {profile.store_area} sq.ft
                    </span>
                  </div>

                  {/* Categories */}
                  <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-2">
                    {(profile.product_categories || []).slice(0, 8).map((c) => (
                      <Badge key={c} color="gray" className="capitalize">
                        {c}
                      </Badge>
                    ))}
                    {(profile.product_categories || []).length > 8 && (
                      <Badge color="gray">+{(profile.product_categories || []).length - 8}</Badge>
                    )}
                  </div>
                </div>

                {/* Edit + Support Buttons */}
                <div className="flex items-center gap-3">
                  <IconButton
                    title="Edit store profile"
                    onClick={openEditModal}
                    className={`${fetchingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white text-blue-600 shadow">
                      <Edit3 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </div>
                  </IconButton>

                  <IconButton
                    title="Contact support"
                    onClick={() => navigate("/support")}
                    className=""
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-white border border-white/20">
                      <MessageSquare size={16} />
                      <span className="hidden sm:inline">Support</span>
                    </div>
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Phone
                        size={18}
                        className="sm:w-5 sm:h-5 text-blue-600"
                      />
                      Contact Information
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MapPin
                          size={14}
                          className="text-gray-500 mt-1 flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700">
                          {profile.shop_address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Phone
                          size={14}
                          className="text-gray-500 flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700">
                          {profile.phone_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Mail
                          size={14}
                          className="text-gray-500 flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700">
                          {profile.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Globe
                          size={14}
                          className="text-gray-500 flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700">
                          {profile.website}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Clock
                        size={18}
                        className="sm:w-5 sm:h-5 text-green-600"
                      />
                      Business Hours
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Opening Time:</span>
                        <span className="font-medium">
                          {profile.opening_time} AM
                        </span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Closing Time:</span>
                        <span className="font-medium">
                          {profile.closing_time} PM
                        </span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Working Days:</span>
                        <span className="font-medium">
                          {profile.working_days}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Configuration Status */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Zap
                        size={18}
                        className="sm:w-5 sm:h-5 text-purple-600"
                      />
                      AI Configuration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base text-gray-700">AI Mode:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAIModeChange('manual')}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              profile.ai_mode === 'manual'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Manual AI
                          </button>
                          <button
                            onClick={() => handleAIModeChange('auto')}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              profile.ai_mode === 'auto'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Auto AI
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">AI Features:</span>
                          <button
                            onClick={() => handleAIFeatureToggle('ai_enabled')}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              profile.ai_enabled
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {profile.ai_enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Voice AI:</span>
                          <button
                            onClick={() => handleAIFeatureToggle('voice_ai_enabled')}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              profile.voice_ai_enabled
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {profile.voice_ai_enabled ? 'On' : 'Off'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Auto Inventory:</span>
                          <button
                            onClick={() => handleAIFeatureToggle('auto_inventory_management')}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              profile.auto_inventory_management
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {profile.auto_inventory_management ? 'On' : 'Off'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Auto Orders:</span>
                          <button
                            onClick={() => handleAIFeatureToggle('auto_order_processing')}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              profile.auto_order_processing
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {profile.auto_order_processing ? 'On' : 'Off'}
                          </button>
                        </div>
                      </div>

                      {/* AI Billing System */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">AI Billing System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Billing Mode:</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleBillingModeChange('manual')}
                                className={`px-2 py-1 rounded text-xs font-medium transition ${
                                  profile.billing_mode === 'manual'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                Manual
                              </button>
                              <button
                                onClick={() => handleBillingModeChange('ai')}
                                className={`px-2 py-1 rounded text-xs font-medium transition ${
                                  profile.billing_mode === 'ai'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                AI
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Auto Confirm:</span>
                            <button
                              onClick={() => handleAIFeatureToggle('auto_billing_confirm')}
                              className={`px-3 py-1 rounded text-xs font-medium transition ${
                                profile.auto_billing_confirm
                                  ? 'bg-green-600 text-white'
                                  : 'bg-yellow-600 text-white'
                              }`}
                            >
                              {profile.auto_billing_confirm ? 'Auto' : 'Manual'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between md:col-span-2">
                            <span className="text-sm text-gray-700">Paper Size:</span>
                            <div className="flex gap-1">
                              {['58mm', '80mm', 'A4', 'A5'].map((size) => (
                                <button
                                  key={size}
                                  onClick={() => handlePaperSizeChange(size)}
                                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                                    profile.paper_size === size
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-gray-600">
                            Current Paper Size: <span className="font-semibold text-indigo-600">{profile.paper_size}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBillingAction('generate')}
                              className="px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
                              title={`Generate bill with ${profile.paper_size} paper size`}
                            >
                              Generate Bill
                            </button>
                            <button
                              onClick={() => handleBillingAction('process')}
                              className="px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                              Process Payment
                            </button>
                            <button
                              onClick={() => handleBillingAction('history')}
                              className="px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition"
                            >
                              View History
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discounts & Offers */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Star
                        size={18}
                        className="sm:w-5 sm:h-5 text-yellow-600"
                      />
                      Discounts & Offers
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm sm:text-base text-yellow-800">
                        {profile.discount_offers}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Subscription */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Crown
                        size={18}
                        className="sm:w-5 sm:h-5 text-yellow-600"
                      />
                      Subscription
                    </h3>
                    {subscription ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">
                              {subscription.planName || subscription.plan_name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {subscription.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs ${subscription.status === "ACTIVE" ? "bg-green-500 text-white" : subscription.status === "TRIAL" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                              {subscription.status}
                            </span>
                          </div>
                        </div>

                        {timeLeft &&
                          (timeLeft.expired ? (
                            <div className="mt-2 text-sm text-red-600 font-medium">
                              Subscription expired
                            </div>
                          ) : (
                            <div className="mt-2">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                  Time left:
                                </span>
                                <span className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">
                                  {timeLeft.days}d {timeLeft.hours}h{" "}
                                  {timeLeft.minutes}m {timeLeft.seconds}s
                                </span>
                              </div>

                              <div className="mt-2">
                                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                                  <div
                                    className="h-2 bg-green-500"
                                    style={{
                                      width: `${timeLeft.percentUsed}%`,
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {timeLeft.percentUsed}% used •{" "}
                                  {timeLeft.percentLeft}% left
                                </div>
                              </div>
                            </div>
                          ))}

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                          <div>
                            Max Products:{" "}
                            <span className="font-medium ml-1">
                              {subscription.maxProducts === -1
                                ? "Unlimited"
                                : subscription.maxProducts}
                            </span>
                          </div>
                          <div>
                            Max Users:{" "}
                            <span className="font-medium ml-1">
                              {subscription.maxUsers === -1
                                ? "Unlimited"
                                : subscription.maxUsers}
                            </span>
                          </div>
                          <div>
                            Started:{" "}
                            <span className="font-medium ml-1">
                              {subscription.startDate ||
                                subscription.start_date ||
                                "—"}
                            </span>
                          </div>
                          <div>
                            Expires:{" "}
                            <span className="font-medium ml-1">
                              {subscription.endDate ||
                                subscription.end_date ||
                                "—"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => setShowPlans(true)}
                            className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={() => {
                              /* TODO: implement cancel */
                            }}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <p>No active subscription.</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Enroll in any plan to get full access.
                        </p>
                        <button
                          onClick={() => setShowPlans(true)}
                          className="mt-2 inline-block px-3 py-2 bg-indigo-600 text-white rounded text-sm"
                        >
                          Choose a plan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <CreditCard
                        size={18}
                        className="sm:w-5 sm:h-5 text-purple-600"
                      />
                      Payment Information
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Bank Name
                        </span>
                        <p className="font-medium text-sm sm:text-base">
                          {profile.bank_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Account Holder
                        </span>
                        <p className="font-medium text-sm sm:text-base">
                          {profile.bank_account_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Account Number
                        </span>
                        <p className="font-medium text-sm sm:text-base">
                          {profile.bank_account_number}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          IFSC Code
                        </span>
                        <p className="font-medium text-sm sm:text-base">
                          {profile.ifsc_code}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          UPI ID
                        </span>
                        <p className="font-medium text-sm sm:text-base">
                          {profile.upi_id}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Logout Button - Bottom Center */}
              <div className="mt-6 sm:mt-8 flex justify-center">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition font-medium text-sm sm:text-base"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Modal */}
        {_showPlans && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Plans</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPlans(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div>
                {_plansLoading ? (
                  <div className="text-center text-gray-600 p-6">Loading plans...</div>
                ) : _plansError ? (
                  <div className="text-center text-red-600 p-6">Failed to load plans. Please try again later.</div>
                ) : !_availablePlans || _availablePlans.length === 0 ? (
                  <div className="text-center text-gray-600 p-6">No plans available.</div>
                ) : (
                  <div>
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={fetchAvailablePlans}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                      >
                        Retry
                      </button>
                    </div>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {_availablePlans.map((plan) => (
                        <PricingCard
                          key={plan.id}
                          title={plan.planName || plan.name}
                          price={
                            plan.price ? `₹${plan.price}` : plan.monthly || ""
                          }
                          frequencyLabel={
                            plan.durationDays ? `/${plan.durationDays} days` : ""
                          }
                          features={(plan.description || "")
                            .split("\n")
                            .filter(Boolean)}
                          recommended={plan.isPopular || plan.recommended}
                          onSelect={() => handleSelectPlan(plan)}
                          disabled={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit3 size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                  Edit Store Profile
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Form Sections */}
              <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Store Basic Information */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Store size={16} className="sm:w-4 sm:h-4" />
                    Store Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      className="input text-sm sm:text-base"
                      name="shop_name"
                      placeholder="Shop Name"
                      value={profile.shop_name}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="shop_type"
                      placeholder="Shop Type"
                      value={profile.shop_type}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="tagline"
                      placeholder="Tagline"
                      value={profile.tagline}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="established_year"
                      placeholder="Established Year"
                      value={profile.established_year}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base md:col-span-2"
                      name="shop_address"
                      placeholder="Full Address"
                      value={profile.shop_address}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base md:col-span-2"
                      name="product_categories"
                      placeholder="Product Categories (comma separated)"
                      value={categoriesText}
                      onChange={(e) => {
                        setCategoriesText(e.target.value);
                      }}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="facebook"
                      placeholder="Facebook handle"
                      value={profile.facebook || ""}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="instagram"
                      placeholder="Instagram handle"
                      value={profile.instagram || ""}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="google_business_rating"
                      placeholder="Google business rating"
                      value={profile.google_business_rating || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </section>

                {/* Contact Information */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Phone size={16} className="sm:w-4 sm:h-4" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <input
                        className="input text-sm sm:text-base"
                        name="phone_number"
                        placeholder="Phone Number"
                        value={profile.phone_number}
                        onChange={handleEditChange}
                      />
                      {validationErrors.phone_number && (
                        <div className="text-red-600 text-xs mt-1">
                          {validationErrors.phone_number}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        className="input text-sm sm:text-base"
                        name="email"
                        placeholder="Email"
                        value={profile.email}
                        onChange={handleEditChange}
                      />
                      {validationErrors.email && (
                        <div className="text-red-600 text-xs mt-1">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                    <input
                      className="input text-sm sm:text-base"
                      name="website"
                      placeholder="Website"
                      value={profile.website}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="store_area"
                      placeholder="Store Area (sq.ft)"
                      value={profile.store_area}
                      onChange={handleEditChange}
                    />
                  </div>
                </section>

                {/* Business Registration */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Building size={16} className="sm:w-4 sm:h-4" />
                    Business Registration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      className="input text-sm sm:text-base"
                      name="gst_number"
                      placeholder="GST Number"
                      value={profile.gst_number}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="pan_number"
                      placeholder="PAN Number"
                      value={profile.pan_number}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="tin_number"
                      placeholder="TIN Number"
                      value={profile.tin_number}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="cin_number"
                      placeholder="CIN Number"
                      value={profile.cin_number}
                      onChange={handleEditChange}
                    />
                  </div>
                </section>

                {/* Payment Information */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="sm:w-4 sm:h-4" />
                    Payment Information
                  </h4>

                  {/* Account-level pending payment status */}
                  <PendingPaymentStatus />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      className="input text-sm sm:text-base"
                      name="bank_name"
                      placeholder="Bank Name"
                      value={profile.bank_name}
                      onChange={handleEditChange}
                    />
                    <input
                      className="input text-sm sm:text-base"
                      name="bank_account_name"
                      placeholder="Account Holder Name"
                      value={profile.bank_account_name}
                      onChange={handleEditChange}
                    />
                    <div>
                      <input
                        className="input text-sm sm:text-base"
                        name="bank_account_number"
                        placeholder="Account Number"
                        value={profile.bank_account_number}
                        onChange={handleEditChange}
                      />
                      {validationErrors.bank_account_number && (
                        <div className="text-red-600 text-xs mt-1">
                          {validationErrors.bank_account_number}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        className="input text-sm sm:text-base"
                        name="ifsc_code"
                        placeholder="IFSC Code"
                        value={profile.ifsc_code}
                        onChange={handleEditChange}
                      />
                      {validationErrors.ifsc_code && (
                        <div className="text-red-600 text-xs mt-1">
                          {validationErrors.ifsc_code}
                        </div>
                      )}
                    </div>
                    <input
                      className="input text-sm sm:text-base"
                      name="upi_id"
                      placeholder="UPI ID"
                      value={profile.upi_id}
                      onChange={handleEditChange}
                    />
                  </div>

                  {/* Accepted Payment Methods */}
                  <div className="mt-3 sm:mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accepted Payment Methods
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs sm:text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={profile.accepted_payment_methods.includes(
                              method,
                            )}
                            onChange={(e) =>
                              handleArrayChange(
                                "accepted_payment_methods",
                                method,
                                e.target.checked,
                              )
                            }
                            className="rounded"
                          />
                          <span>{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* AI Configuration */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Zap size={16} className="sm:w-4 sm:h-4" />
                    AI Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Mode
                      </label>
                      <select
                        name="ai_mode"
                        value={profile.ai_mode}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      >
                        <option value="manual">Manual AI</option>
                        <option value="auto">Auto AI</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Manual: User controls AI operations | Auto: AI handles operations automatically
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="ai_enabled"
                        checked={profile.ai_enabled}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span className="text-sm sm:text-base">Enable AI Features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="voice_ai_enabled"
                        checked={profile.voice_ai_enabled}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span className="text-sm sm:text-base">Enable Voice AI Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="auto_inventory_management"
                        checked={profile.auto_inventory_management}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span className="text-sm sm:text-base">Auto Inventory Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="auto_order_processing"
                        checked={profile.auto_order_processing}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span className="text-sm sm:text-base">Auto Order Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="ai_load_balancing"
                        checked={profile.ai_load_balancing}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span className="text-sm sm:text-base">AI Load Balancing</span>
                    </div>
                  </div>
                </section>

                {/* Tax/GST Configuration */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="sm:w-4 sm:h-4" />
                    Tax & GST Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="gst_enabled"
                        checked={profile.gst_enabled}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span className="text-sm sm:text-base">Enable Tax/GST</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        className="input text-sm sm:text-base"
                        name="tax_rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Tax Rate (e.g., 10 for 10%)"
                        value={profile.tax_rate || 10}
                        onChange={handleEditChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set your business tax/GST rate (0-100%)
                      </p>
                    </div>
                  </div>
                </section>

                {/* Payment Gateway Configuration */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="sm:w-4 sm:h-4" />
                    Payment Gateway Integration
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure your payment gateway credentials to accept online payments through UPI, Cards, and Net Banking.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Paytm */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Paytm
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="input text-sm"
                          name="paytm_merchant_id"
                          placeholder="Merchant ID"
                          value={profile.paytm_merchant_id || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm"
                          name="paytm_merchant_key"
                          type="password"
                          placeholder="Merchant Key"
                          value={profile.paytm_merchant_key || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm md:col-span-2"
                          name="paytm_webhook_url"
                          placeholder="Webhook URL (optional)"
                          value={profile.paytm_webhook_url || ""}
                          onChange={handleEditChange}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="paytm_enabled"
                            checked={profile.paytm_enabled || false}
                            onChange={handleEditChange}
                            className="rounded"
                          />
                          <span>Enable Paytm Payments</span>
                        </label>
                      </div>
                    </div>

                    {/* PhonePe */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        PhonePe
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="input text-sm"
                          name="phonepe_merchant_id"
                          placeholder="Merchant ID"
                          value={profile.phonepe_merchant_id || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm"
                          name="phonepe_salt_key"
                          type="password"
                          placeholder="Salt Key"
                          value={profile.phonepe_salt_key || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm"
                          name="phonepe_salt_index"
                          placeholder="Salt Index"
                          value={profile.phonepe_salt_index || ""}
                          onChange={handleEditChange}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="phonepe_enabled"
                            checked={profile.phonepe_enabled || false}
                            onChange={handleEditChange}
                            className="rounded"
                          />
                          <span>Enable PhonePe Payments</span>
                        </label>
                      </div>
                    </div>

                    {/* Razorpay */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Razorpay
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="input text-sm"
                          name="razorpay_key_id"
                          placeholder="Key ID"
                          value={profile.razorpay_key_id || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm"
                          name="razorpay_key_secret"
                          type="password"
                          placeholder="Key Secret"
                          value={profile.razorpay_key_secret || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm md:col-span-2"
                          name="razorpay_webhook_secret"
                          type="password"
                          placeholder="Webhook Secret (optional)"
                          value={profile.razorpay_webhook_secret || ""}
                          onChange={handleEditChange}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="razorpay_enabled"
                            checked={profile.razorpay_enabled || false}
                            onChange={handleEditChange}
                            className="rounded"
                          />
                          <span>Enable Razorpay Payments</span>
                        </label>
                      </div>
                    </div>

                    {/* PayU Money */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        PayU Money
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="input text-sm"
                          name="payu_merchant_key"
                          placeholder="Merchant Key"
                          value={profile.payu_merchant_key || ""}
                          onChange={handleEditChange}
                        />
                        <input
                          className="input text-sm"
                          name="payu_salt"
                          type="password"
                          placeholder="Salt"
                          value={profile.payu_salt || ""}
                          onChange={handleEditChange}
                        />
                        <label className="flex items-center gap-2 text-sm md:col-span-2">
                          <input
                            type="checkbox"
                            name="payu_enabled"
                            checked={profile.payu_enabled || false}
                            onChange={handleEditChange}
                            className="rounded"
                          />
                          <span>Enable PayU Money Payments</span>
                        </label>
                      </div>
                    </div>

                    {/* Additional Gateways Collapsed */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Additional Payment Gateways:</strong> BillDesk, JioPay, BharatPe, and Google Pay integration can be configured through backend settings. Contact support at <a href="mailto:info@tsaritservices.com" className="text-blue-600 underline">info@tsaritservices.com</a> for setup assistance.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Store Features */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Shield size={16} className="sm:w-4 sm:h-4" />
                    Store Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <label className="flex items-center gap-2 text-sm sm:text-base">
                      <input
                        type="checkbox"
                        name="home_delivery"
                        checked={profile.home_delivery}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span>Home Delivery Available</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:text-base">
                      <input
                        type="checkbox"
                        name="parking_available"
                        checked={profile.parking_available}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span>Parking Available</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:text-base">
                      <input
                        type="checkbox"
                        name="accepts_online_orders"
                        checked={profile.accepts_online_orders}
                        onChange={handleEditChange}
                        className="rounded"
                      />
                      <span>Accepts Online Orders</span>
                    </label>
                    <input
                      className="input text-sm sm:text-base"
                      name="employees_count"
                      placeholder="Number of Employees"
                      value={profile.employees_count}
                      onChange={handleEditChange}
                    />
                  </div>
                </section>

                {/* File Uploads */}
                <section>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Upload size={16} className="sm:w-4 sm:h-4" />
                    Upload Files
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Logo/Photo
                      </label>
                      <input
                        type="file"
                        name="profile_photo"
                        onChange={handleFileChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment QR Code
                      </label>
                      <input
                        type="file"
                        name="qr_code"
                        onChange={handleFileChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white font-medium flex items-center gap-2 transition text-sm sm:text-base`}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Save size={16} className="sm:w-4 sm:h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



    </>
  );
}
