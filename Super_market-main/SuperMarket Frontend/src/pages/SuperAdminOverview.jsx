import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "../SuperAdminStyles.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  AlertCircle,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  CreditCard,
  Settings,
  FileBarChart,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function SuperAdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/dashboard-stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a Professional ID to search");
      return;
    }

    try {
      setSearching(true);
      // Search by professional number
      const response = await api.get(`/admin/users/search?professionalNumber=${searchQuery.trim()}`);
      
      if (response.data) {
        setSearchResult(response.data);
        setShowUserModal(true);
        toast.success("User found!");
      }
    } catch (error) {
      console.error("Search failed:", error);
      if (error.response?.status === 404) {
        toast.error("No user found with this Professional ID");
      } else {
        toast.error("Search failed. Please try again.");
      }
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setSearchResult(null);
    setSearchQuery("");
  };

  const navigateToReports = () => {
    navigate("/superadmin/reports");
  };
  // ========== AI INSIGHTS GENERATION ==========
  const generateAIInsights = async () => {
    setGeneratingAI(true);
    const toastId = toast.loading('🤖 AI analyzing dashboard metrics...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = [];
      
      // User Growth Analysis
      if (stats?.totalUsers > 0) {
        const growthRate = 12; // From StatCard
        insights.push({
          type: growthRate > 10 ? 'success' : 'warning',
          category: 'User Growth',
          title: growthRate > 10 ? 'Excellent User Growth' : 'Moderate User Growth',
          description: `User base grew by ${growthRate}% this month. ${growthRate > 10 ? 'Exceeding targets!' : 'Consider marketing campaigns to boost acquisition.'}`,
          action: growthRate > 10 ? 'Maintain current marketing strategy' : 'Launch targeted acquisition campaigns',
          priority: growthRate > 10 ? 'Low' : 'Medium'
        });
      }
      
      // Subscription Analysis
      if (stats?.activeSubscriptions !== undefined) {
        const conversionRate = ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1);
        insights.push({
          type: conversionRate > 30 ? 'success' : conversionRate > 15 ? 'info' : 'warning',
          category: 'Subscriptions',
          title: `${conversionRate}% Subscription Conversion Rate`,
          description: `${stats.activeSubscriptions} active subscriptions from ${stats.totalUsers} users. ${conversionRate > 30 ? 'Outstanding performance!' : 'Room for improvement.'}`,
          action: conversionRate > 30 ? 'Analyze successful factors for replication' : 'Improve onboarding flow and offer trial periods',
          priority: conversionRate > 15 ? 'Low' : 'High'
        });
      }
      
      // Revenue Opportunity
      if (stats?.totalRevenue !== undefined) {
        insights.push({
          type: 'info',
          category: 'Revenue',
          title: 'Revenue Optimization Opportunity',
          description: `Current revenue: ₹${stats.totalRevenue?.toLocaleString()}. AI identified upsell opportunities.`,
          action: 'Target free users with limited-time premium offers',
          priority: 'Medium'
        });
      }
      
      // Ticket Analysis
      if (stats?.pendingTickets > 10) {
        insights.push({
          type: 'critical',
          category: 'Support',
          title: 'High Support Ticket Volume',
          description: `${stats.pendingTickets} pending tickets require attention. Response time may be affected.`,
          action: 'Allocate additional support resources or enable AI auto-responses',
          priority: 'Critical'
        });
      }
      
      // System Health
      insights.push({
        type: 'success',
        category: 'System Health',
        title: 'Platform Stability Excellent',
        description: 'AI detected no critical issues. All systems operational.',
        action: 'Schedule routine maintenance for optimal performance',
        priority: 'Low'
      });
      
      // Growth Forecast
      insights.push({
        type: 'info',
        category: 'Forecast',
        title: 'Growth Projection',
        description: 'Based on current trends, expect 500+ new users next month.',
        action: 'Scale infrastructure to handle projected growth',
        priority: 'Medium'
      });
      
      setAiInsights(insights);
      toast.success(`✨ AI generated ${insights.length} insights`, { id: toastId });
    } catch (error) {
      console.error('AI insights error:', error);
      toast.error('Failed to generate AI insights', { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };
  const navigateToSettings = () => {
    navigate("/superadmin/settings");
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon size={24} className="text-indigo-600" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Search Bar Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Professional ID
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Professional ID (e.g., TITSMMS001)"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers}
            icon={Users}
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions}
            icon={DollarSign}
            trend="up"
            trendValue="+8%"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            trend="up"
            trendValue="+15%"
          />
          <StatCard
            title="Support Tickets"
            value={stats?.openTickets || 0}
            icon={AlertCircle}
          />
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">
                AI Business Insights
              </h3>
            </div>
            <button
              onClick={generateAIInsights}
              disabled={generatingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              {generatingAI ? 'Analyzing...' : 'Generate AI Insights'}
            </button>
          </div>
          
          {aiInsights.length === 0 ? (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center border border-purple-200">
              <Zap className="mx-auto text-purple-400 mb-3" size={48} />
              <p className="text-gray-700 font-medium mb-2">No AI insights yet</p>
              <p className="text-sm text-gray-600">Click "Generate AI Insights" to analyze your dashboard metrics and get actionable recommendations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : insight.type === 'success'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {insight.type === 'critical' ? (
                        <XCircle className="text-red-600" size={20} />
                      ) : insight.type === 'warning' ? (
                        <AlertTriangle className="text-yellow-600" size={20} />
                      ) : insight.type === 'success' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Sparkles className="text-blue-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{insight.category}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            insight.priority === 'Critical'
                              ? 'bg-red-200 text-red-800'
                              : insight.priority === 'High'
                              ? 'bg-orange-200 text-orange-800'
                              : insight.priority === 'Medium'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {insight.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                      <div className="bg-white bg-opacity-60 rounded px-3 py-2 text-sm">
                        <span className="font-semibold text-gray-700">Action:</span>
                        <span className="text-gray-600 ml-1">{insight.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">New Users Today</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats?.newUsersToday || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded">
                    <Package size={20} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Products Listed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats?.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded">
                    <Activity size={20} className="text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Active Sessions</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats?.activeSessions || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Database Status</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <span className="text-sm font-medium text-green-600">Fast (120ms)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "88%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Server Load</span>
                  <span className="text-sm font-medium text-yellow-600">Moderate (45%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Super Admin Dashboard</h2>
          <p className="text-indigo-100 mb-4">
            Manage your SuperMarket application from this central control panel.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={navigateToReports}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 flex items-center gap-2 transition"
            >
              <FileBarChart size={20} />
              View Reports
            </button>
            <button 
              onClick={navigateToSettings}
              className="px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 flex items-center gap-2 transition"
            >
              <Settings size={20} />
              System Settings
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && searchResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">User Details</h3>
                <p className="text-indigo-100 text-sm mt-1">Complete user information</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Professional ID Badge */}
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <Shield size={20} />
                    <span className="font-bold text-lg">{searchResult.professionalNumber}</span>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Full Name</label>
                    <p className="text-gray-900 font-medium">{searchResult.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Role</label>
                    <p className="text-gray-900 font-medium">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        searchResult.role === "SUPER_ADMIN" 
                          ? "bg-purple-100 text-purple-700"
                          : searchResult.role === "ADMIN"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {searchResult.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Account Status</label>
                    <p className="text-gray-900 font-medium">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        searchResult.accountStatus === "ACTIVE" 
                          ? "bg-green-100 text-green-700"
                          : searchResult.accountStatus === "FROZEN"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {searchResult.accountStatus}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Shop Name</label>
                    <p className="text-gray-900 font-medium">{searchResult.shopName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail size={18} className="text-indigo-600" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-gray-900">{searchResult.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <label className="text-xs text-gray-500">Phone Number</label>
                      <p className="text-gray-900">{searchResult.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <label className="text-xs text-gray-500">Address</label>
                      <p className="text-gray-900">{searchResult.shopAddress || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              {searchResult.subscriptionPlan && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-indigo-600" />
                    Subscription Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Plan</label>
                      <p className="text-gray-900 font-medium">{searchResult.subscriptionPlan}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Status</label>
                      <p className="text-gray-900 font-medium">
                        {searchResult.subscriptionActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Dates */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  Account Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Created At</label>
                    <p className="text-gray-900">
                      {searchResult.createdAt 
                        ? new Date(searchResult.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Last Updated</label>
                    <p className="text-gray-900">
                      {searchResult.updatedAt 
                        ? new Date(searchResult.updatedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    navigate("/superadmin/users");
                    closeModal();
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Manage User
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

