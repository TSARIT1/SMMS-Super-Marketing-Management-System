 import React, { useState, useEffect } from "react";
import {
  Percent, Save, Plus, Trash2, Gift, Star, Tag,
  Loader2, Info, Check, X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

const ProfileDiscounts = () => {
  const [profile, setProfile] = useState({
    discount_offers: [],
    loyalty_points_enabled: false,
    loyalty_points_rate: 1,
    referral_discount: 0,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newOffer, setNewOffer] = useState({ name: "", discount_percent: "", min_purchase: "" });

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
          // Parse discount_offers if it's a JSON string
          let discountOffers = [];
          if (resp.data.discount_offers) {
            try {
              discountOffers = typeof resp.data.discount_offers === 'string' 
                ? JSON.parse(resp.data.discount_offers) 
                : resp.data.discount_offers;
            } catch (e) {
              console.warn("Failed to parse discount_offers:", e);
              discountOffers = [];
            }
          }
          
          setProfile((prev) => ({ 
            ...prev, 
            ...resp.data,
            discount_offers: discountOffers,
            // Ensure these fields have default values
            loyalty_points_enabled: resp.data.loyalty_points_enabled ?? false,
            loyalty_points_rate: resp.data.loyalty_points_rate ?? 1,
            referral_discount: resp.data.referral_discount ?? 0,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load discount settings");
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
      toast.success(`${field.replace(/_/g, " ")} ${newValue ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error("Failed to update:", err);
      setProfile({ ...profile, [field]: !newValue });
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const handleAddOffer = () => {
    if (!newOffer.name || !newOffer.discount_percent) {
      toast.error("Please fill in offer name and discount percentage");
      return;
    }
    const offers = [...(profile.discount_offers || []), { ...newOffer, id: Date.now() }];
    setProfile({ ...profile, discount_offers: offers });
    setNewOffer({ name: "", discount_percent: "", min_purchase: "" });
    toast.success("Offer added! Click 'Save All Changes' to persist.");
  };

  const handleRemoveOffer = (id) => {
    const offers = (profile.discount_offers || []).filter((o) => o.id !== id);
    setProfile({ ...profile, discount_offers: offers });
  };

  const handleSaveOffers = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      const accountEmail = getAccountEmail();
      if (!accountEmail) return;
      form.append("account_email", accountEmail);
      form.append("discount_offers", JSON.stringify(profile.discount_offers));
      form.append("loyalty_points_enabled", profile.loyalty_points_enabled);
      form.append("loyalty_points_rate", profile.loyalty_points_rate);
      form.append("referral_discount", profile.referral_discount);
      await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Discount settings saved successfully!");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save discount settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading discount settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Discount Configuration</h2>
          </div>
          <p className="text-orange-100">
            Manage loyalty programs, referral discounts, and special offers
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Loyalty Points */}
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${profile.loyalty_points_enabled ? "bg-amber-100" : "bg-gray-100"}`}>
                  <Star className={`w-6 h-6 ${profile.loyalty_points_enabled ? "text-amber-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Loyalty Points Program</h3>
                  <p className="text-sm text-gray-500">Reward customers with points on purchases</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("loyalty_points_enabled")}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  profile.loyalty_points_enabled ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    profile.loyalty_points_enabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            
            {profile.loyalty_points_enabled && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-amber-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Rate (points per ₹1 spent)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={profile.loyalty_points_rate}
                    onChange={(e) => setProfile({ ...profile, loyalty_points_rate: parseFloat(e.target.value) || 0 })}
                    className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-gray-500 text-sm">points per ₹1</span>
                </div>
              </div>
            )}
          </div>

          {/* Referral Discount */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Referral Discount</h3>
                <p className="text-sm text-gray-500">Discount for customers who are referred</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Discount Percentage
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={profile.referral_discount}
                  onChange={(e) => setProfile({ ...profile, referral_discount: parseFloat(e.target.value) || 0 })}
                  className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500 text-sm">% discount</span>
              </div>
            </div>
          </div>

          {/* Special Offers */}
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Tag className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Special Offers</h3>
                <p className="text-sm text-gray-500">Create and manage promotional offers</p>
              </div>
            </div>

            {/* Existing Offers */}
            {(profile.discount_offers || []).length > 0 && (
              <div className="space-y-3 mb-4">
                {(profile.discount_offers || []).map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 group hover:border-rose-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <Tag className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{offer.name}</p>
                        <p className="text-sm text-gray-500">
                          <span className="text-rose-600 font-semibold">{offer.discount_percent}% off</span>
                          {offer.min_purchase && ` • Min purchase: ₹${offer.min_purchase}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOffer(offer.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Offer Form */}
            <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-700 mb-3">Add New Offer</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Offer name"
                  value={newOffer.name}
                  onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={newOffer.discount_percent}
                  onChange={(e) => setNewOffer({ ...newOffer, discount_percent: e.target.value })}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
                <input
                  type="number"
                  placeholder="Min purchase (₹)"
                  value={newOffer.min_purchase}
                  onChange={(e) => setNewOffer({ ...newOffer, min_purchase: e.target.value })}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <button
                onClick={handleAddOffer}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
              >
                <Plus size={18} />
                Add Offer
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleSaveOffers}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl p-5 border border-orange-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Info className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Discount Tips</h3>
            <p className="text-gray-600 text-sm">
              Loyalty points encourage repeat purchases. Referral discounts help grow your customer base. 
              Special offers can be used for seasonal promotions and clearance sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDiscounts;