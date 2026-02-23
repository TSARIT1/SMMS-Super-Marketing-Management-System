import React, { useState, useEffect } from "react";
import {
  CreditCard, Save, Edit3, Building, Landmark, Wallet,
  Loader2, Info, Check, X, User, Hash
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api";

const ProfilePayment = () => {
  const [profile, setProfile] = useState({
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    ifsc_code: "",
    upi_id: "",
    accepted_payment_methods: [],
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
        toast.error("Failed to load payment settings");
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

  const handleArrayChange = (method, checked) => {
    if (checked) {
      setProfile({ ...profile, accepted_payment_methods: [...profile.accepted_payment_methods, method] });
    } else {
      setProfile({ ...profile, accepted_payment_methods: profile.accepted_payment_methods.filter((m) => m !== method) });
    }
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
      ["bank_name", "bank_account_name", "bank_account_number", "ifsc_code", "upi_id"].forEach((k) => {
        if (profile[k] !== undefined) form.append(k, profile[k]);
      });
      (profile.accepted_payment_methods || []).forEach((pm) => form.append("accepted_payment_methods", pm));
      await api.put("/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Payment information updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save payment information.");
    } finally {
      setSaving(false);
    }
  };

  const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "EMI"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-pink-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Payment Information</h2>
              </div>
              <p className="text-pink-100">
                Manage your bank details and accepted payment methods
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-colors shadow-lg"
            >
              <Edit3 size={18} />
              Edit Details
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {isEditing ? (
            <div className="space-y-6">
              {/* Bank Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-pink-600" />
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={profile.bank_name || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      name="bank_account_name"
                      value={profile.bank_account_name || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      value={profile.bank_account_number || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifsc_code"
                      value={profile.ifsc_code || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
              </div>

              {/* UPI ID */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-pink-600" />
                  UPI ID
                </h3>
                <input
                  type="text"
                  name="upi_id"
                  value={profile.upi_id || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Enter UPI ID"
                />
              </div>

              {/* Accepted Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Check size={18} className="text-pink-600" />
                  Accepted Payment Methods
                </h3>
                <p className="text-sm text-gray-500 mb-3">Select the payment methods you accept</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => {
                    const isSelected = profile.accepted_payment_methods?.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleArrayChange(method, !isSelected)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "bg-pink-50 border-pink-300"
                            : "bg-gray-50 border-gray-200 hover:border-pink-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-pink-100" : "bg-gray-100"}`}>
                            <Check size={16} className={isSelected ? "text-pink-600" : "text-gray-400"} />
                          </div>
                          <span className={`font-medium ${isSelected ? "text-pink-700" : "text-gray-700"}`}>
                            {method}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25"
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
              {/* Bank Details Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-5 h-5 text-pink-600" />
                    <span className="text-sm text-gray-500">Bank Name</span>
                  </div>
                  <p className="font-semibold text-gray-900">{profile.bank_name || "Not specified"}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Account Holder</span>
                  </div>
                  <p className="font-semibold text-gray-900">{profile.bank_account_name || "Not specified"}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-500">Account Number</span>
                  </div>
                  <p className="font-semibold text-gray-900">{profile.bank_account_number || "Not specified"}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-gray-500">IFSC Code</span>
                  </div>
                  <p className="font-semibold text-gray-900">{profile.ifsc_code || "Not specified"}</p>
                </div>
              </div>

              {/* UPI ID */}
              <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="w-5 h-5 text-violet-600" />
                  <span className="text-sm text-gray-500">UPI ID</span>
                </div>
                <p className="font-semibold text-gray-900">{profile.upi_id || "Not specified"}</p>
              </div>

              {/* Accepted Payment Methods Display */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accepted Payment Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.accepted_payment_methods || []).length > 0 ? (
                    (profile.accepted_payment_methods || []).map((method) => (
                      <span
                        key={method}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        <Check size={14} />
                        {method}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No payment methods selected</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Info className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Payment Security</h3>
            <p className="text-gray-600 text-sm">
              Your payment information is encrypted and securely stored. Only essential banking details are required for transactions. UPI ID enables quick and easy payments from customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePayment;