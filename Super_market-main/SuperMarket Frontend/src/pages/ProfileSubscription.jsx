import React, { useState, useEffect } from "react";
import {
  Crown, Clock, RefreshCw, Loader2, Check, X, AlertCircle, Zap
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";
import PricingCard from "../components/PricingCard";

const ProfileSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    try {
      const adminRaw = localStorage.getItem("admin");
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        if (admin?.id) return admin.id;
      }
    } catch { /* ignore */ }
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user?.id) return user.id;
      }
    } catch { /* ignore */ }
    return null;
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const headers = {};
        const userId = getUserId();
        if (userId) headers["userId"] = userId;
        const response = await api.get("/subscription", { headers });
        setSubscription(response.data);
      } catch (err) {
        console.error("Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  useEffect(() => {
    const fetchAvailablePlans = async () => {
      setPlansLoading(true);
      try {
        const response = await api.get("/subscription-plans/active");
        setAvailablePlans(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setAvailablePlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    if (showPlans) fetchAvailablePlans();
  }, [showPlans]);

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
      if (remainingMs <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, percentUsed: 100, percentLeft: 0 };
      }
      const secs = Math.floor(remainingMs / 1000);
      const days = Math.floor(secs / 86400);
      const hours = Math.floor((secs % 86400) / 3600);
      const minutes = Math.floor((secs % 3600) / 60);
      const seconds = secs % 60;
      let percentUsed = 0;
      if (total > 0) {
        percentUsed = Math.min(100, Math.max(0, Math.round(((Date.now() - startDate.getTime()) / total) * 100)));
      }
      return { expired: false, days, hours, minutes, seconds, percentUsed, percentLeft: Math.max(0, 100 - percentUsed) };
    };

    if (subscription) {
      const end = subscription.endDate || subscription.end_date;
      const start = subscription.startDate || subscription.start_date;
      const update = () => setTimeLeft(computeTimeLeft(start, end));
      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    }
  }, [subscription]);

  const handleSelectPlan = async (plan) => {
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }
      const headers = { userId: userId.toString() };
      const response = await api.post(`/subscription/subscribe/${plan.id}`, {}, { headers });
      const { order, plan: planData } = response.data || {};
      const isFree = (planData && Number(planData.price) === 0) || Number(plan.price) === 0;
      if (!order || isFree) {
        toast.success("Subscription activated successfully!");
        const resp = await api.get("/subscription", { headers });
        setSubscription(resp.data);
        setShowPlans(false);
        return;
      }
      toast.success("Please complete payment to activate subscription.");
    } catch (err) {
      console.error("Error subscribing:", err);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Crown className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Subscription</h2>
              </div>
              <p className="text-amber-100">
                Manage your subscription plan and billing
              </p>
            </div>
            <button
              onClick={() => setShowPlans(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-colors shadow-lg"
            >
              <Zap size={18} />
              Change Plan
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {subscription ? (
            <div className="space-y-6">
              {/* Plan Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {subscription.planName || subscription.plan_name}
                    </h3>
                    <p className="text-sm text-gray-500">{subscription.description}</p>
                  </div>
                </div>
                <span className={`mt-3 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-semibold ${
                  subscription.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  subscription.status === "TRIAL" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {subscription.status}
                </span>
              </div>

              {/* Time Remaining */}
              {timeLeft && !timeLeft.expired && (
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-blue-600" size={20} />
                    <span className="font-medium text-gray-900">Time Remaining</span>
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${timeLeft.percentLeft}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {timeLeft.percentUsed}% used • {timeLeft.percentLeft}% remaining
                  </p>
                </div>
              )}

              {/* Plan Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Max Products</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {subscription.maxProducts === -1 ? "Unlimited" : subscription.maxProducts}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Max Users</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {subscription.maxUsers === -1 ? "Unlimited" : subscription.maxUsers}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Started</p>
                  <p className="font-semibold text-gray-900">
                    {subscription.startDate || subscription.start_date || "—"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Expires</p>
                  <p className="font-semibold text-gray-900">
                    {subscription.endDate || subscription.end_date || "—"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Choose a plan to get full access to all features and start managing your store efficiently.
              </p>
              <button
                onClick={() => setShowPlans(true)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/25"
              >
                Choose a Plan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
              <button
                onClick={() => setShowPlans(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {plansLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading plans...</p>
                </div>
              ) : availablePlans.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No plans available at the moment
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {availablePlans.map((plan) => (
                    <PricingCard
                      key={plan.id}
                      title={plan.planName || plan.name}
                      price={plan.price ? `₹${plan.price}` : plan.monthly || ""}
                      frequencyLabel={plan.durationDays ? `/${plan.durationDays} days` : ""}
                      features={(plan.description || "").split("\n").filter(Boolean)}
                      recommended={plan.isPopular || plan.recommended}
                      onSelect={() => handleSelectPlan(plan)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSubscription;