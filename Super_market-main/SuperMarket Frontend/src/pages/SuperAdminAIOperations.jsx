import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  Brain,
  Play,
  Pause,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Cpu,
  Database,
  Server,
  Shield,
  Code,
  Bug,
  Zap,
  Globe,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function SuperAdminAIOperations() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [operationsStatus, setOperationsStatus] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [codeHealth, setCodeHealth] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [risks, setRisks] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, dashboardRes, healthRes, recsRes, logsRes, codeRes, predRes, risksRes] = await Promise.all([
        api.get("/ai/operations/status").catch(() => ({ data: null })),
        api.get("/ai/operations/dashboard").catch(() => ({ data: null })),
        api.get("/ai/operations/health").catch(() => ({ data: null })),
        api.get("/ai/operations/recommendations").catch(() => ({ data: { recommendations: [] } })),
        api.get("/ai/operations/logs?limit=10").catch(() => ({ data: [] })),
        api.get("/ai/operations/code/health").catch(() => ({ data: null })),
        api.get("/ai/operations/predict/7").catch(() => ({ data: null })),
        api.get("/ai/operations/risks").catch(() => ({ data: null })),
      ]);

      setOperationsStatus(statusRes.data);
      setDashboard(dashboardRes.data);
      setSystemHealth(healthRes.data);
      setRecommendations(recsRes.data?.recommendations || []);
      setAutomationLogs(logsRes.data || []);
      setCodeHealth(codeRes.data);
      setPredictions(predRes.data);
      setRisks(risksRes.data);
      toast.success("AI Operations data loaded");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load AI Operations data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAI = async (enabled) => {
    try {
      await api.post(`/ai/operations/toggle?enabled=${enabled}`);
      toast.success(enabled ? "AI Operations enabled" : "AI Operations paused");
      fetchData();
    } catch {
      toast.error("Failed to toggle AI Operations");
    }
  };

  const runAllTasks = async () => {
    try {
      toast.loading("Running all automated tasks...");
      await api.post("/ai/operations/run-all");
      toast.dismiss();
      toast.success("All automated tasks completed!");
      fetchData();
    } catch {
      toast.error("Failed to run automated tasks");
    }
  };

  const optimizeAll = async () => {
    try {
      toast.loading("Optimizing all systems...");
      await api.post("/ai/operations/optimize-all");
      toast.dismiss();
      toast.success("All systems optimized!");
      fetchData();
    } catch {
      toast.error("Failed to optimize systems");
    }
  };

  const executeRecommendation = async (recId) => {
    try {
      await api.post(`/ai/operations/recommendations/${recId}/execute`);
      toast.success("Recommendation executed successfully!");
      fetchData();
    } catch {
      toast.error("Failed to execute recommendation");
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "indigo" }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
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

  const ModuleCard = ({ name, status, lastRun, tasksCompleted, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status === "ACTIVE" ? "bg-green-100" : "bg-yellow-100"}`}>
            <Icon className={`w-5 h-5 ${status === "ACTIVE" ? "text-green-600" : "text-yellow-600"}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        <p>Last run: {lastRun ? new Date(lastRun).toLocaleString() : "N/A"}</p>
        <p>Tasks: {tasksCompleted?.toLocaleString() || 0}</p>
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
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            AI Operations Center
          </h2>
          <p className="text-gray-500 mt-1 ml-1">Unified AI control for all business operations</p>
        </div>
        <div className="flex items-center gap-3">
          {operationsStatus?.aiOperationsEnabled ? (
            <button
              onClick={() => toggleAI(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <Pause size={16} />
              Pause AI
            </button>
          ) : (
            <button
              onClick={() => toggleAI(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <Play size={16} />
              Enable AI
            </button>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={runAllTasks}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Play size={20} />
          Run All Tasks
        </button>
        <button
          onClick={optimizeAll}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Zap size={20} />
          Optimize All
        </button>
        <button
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          onClick={() => setActiveTab("predictions")}
        >
          <TrendingUp size={20} />
          View Predictions
        </button>
        <button
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          onClick={() => setActiveTab("maintenance")}
        >
          <Code size={20} />
          Code Maintenance
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {["dashboard", "modules", "recommendations", "predictions", "maintenance", "logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && dashboard && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${(dashboard.overview?.totalRevenue || 0).toLocaleString()}`}
              change="+15%"
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Total Orders"
              value={(dashboard.overview?.totalOrders || 0).toLocaleString()}
              change="+12%"
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="Active Campaigns"
              value={dashboard.overview?.activeCampaigns || 0}
              icon={Target}
              color="purple"
            />
            <StatCard
              title="AI Status"
              value={dashboard.overview?.aiStatus || "OPERATIONAL"}
              icon={Brain}
              color="indigo"
            />
          </div>

          {/* System Health */}
          {systemHealth && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-green-600" />
                System Health
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(systemHealth.health?.components || {}).map(([name, data]) => (
                  <div key={name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {data.status === "UP" ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                      <span className="font-medium capitalize">{name}</span>
                    </div>
                    <p className="text-sm text-gray-500">Latency: {data.latency}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-indigo-600">{systemHealth.metrics?.totalUsers?.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{systemHealth.aiMetrics?.predictionsToday?.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">AI Predictions Today</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{systemHealth.aiMetrics?.accuracy}</p>
                  <p className="text-sm text-gray-500">AI Accuracy</p>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {dashboard.alerts?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-yellow-600" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {dashboard.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      alert.type === "WARNING"
                        ? "bg-yellow-50"
                        : alert.type === "SUCCESS"
                        ? "bg-green-50"
                        : "bg-blue-50"
                    }`}
                  >
                    {alert.type === "WARNING" ? (
                      <AlertTriangle size={16} className="text-yellow-600" />
                    ) : alert.type === "SUCCESS" ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <Activity size={16} className="text-blue-600" />
                    )}
                    <span className="text-gray-700">{alert.message}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && operationsStatus && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleCard
              name="Sales & Marketing"
              status={operationsStatus.modules?.salesMarketing?.status}
              lastRun={operationsStatus.modules?.salesMarketing?.lastRun}
              tasksCompleted={operationsStatus.modules?.salesMarketing?.tasksCompleted}
              icon={DollarSign}
            />
            <ModuleCard
              name="Support Automation"
              status={operationsStatus.modules?.support?.status}
              lastRun={operationsStatus.modules?.support?.lastRun}
              tasksCompleted={operationsStatus.modules?.support?.ticketsResolved}
              icon={Users}
            />
            <ModuleCard
              name="Maintenance"
              status={operationsStatus.modules?.maintenance?.status}
              lastRun={operationsStatus.modules?.maintenance?.lastRun}
              tasksCompleted={operationsStatus.modules?.maintenance?.issuesFixed}
              icon={Code}
            />
            <ModuleCard
              name="Performance"
              status={operationsStatus.modules?.performance?.status}
              lastRun={operationsStatus.modules?.performance?.lastRun}
              tasksCompleted={operationsStatus.modules?.performance?.optimizationsApplied}
              icon={Zap}
            />
            <ModuleCard
              name="Global Expansion"
              status={operationsStatus.modules?.globalExpansion?.status}
              lastRun={operationsStatus.modules?.globalExpansion?.lastRun}
              tasksCompleted={operationsStatus.modules?.globalExpansion?.marketsAnalyzed}
              icon={Globe}
            />
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-500" />
                AI Recommendations
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                AI-generated suggestions to improve your business
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : rec.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-gray-500">{rec.area}</span>
                      </div>
                      <p className="text-gray-900 font-medium">{rec.recommendation}</p>
                      <p className="text-sm text-gray-500 mt-1">{rec.impact}</p>
                    </div>
                    <button
                      onClick={() => executeRecommendation(rec.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm"
                    >
                      Execute
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && predictions && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
              <h4 className="text-sm opacity-80">Predicted Revenue (7 days)</h4>
              <p className="text-3xl font-bold mt-2">
                ${(predictions.summary?.totalPredictedRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm opacity-80 mt-1">{predictions.summary?.growthRate} growth</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
              <h4 className="text-sm opacity-80">Avg Daily Revenue</h4>
              <p className="text-3xl font-bold mt-2">
                ${Math.round(predictions.summary?.averageDailyRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm opacity-80 mt-1">Trend: {predictions.summary?.trend}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md p-6 text-white">
              <h4 className="text-sm opacity-80">Prediction Confidence</h4>
              <p className="text-3xl font-bold mt-2">85%</p>
              <p className="text-sm opacity-80 mt-1">Based on historical data</p>
            </div>
          </div>

          {/* Risk Assessment */}
          {risks && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Risk Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {risks.risks?.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{risk.type}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        risk.probability === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : risk.probability === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {risk.probability}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{risk.description}</p>
                    <p className="text-xs text-indigo-600 mt-2">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === "maintenance" && codeHealth && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Code Health</p>
                  <p className="text-xl font-bold text-gray-900">{codeHealth.overallHealth}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Code Coverage</p>
                  <p className="text-xl font-bold text-gray-900">{codeHealth.metrics?.codeCoverage?.value}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Security Score</p>
                  <p className="text-xl font-bold text-gray-900">{codeHealth.metrics?.security?.value}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bug className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issues</p>
                  <p className="text-xl font-bold text-gray-900">44</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={async () => {
                try {
                  await api.post("/ai/operations/code/maintenance");
                  toast.success("Scheduled maintenance completed!");
                } catch (e) {
                  toast.error("Failed to run maintenance");
                }
              }}
              className="p-4 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Run Maintenance
            </button>
            <button
              onClick={async () => {
                try {
                  await api.post("/ai/operations/code/tech-debt-cleanup");
                  toast.success("Technical debt cleaned up!");
                } catch (e) {
                  toast.error("Failed to cleanup tech debt");
                }
              }}
              className="p-4 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 flex items-center justify-center gap-2"
            >
              <Code size={18} />
              Cleanup Tech Debt
            </button>
            <button
              onClick={async () => {
                try {
                  await api.post("/ai/operations/code/update-dependencies");
                  toast.success("Dependencies updated!");
                } catch (e) {
                  toast.error("Failed to update dependencies");
                }
              }}
              className="p-4 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 flex items-center justify-center gap-2"
            >
              <Database size={18} />
              Update Dependencies
            </button>
            <button
              onClick={async () => {
                try {
                  await api.get("/ai/operations/code/security");
                  toast.success("Security scan completed!");
                } catch (e) {
                  toast.error("Failed to run security scan");
                }
              }}
              className="p-4 bg-red-50 rounded-xl text-red-700 hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              Security Scan
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-gray-600" />
              Automation Logs
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {automationLogs.map((log, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.level === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : log.level === "WARNING"
                        ? "bg-yellow-100 text-yellow-700"
                        : log.level === "ERROR"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-gray-700">{log.message}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}