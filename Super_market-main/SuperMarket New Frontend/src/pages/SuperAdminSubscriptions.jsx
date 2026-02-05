import React, { useEffect, useState } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit2, Trash2, Check, X, Crown, Star, Zap, TrendingUp, Sparkles } from "lucide-react";

export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [aiPricingInsights, setAiPricingInsights] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [formData, setFormData] = useState({
    planName: "",
    planType: "BASIC",
    price: "",
    durationDays: "",
    description: "",
    maxProducts: "-1",
    maxUsers: "-1",
    isActive: true,
    isPopular: false,
    features: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, plansRes] = await Promise.all([
        api.get("/admin/subscriptions"),
        api.get("/admin/subscription-plans"),
      ]);
      setSubscriptions(subsRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error("Failed to load subscription data", err);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      planName: "",
      planType: "BASIC",
      price: "",
      durationDays: "",
      description: "",
      maxProducts: "-1",
      maxUsers: "-1",
      isActive: true,
      isPopular: false,
      features: ""
    });
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");
      await api.post("/admin/subscription-plans", {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxProducts: parseInt(formData.maxProducts),
        maxUsers: parseInt(formData.maxUsers),
        createdBy: admin.id
      });
      toast.success("Plan created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Failed to create plan", err);
      toast.error(err.response?.data?.error || "Failed to create plan");
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/subscription-plans/${selectedPlan.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxProducts: parseInt(formData.maxProducts),
        maxUsers: parseInt(formData.maxUsers)
      });
      toast.success("Plan updated successfully!");
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Failed to update plan", err);
      toast.error(err.response?.data?.error || "Failed to update plan");
    }
  };

  const handleDeletePlan = async () => {
    try {
      await api.delete(`/admin/subscription-plans/delete/${selectedPlan.id}`);
      toast.success("Plan deleted successfully!");
      setShowDeleteModal(false);
      setSelectedPlan(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete plan", err);
      toast.error(err.response?.data?.error || "Failed to delete plan");
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      planName: plan.planName || "",
      planType: plan.planType || "BASIC",
      price: plan.price?.toString() || "",
      durationDays: plan.durationDays?.toString() || "",
      description: plan.description || "",
      maxProducts: plan.maxProducts?.toString() || "-1",
      maxUsers: plan.maxUsers?.toString() || "-1",
      isActive: plan.isActive !== false,
      isPopular: plan.isPopular || false,
      features: plan.features || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const getPlanIcon = (planType) => {
    switch (planType?.toUpperCase()) {
      case 'PREMIUM':
      case 'PLATINUM':
        return <Crown className="text-purple-600" size={24} />;
      case 'ENTERPRISE':
      case 'GOLD':
        return <Star className="text-yellow-600" size={24} />;
      case 'STANDARD':
      case 'SILVER':
        return <Zap className="text-blue-600" size={24} />;
      default:
        return <TrendingUp className="text-gray-600" size={24} />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType?.toUpperCase()) {
      case 'PREMIUM':
      case 'PLATINUM':
        return 'from-purple-500 to-indigo-600';
      case 'ENTERPRISE':
      case 'GOLD':
        return 'from-yellow-500 to-orange-600';
      case 'STANDARD':
      case 'SILVER':
        return 'from-blue-500 to-cyan-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-600">Loading subscriptions...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
            onClick={onClose}
            style={{ zIndex: 9998 }}
          ></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div 
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            style={{ zIndex: 9999, position: 'relative' }}
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
            <p className="text-gray-600 mt-1">Manage pricing plans and user subscriptions</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Create New Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Plan Header with Gradient */}
              <div className={`bg-gradient-to-r ${getPlanColor(plan.planType)} p-6 text-white relative`}>
                {plan.isPopular && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} /> Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    {getPlanIcon(plan.planType)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.planName}</h3>
                    <p className="text-sm opacity-90">{plan.planType}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{plan.price || 0}</span>
                  <span className="text-sm opacity-90 ml-2">
                    / {Math.floor((plan.durationDays || 0) / 30)} months
                  </span>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 text-sm min-h-[40px]">{plan.description || "No description"}</p>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max Products:</span>
                    <span className="font-semibold text-gray-900">
                      {plan.maxProducts === -1 ? "Unlimited" : plan.maxProducts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max Users:</span>
                    <span className="font-semibold text-gray-900">
                      {plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{plan.durationDays} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Subscriptions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Active User Subscriptions</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor all user subscription statuses</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No active subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const daysLeft = sub.endDate 
                      ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
                      : 0;
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sub.userName || sub.user?.fullName || sub.userEmail?.split('@')[0] || "Guest User"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sub.userEmail || sub.user?.email || "No email"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{sub.planType || sub.planName || "FREE_TRIAL"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sub.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                            sub.status === "TRIAL" ? "bg-blue-100 text-blue-800" :
                            sub.status === "EXPIRED" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${
                            daysLeft > 30 ? 'text-green-600' :
                            daysLeft > 7 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {daysLeft} days
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Plan Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Subscription Plan">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={formData.planName}
                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Premium Plan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({...formData, planType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Products</label>
              <input
                type="number"
                value={formData.maxProducts}
                onChange={(e) => setFormData({...formData, maxProducts: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="-1 for unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="-1 for unlimited"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the plan features..."
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedPlan(null); }} title="Edit Subscription Plan">
        <form onSubmit={handleUpdatePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={formData.planName}
                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({...formData, planType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Products</label>
              <input
                type="number"
                value={formData.maxProducts}
                onChange={(e) => setFormData({...formData, maxProducts: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setSelectedPlan(null); }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Update Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedPlan(null); }} title="Delete Subscription Plan">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Are you sure you want to delete the <strong>{selectedPlan?.planName}</strong> plan? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowDeleteModal(false); setSelectedPlan(null); }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePlan}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Plan
            </button>
          </div>
        </div>
      </Modal>
    </SuperAdminLayout>
  );
}
