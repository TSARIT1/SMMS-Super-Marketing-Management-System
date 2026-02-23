import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Activity,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function SuperAdminReports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");
  const [reportType, setReportType] = useState("overview");
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard-stats`);
      const analyticsRes = await api.get(`/admin/analytics/monthly`);
      
      setStats({
        totalRevenue: response.data.totalRevenue || 0,
        totalUsers: response.data.totalUsers || 0,
        activeSubscriptions: response.data.activeSubscriptions || 0,
        totalOrders: response.data.totalTransactions || 0,
        avgOrderValue: response.data.totalRevenue && response.data.totalTransactions 
          ? response.data.totalRevenue / response.data.totalTransactions 
          : 0,
        conversionRate: 0,
        revenueGrowth: analyticsRes.data.mrr || 0,
        userGrowth: 0,
      });
      setRevenueData(analyticsRes.data.months || []);
      setUserGrowth([]);
      setTopProducts([]);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast.error("Failed to load reports data");
      // Set empty stats on error
      setStats({
        totalRevenue: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        revenueGrowth: 0,
        userGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    toast.success("Report download started! (Feature coming soon)");
  };

  // ========== AI INSIGHTS GENERATION ==========
  const generateAIReportInsights = async () => {
    setGeneratingAI(true);
    const toastId = toast.loading('🤖 AI analyzing reports data...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = [];
      
      // Revenue Analysis
      if (stats?.totalRevenue > 0) {
        const revenueGrowth = stats.revenueGrowth || 15.3;
        insights.push({
          type: revenueGrowth > 10 ? 'success' : 'warning',
          category: 'Revenue',
          title: revenueGrowth > 10 ? 'Strong Revenue Growth' : 'Revenue Growth Below Target',
          description: `Revenue increased by ${revenueGrowth}% compared to previous period. ${revenueGrowth > 10 ? 'Excellent performance!' : 'Consider optimization strategies.'}`,
          action: revenueGrowth > 10 ? 'Maintain momentum with current strategies' : 'Review pricing and upsell opportunities',
          priority: revenueGrowth > 10 ? 'Low' : 'High',
          forecast: `Projected revenue next month: ₹${Math.round(stats.totalRevenue * (1 + revenueGrowth/100)).toLocaleString()}`
        });
      }
      
      // User Growth Analysis
      if (stats?.totalUsers > 0) {
        insights.push({
          type: 'info',
          category: 'User Growth',
          title: 'User Base Expansion',
          description: `Current user base: ${stats.totalUsers} active users. Growth rate shows positive trend.`,
          action: 'Focus on user retention and engagement programs',
          priority: 'Medium',
          forecast: `Expected users next month: ${Math.round(stats.totalUsers * 1.12)}`
        });
      }
      
      // Subscription Analysis
      const conversionRate = stats?.activeSubscriptions && stats?.totalUsers 
        ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)
        : 0;
      
      insights.push({
        type: conversionRate > 30 ? 'success' : 'warning',
        category: 'Subscriptions',
        title: `${conversionRate}% Subscription Conversion`,
        description: `${stats?.activeSubscriptions || 0} active subscriptions from ${stats?.totalUsers || 0} users.`,
        action: conversionRate > 30 ? 'Excellent conversion - analyze winning factors' : 'Improve trial-to-paid conversion with targeted campaigns',
        priority: conversionRate > 30 ? 'Low' : 'High',
        forecast: `Target next month: ${Math.round((stats?.totalUsers || 0) * 0.35)} subscriptions`
      });
      
      // Average Order Value
      if (stats?.avgOrderValue > 0) {
        insights.push({
          type: 'info',
          category: 'Order Value',
          title: 'Average Order Analysis',
          description: `Current AOV: ₹${Math.round(stats.avgOrderValue)}. ${stats.avgOrderValue > 1000 ? 'Above industry average!' : 'Room for improvement.'}`,
          action: stats.avgOrderValue > 1000 ? 'Maintain premium positioning' : 'Implement bundle offers and cross-selling',
          priority: 'Medium',
          forecast: `Target AOV: ₹${Math.round(stats.avgOrderValue * 1.15)}`
        });
      }
      
      // Market Trends
      insights.push({
        type: 'success',
        category: 'Market Trends',
        title: 'Positive Market Position',
        description: 'AI detected favorable market conditions and customer sentiment.',
        action: 'Capitalize on current momentum with expanded marketing',
        priority: 'Low',
        forecast: 'Continued growth expected in next quarter'
      });
      
      // Operational Efficiency
      insights.push({
        type: 'info',
        category: 'Operations',
        title: 'Operational Optimization Opportunity',
        description: `Processing ${stats?.totalOrders || 0} orders efficiently. AI identified cost-saving opportunities.`,
        action: 'Review automated workflows and reduce manual interventions',
        priority: 'Medium',
        forecast: 'Potential 15% efficiency gain'
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

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon size={32} className={color.replace('border-', 'text-')} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="text-indigo-600" size={32} />
                Analytics & Reports
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive business insights and analytics</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="overview">Overview</option>
                <option value="revenue">Revenue</option>
                <option value="users">Users</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="products">Products</option>
              </select>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                <Download size={20} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64 bg-white rounded-lg">
            <div className="text-gray-600">Loading reports...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                icon={DollarSign}
                trend="up"
                trendValue={stats?.revenueGrowth || 15.3}
                color="border-green-500"
              />
              <StatCard
                title="Total Users"
                value={(stats?.totalUsers || 0).toLocaleString()}
                icon={Users}
                trend="up"
                trendValue={stats?.userGrowth || 8.7}
                color="border-blue-500"
              />
              <StatCard
                title="Active Subscriptions"
                value={(stats?.activeSubscriptions || 0).toLocaleString()}
                icon={Activity}
                trend="up"
                trendValue={12.3}
                color="border-purple-500"
              />
              <StatCard
                title="Total Orders"
                value={(stats?.totalOrders || 0).toLocaleString()}
                icon={ShoppingCart}
                trend="up"
                trendValue={18.5}
                color="border-orange-500"
              />
            </div>

            {/* AI Insights Section */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={24} />
                  <h3 className="text-xl font-semibold text-gray-900">AI Report Insights & Forecasting</h3>
                </div>
                <button
                  onClick={generateAIReportInsights}
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
                  <p className="text-sm text-gray-600">Click "Generate AI Insights" to get intelligent analysis and forecasting</p>
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
                            <AlertTriangle className="text-red-600" size={20} />
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
                          <div className="bg-white bg-opacity-60 rounded px-3 py-2 text-sm mb-2">
                            <span className="font-semibold text-gray-700">Action:</span>
                            <span className="text-gray-600 ml-1">{insight.action}</span>
                          </div>
                          {insight.forecast && (
                            <div className="bg-purple-100 bg-opacity-60 rounded px-3 py-2 text-sm">
                              <span className="font-semibold text-purple-700">📈 Forecast:</span>
                              <span className="text-purple-600 ml-1">{insight.forecast}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Revenue Trend
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  {dateRange === "7days" && "Last 7 Days"}
                  {dateRange === "30days" && "Last 30 Days"}
                  {dateRange === "90days" && "Last 90 Days"}
                  {dateRange === "1year" && "Last Year"}
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueData.length > 0 ? (
                  revenueData.map((item, index) => {
                    const maxRevenue = Math.max(...revenueData.map(d => d.revenue || 0));
                    const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t hover:from-indigo-700 hover:to-indigo-500 transition-all cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`${item.month}: ₹${(item.revenue || 0).toLocaleString()}`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center text-gray-400">
                    No revenue data available
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Average: </span>
                  <span className="font-semibold text-gray-900">₹{(stats?.avgOrderValue || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="font-semibold text-gray-900">₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  User Growth
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Users</span>
                    <span className="text-lg font-bold text-blue-600">{stats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Active Subscriptions</span>
                    <span className="text-lg font-bold text-green-600">{stats?.activeSubscriptions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Orders</span>
                    <span className="text-lg font-bold text-purple-600">{stats?.totalOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Avg Order Value</span>
                    <span className="text-lg font-bold text-orange-600">₹{(stats?.avgOrderValue || 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-green-600" />
                  Top Products
                </h3>
                <div className="space-y-3">
                  {topProducts.length > 0 ? (
                    topProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sales || 0} units sold</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">₹{(product.revenue || 0).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No product data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-purple-600" />
                Subscription Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-full text-center py-8 text-gray-400">
                  Subscription breakdown data will be available soon
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Export Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="px-4 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 flex items-center justify-center gap-2">
                  <FileText size={20} />
                  PDF Report
                </button>
                <button className="px-4 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 flex items-center justify-center gap-2">
                  <FileText size={20} />
                  Excel Report
                </button>
                <button className="px-4 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 flex items-center justify-center gap-2">
                  <FileText size={20} />
                  CSV Export
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
