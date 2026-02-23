import React, { useState, useEffect } from "react";
import PricingCard from "../components/PricingCard";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { trackEvent } from "../utils/analytics";
import { useNavigate } from "react-router-dom";
import { Store, CheckCircle2, LogIn, Menu, X, Mail, Phone } from "lucide-react";

// Public Navbar Component (similar to HomePage)
function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Store className="text-white" size={24} />
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TSAR IT SMMS
            </div>
            <div className="text-xs text-gray-500 -mt-0.5">
              Super Market Management System
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <a href="/#main" className="hover:text-indigo-600 transition-colors">
            Home
          </a>
          <a href="/#about" className="hover:text-indigo-600 transition-colors">
            About
          </a>
          <a href="/#features" className="hover:text-indigo-600 transition-colors">
            Features
          </a>
          <a href="/plans" className="text-indigo-600 font-semibold">
            Pricing
          </a>
          <a href="/#testimonials" className="hover:text-indigo-600 transition-colors">
            Testimonials
          </a>
          <a href="/#contact" className="hover:text-indigo-600 transition-colors">
            Contact
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <LogIn size={18} />
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col p-4 gap-3">
            <a href="/#main" className="py-2 hover:text-indigo-600 transition-colors">
              Home
            </a>
            <a href="/#about" className="py-2 hover:text-indigo-600 transition-colors">
              About
            </a>
            <a href="/#features" className="py-2 hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="/plans" className="py-2 text-indigo-600 font-semibold">
              Pricing
            </a>
            <a href="/#testimonials" className="py-2 hover:text-indigo-600 transition-colors">
              Testimonials
            </a>
            <a href="/#contact" className="py-2 hover:text-indigo-600 transition-colors">
              Contact
            </a>
            <hr className="my-2" />
            <button
              onClick={() => navigate("/login")}
              className="py-2 text-left text-indigo-600 hover:text-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <LogIn size={18} />
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
            >
              Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default function Plans() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState(
    () => localStorage.getItem("billing") || "monthly",
  );
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null); // { planId, orderId, amount }
  const [prefill, setPrefill] = React.useState({ name: "", email: "" });

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/subscription-plans/active");
      setPlans(res.data || []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Failed to load plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Prefill user/store info for payment forms
  useEffect(() => {
    // Try admin info from localStorage first
    try {
      const admin = JSON.parse(localStorage.getItem("admin")) || null;
      if (admin && admin.fullName)
        setPrefill((p) => ({ ...p, name: admin.fullName }));
      if (admin && admin.email)
        setPrefill((p) => ({ ...p, email: admin.email }));
    } catch {
      /* ignore */
    }

    // Best effort: try to fetch store profile for richer info
    (async () => {
      try {
        const resp = await api.get("/store/profile");
        const data = resp.data || {};
        if (data.contactName)
          setPrefill((p) => ({ ...p, name: data.contactName }));
        if (data.email) setPrefill((p) => ({ ...p, email: data.email }));
      } catch {
        // fallback to /profile
        try {
          const resp2 = await api.get("/profile");
          const data2 = resp2.data || {};
          if (data2.shop_owner)
            setPrefill((p) => ({ ...p, name: data2.shop_owner }));
          if (data2.email) setPrefill((p) => ({ ...p, email: data2.email }));
        } catch {
          /* ignore - prefill will use defaults */
        }
      }
    })();

    // Analytics: page view
    trackEvent("plans_view", { billing: billing });
  }, [billing]);

  const handleSelectPlan = async (plan) => {
    try {
      const response = await api.post(`/subscription/subscribe/${plan.id}`);
      const { order, plan: planData } = response.data || {};

      const isFree =
        (planData && Number(planData.price) === 0) || Number(plan.price) === 0;
      if (!order || isFree) {
        toast.success("Subscription activated successfully.");
        return;
      }

      const orderId = order.orderId || order.id || order.order_id;
      const keyId = order.keyId || order.key_id || order.key;
      const amountForRzp =
        order.amount != null
          ? Number(order.amount) < 1000
            ? Number(order.amount) * 100
            : Number(order.amount)
          : undefined;

      const options = {
        key: keyId,
        amount: amountForRzp,
        currency: order.currency || order.currencyCode || "INR",
        order_id: orderId,
        name: "TSAR IT SMMS",
        description: `Subscription for ${planData?.name || plan.name}`,
        handler: async function (response) {
          try {
            await api.post("/payment/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planType: plan.planType,
              amount: planData?.price || plan.price,
            });

            toast.success(
              "Payment successful! Your subscription has been activated.",
            );
            fetchPlans();
            setPendingPayment(null);
            await trackEvent("subscription_success", {
              planId: plan.id,
              orderId,
            });
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment verification failed. Please contact support.");
            setPendingPayment(null);
          }
        },
        prefill: {
          name: prefill.name || "Store Owner",
          email: prefill.email || "info@tsaritservices.com",
        },
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);
      const pendingObj = {
        planId: plan.id,
        orderId,
        amount: amountForRzp,
        currency: order.currency || "INR",
        keyId,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
        planName: plan.name,
      };
      setPendingPayment(pendingObj);
      try {
        localStorage.setItem("pendingPayment", JSON.stringify(pendingObj));
      } catch (err) {
        console.debug("Failed to persist pending payment", err);
      }

      try {
        rzp.open();
        await trackEvent("payment_initiated", { planId: plan.id, orderId });
      } catch (openErr) {
        console.error("Failed to open Razorpay:", openErr);
      }
    } catch (err) {
      console.error("Error creating subscription order:", err);
      const status = err?.response?.status;
      const backendMsg =
        err?.response?.data?.message || err?.response?.data?.error;
      const msg =
        backendMsg || err?.message || "Failed to initiate subscription.";
      toast.error(`${msg}${status ? ` (status ${status})` : ""}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto py-16 px-4">
        {/* Hero Section */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-indigo-600 border border-indigo-200 mb-6 shadow-sm">
            <CheckCircle2 size={16} />
            Simple Pricing
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Plans for Every Business Size
          </h1>
          <p className="text-xl text-gray-600">
            No hidden fees. Start small and scale as your business grows.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white rounded-2xl p-2 border border-gray-200 shadow-md">
            <button
              aria-pressed={billing === "monthly"}
              onClick={() => {
                setBilling("monthly");
                localStorage.setItem("billing", "monthly");
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              aria-pressed={billing === "yearly"}
              onClick={() => {
                setBilling("yearly");
                localStorage.setItem("billing", "yearly");
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Yearly
              <span className="ml-2 text-sm">
                {billing === "yearly" ? "(20% OFF)" : "(Save 20%)"}
              </span>
            </button>
          </div>
        </header>

        {/* Plans Grid */}
        <section className="mb-16">
          {loading ? (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <PricingCard loading />
              <PricingCard loading />
              <PricingCard loading />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg inline-block">
                {error}
              </div>
            </div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  title={plan.name || plan.title}
                  price={
                    billing === "monthly"
                      ? plan.price
                        ? `₹${plan.price}`
                        : plan.monthly
                      : plan.yearlyLabel || plan.yearly || ""
                  }
                  frequencyLabel={billing === "monthly" ? "/mo" : ""}
                  features={(plan.description || "")
                    .split("\n")
                    .filter(Boolean)}
                  recommended={plan.recommended}
                  onSelect={() => handleSelectPlan(plan)}
                  disabled={
                    pendingPayment &&
                    pendingPayment.planId !== plan.id &&
                    pendingPayment.status === "pending"
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Compare Plans Section */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-4 text-lg font-semibold text-gray-700">Feature</th>
                  <th className="py-4 px-4 text-lg font-semibold text-indigo-600">Basic</th>
                  <th className="py-4 px-4 text-lg font-semibold text-purple-600">Pro</th>
                  <th className="py-4 px-4 text-lg font-semibold text-pink-600">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Orders / month</td>
                  <td className="py-4 px-4">100</td>
                  <td className="py-4 px-4">10k</td>
                  <td className="py-4 px-4">Custom</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-4 px-4 font-medium">Support</td>
                  <td className="py-4 px-4">Community</td>
                  <td className="py-4 px-4">Priority</td>
                  <td className="py-4 px-4">Dedicated</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Reports</td>
                  <td className="py-4 px-4">Basic</td>
                  <td className="py-4 px-4">Advanced</td>
                  <td className="py-4 px-4">Advanced + Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-lg mb-8 text-indigo-100">
            Our team is here to help you find the perfect plan for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:info@tsaritservices.com"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              <Mail size={20} />
              info@tsaritservices.com
            </a>
            <a
              href="tel:+919491301258"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              <Phone size={20} />
              +91 9491301258
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">
            © 2026 TSAR IT SMMS. All rights reserved.
          </p>
          <p className="text-sm">
            Super Market Management System - Empowering retail businesses
          </p>
        </div>
      </footer>
    </div>
  );
}
