import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Globe,
  Target,
  Brain,
  RefreshCw,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Eye,
} from "lucide-react";

export default function SuperAdminSalesMarketing() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [salesDashboard, setSalesDashboard] = useState(null);
  const [marketingDashboard, setMarketingDashboard] = useState(null);
  const [revenueDashboard, setRevenueDashboard] = useState(null);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [globalMarkets, setGlobalMarkets] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [hotLeads, setHotLeads] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [salesRes, marketingRes, revenueRes, summaryRes, marketsRes, leadsRes] = await Promise.all([
        api.get("/ai/sales-marketing/dashboard/sales").catch(() => ({ data: null })),
        api.get("/ai/sales-marketing/dashboard/marketing").catch(() => ({ data: null })),
        api.get("/ai/sales-marketing/dashboard/revenue").catch(() => ({ data: null })),
        api.get("/ai/sales-marketing/dashboard/executive-summary").catch(() => ({ data: null })),
        api.get("/ai/sales-marketing/global-markets").catch(() => ({ data: null })),
        api.get("/ai/sales-marketing/leads/hot").catch(() => ({ data: [] })),
      ]);
      
      setSalesDashboard(salesRes.data);
      setMarketingDashboard(marketingRes.data);
      setRevenueDashboard(revenueRes.data);
      setExecutiveSummary(summaryRes.data);
      setGlobalMarkets(marketsRes.data);
      setHotLeads(leadsRes.data || []);
      toast.success("Dashboard data loaded");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className={`bg-white rounded-xl shadow-md p-5 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
              {change.startsWith("+") ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            AI Sales & Marketing Center
          </h2>
          <p className="text-gray-500 mt-1 ml-1">AI-powered sales automation, marketing, and revenue optimization</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {["overview", "sales", "marketing", "revenue", "global", "ai-tools"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && executiveSummary && (
        <div className="space-y-6">
          {/* Highlights */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap size={20} />
              Key Highlights - {executiveSummary.period}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {executiveSummary.highlights?.map((highlight, idx) => (
                <div key={idx} className="bg-white/20 rounded-lg p-3">
                  <p className="text-sm">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Revenue"
              value={`$${(executiveSummary.metrics?.revenue?.value || 0).toLocaleString()}`}
              change={executiveSummary.metrics?.revenue?.change}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Customers"
              value={(executiveSummary.metrics?.customers?.value || 0).toLocaleString()}
              change={executiveSummary.metrics?.customers?.change}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Orders"
              value={(executiveSummary.metrics?.orders?.value || 0).toLocaleString()}
              change={executiveSummary.metrics?.orders?.change}
              icon={ShoppingCart}
              color="purple"
            />
            <StatCard
              title="Avg Order Value"
              value={`$${(executiveSummary.metrics?.aov?.value || 0).toLocaleString()}`}
              change={executiveSummary.metrics?.aov?.change}
              icon={TrendingUp}
              color="orange"
            />
          </div>

          {/* AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain size={20} className="text-indigo-600" />
                AI Recommendations
              </h3>
              <ul className="space-y-3">
                {executiveSummary.aiRecommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                    <Zap size={16} className="text-indigo-600 mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-green-600" />
                Opportunities
              </h3>
              <ul className="space-y-3">
                {executiveSummary.opportunities?.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <ArrowUpRight size={16} className="text-green-600 mt-0.5" />
                    <span className="text-gray-700">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === "sales" && salesDashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${(salesDashboard.summary?.totalRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Total Orders"
              value={(salesDashboard.summary?.totalOrders || 0).toLocaleString()}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="Avg Order Value"
              value={`$${(salesDashboard.summary?.averageOrderValue || 0).toFixed(2)}`}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Conversion Rate"
              value={salesDashboard.summary?.conversionRate || "0%"}
              icon={Target}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trends</h3>
              <div className="space-y-4">
                {Object.entries(salesDashboard.trends || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-semibold text-green-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
              <ul className="space-y-3">
                {salesDashboard.aiInsights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Brain size={16} className="text-blue-600 mt-0.5" />
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Tab */}
      {activeTab === "marketing" && marketingDashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Campaigns"
              value={marketingDashboard.summary?.activeCampaigns || 0}
              icon={Mail}
              color="blue"
            />
            <StatCard
              title="Impressions"
              value={(marketingDashboard.summary?.totalImpressions || 0).toLocaleString()}
              icon={Eye}
              color="purple"
            />
            <StatCard
              title="Conversions"
              value={(marketingDashboard.summary?.totalConversions || 0).toLocaleString()}
              icon={Target}
              color="green"
            />
            <StatCard
              title="ROI"
              value={marketingDashboard.summary?.overallROI || "0%"}
              icon={TrendingUp}
              color="orange"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(marketingDashboard.channelPerformance || {}).map(([channel, data]) => (
                <div key={channel} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 capitalize mb-3">{channel}</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500 capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && revenueDashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${(revenueDashboard.summary?.totalRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Recurring Revenue"
              value={`$${(revenueDashboard.summary?.recurringRevenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="MRR"
              value={`$${(revenueDashboard.mrr?.current || 0).toLocaleString()}`}
              change={revenueDashboard.mrr?.growth}
              icon={BarChart3}
              color="purple"
            />
            <StatCard
              title="ARR"
              value={`$${(revenueDashboard.arr?.current || 0).toLocaleString()}`}
              change={revenueDashboard.arr?.growth}
              icon={PieChart}
              color="orange"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Streams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(revenueDashboard.streams || {}).map(([stream, data]) => (
                <div key={stream} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">{stream}</h4>
                  <p className="text-2xl font-bold text-green-600">${(data.revenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{data.percentage} of total</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Markets Tab */}
      {activeTab === "global" && globalMarkets && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={20} />
              Global Market Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(globalMarkets.markets || {}).map(([region, data]) => (
                <div key={region} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">{region.replace(/([A-Z])/g, " $1")}</h4>
                  <p className="text-xl font-bold text-green-600">${(data.revenue || 0).toLocaleString()}</p>
                  <div className="mt-2 text-sm space-y-1">
                    <p className="text-gray-500">Growth: <span className="text-green-600">{data.growth}</span></p>
                    <p className="text-gray-500">Share: {data.marketShare}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      data.potential === "VERY HIGH" ? "bg-green-100 text-green-800" :
                      data.potential === "HIGH" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {data.potential}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Opportunities</h3>
              <div className="space-y-3">
                {globalMarkets.topOpportunities?.map((opp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{opp.region}</p>
                      <p className="text-sm text-gray-500">Effort: {opp.effort}</p>
                    </div>
                    <span className="text-green-600 font-semibold">{opp.potential}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <ul className="space-y-3">
                {globalMarkets.aiRecommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                    <Brain size={16} className="text-indigo-600 mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI Tools Tab */}
      {activeTab === "ai-tools" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Lead Generation</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">AI-powered lead generation and qualification</p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate Leads
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Email Campaigns</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">Automated email marketing campaigns</p>
              <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Campaign
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Call Support AI</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">AI-powered call support automation</p>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Setup Call AI
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageSquare size={20} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Chat Support AI</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">24/7 AI chatbot for customer support</p>
              <button className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Configure Chatbot
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Sales Forecast</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">Predictive sales analytics</p>
              <button className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                View Forecast
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Send size={20} className="text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold">Marketing Content</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">AI-generated marketing content</p>
              <button className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Generate Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}