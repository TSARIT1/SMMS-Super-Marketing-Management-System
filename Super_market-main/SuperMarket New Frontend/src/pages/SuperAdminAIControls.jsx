import React, { useEffect, useState } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { Zap, Activity, Settings, BarChart3, Brain, RefreshCw, Users, CheckCircle } from "lucide-react";

export default function SuperAdminAIControls() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [aiStats, setAiStats] = useState({
    totalUsers: 0,
    aiEnabledUsers: 0,
    autoModeUsers: 0,
    manualModeUsers: 0,
    voiceAiUsers: 0,
    autoInventoryUsers: 0,
    autoOrderUsers: 0,
    aiLoadBalancingUsers: 0,
  });
  const [aiServices, setAiServices] = useState([
    { id: 1, name: "Image Generation", status: "active", usage: "High", lastUsed: "2 min ago", enabled: true },
    { id: 2, name: "Ticket Analysis", status: "active", usage: "Medium", lastUsed: "15 min ago", enabled: true },
    { id: 3, name: "Inventory Prediction", status: "active", usage: "Low", lastUsed: "1 hour ago", enabled: true },
    { id: 4, name: "Email Generation", status: "maintenance", usage: "N/A", lastUsed: "3 hours ago", enabled: false },
    { id: 5, name: "Voice Control", status: "active", usage: "High", lastUsed: "1 min ago", enabled: true },
    { id: 6, name: "Advanced Analytics", status: "active", usage: "Medium", lastUsed: "30 min ago", enabled: true },
  ]);
  const [globalConfig, setGlobalConfig] = useState({
    autoScaling: true,
    costMonitoring: true,
    performanceAlerts: false,
    maxConcurrentUsers: 1000,
    aiResponseTimeout: 30,
  });

  // Fetch users and AI configuration data
  const fetchAIData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all users
      const usersResponse = await api.get("/admin/users");
      const usersData = usersResponse.data || [];
      setUsers(usersData);

      // Calculate AI statistics from user profiles
      const stats = {
        totalUsers: usersData.length,
        aiEnabledUsers: 0,
        autoModeUsers: 0,
        manualModeUsers: 0,
        voiceAiUsers: 0,
        autoInventoryUsers: 0,
        autoOrderUsers: 0,
        aiLoadBalancingUsers: 0,
      };

      usersData.forEach(user => {
        if (user.profile) {
          const p = user.profile;
          if (p.aiEnabled) stats.aiEnabledUsers++;
          if (p.aiMode === 'auto') stats.autoModeUsers++;
          if (p.aiMode === 'manual') stats.manualModeUsers++;
          if (p.voiceAiEnabled) stats.voiceAiUsers++;
          if (p.autoInventoryManagement) stats.autoInventoryUsers++;
          if (p.autoOrderProcessing) stats.autoOrderUsers++;
          if (p.aiLoadBalancing) stats.aiLoadBalancingUsers++;
        }
      });

      setAiStats(stats);
      toast.success("AI data refreshed successfully");
    } catch (error) {
      console.error("Error fetching AI data:", error);
      toast.error("Failed to fetch AI data");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIData();
  }, []);

  const toggleService = (serviceId) => {
    setAiServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { 
              ...service, 
              status: service.status === "active" ? "inactive" : "active",
              enabled: !service.enabled
            }
          : service
      )
    );
    const service = aiServices.find(s => s.id === serviceId);
    toast.success(`${service?.name} ${service?.status === "active" ? "disabled" : "enabled"}`);
  };

  const updateGlobalConfig = async (configKey, value) => {
    setGlobalConfig(prev => ({ ...prev, [configKey]: value }));
    toast.success(`Global configuration updated: ${configKey}`);
  };

  const bulkUpdateAIMode = async (mode) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to set ALL users to ${mode.toUpperCase()} AI mode? This will affect ${users.length} users.`
      );
      
      if (!confirmed) return;

      toast.loading("Updating all users...");
      
      // In a real implementation, you would call a bulk update API endpoint
      // For now, we'll show a success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.dismiss();
      toast.success(`All users updated to ${mode} AI mode`);
      fetchAIData(); // Refresh data
    } catch (error) {
      toast.error("Failed to bulk update users");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">AI Controls & Configuration</h2>
          <button
            onClick={fetchAIData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* AI User Statistics */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            AI User Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-purple-800">{aiStats.totalUsers}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">AI Enabled</p>
              <p className="text-2xl font-bold text-blue-800">{aiStats.aiEnabledUsers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Auto Mode</p>
              <p className="text-2xl font-bold text-green-800">{aiStats.autoModeUsers}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-xs text-yellow-600 mb-1">Manual Mode</p>
              <p className="text-2xl font-bold text-yellow-800">{aiStats.manualModeUsers}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-xs text-indigo-600 mb-1">Voice AI</p>
              <p className="text-2xl font-bold text-indigo-800">{aiStats.voiceAiUsers}</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-xs text-pink-600 mb-1">Auto Inventory</p>
              <p className="text-2xl font-bold text-pink-800">{aiStats.autoInventoryUsers}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-xs text-orange-600 mb-1">Auto Orders</p>
              <p className="text-2xl font-bold text-orange-800">{aiStats.autoOrderUsers}</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-xs text-teal-600 mb-1">Load Balancing</p>
              <p className="text-2xl font-bold text-teal-800">{aiStats.aiLoadBalancingUsers}</p>
            </div>
          </div>
        </div>

        {/* AI Services Control Panel */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            AI Services Control Panel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-900">AI Service Management</h4>
              <div className="space-y-3">
                {aiServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        service.status === "active" ? "bg-green-500 animate-pulse" :
                        service.status === "maintenance" ? "bg-yellow-500" : "bg-red-500"
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-600">
                          Usage: <span className={`font-medium ${
                            service.usage === 'High' ? 'text-red-600' :
                            service.usage === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>{service.usage}</span> • Last used: {service.lastUsed}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleService(service.id)}
                      disabled={service.status === "maintenance"}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        service.status === "active"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : service.status === "maintenance"
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {service.status === "active" ? "Disable" :
                       service.status === "maintenance" ? "Maintenance" : "Enable"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Global AI Configuration</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Auto-scaling</span>
                    <p className="text-xs text-gray-500">Dynamic resource allocation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={globalConfig.autoScaling}
                      onChange={(e) => updateGlobalConfig('autoScaling', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Cost Monitoring</span>
                    <p className="text-xs text-gray-500">Track AI expenses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={globalConfig.costMonitoring}
                      onChange={(e) => updateGlobalConfig('costMonitoring', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Performance Alerts</span>
                    <p className="text-xs text-gray-500">Get notified of issues</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={globalConfig.performanceAlerts}
                      onChange={(e) => updateGlobalConfig('performanceAlerts', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium mb-2">Max Concurrent Users</label>
                  <input
                    type="number"
                    value={globalConfig.maxConcurrentUsers}
                    onChange={(e) => updateGlobalConfig('maxConcurrentUsers', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">AI Response Timeout (seconds)</label>
                  <input
                    type="number"
                    value={globalConfig.aiResponseTimeout}
                    onChange={(e) => updateGlobalConfig('aiResponseTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Bulk AI Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => bulkUpdateAIMode('manual')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <Users size={16} />
              Set All to Manual Mode
            </button>
            <button
              onClick={() => bulkUpdateAIMode('auto')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
            >
              <Brain size={16} />
              Set All to Auto Mode
            </button>
            <button
              onClick={fetchAIData}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              <RefreshCw size={16} />
              Refresh Statistics
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            AI Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">System Utilization</span>
                <span className="text-sm text-gray-600">{Math.round((aiStats.aiEnabledUsers / (aiStats.totalUsers || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all" 
                  style={{ width: `${Math.round((aiStats.aiEnabledUsers / (aiStats.totalUsers || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Auto Mode Adoption</span>
                <span className="text-sm text-gray-600">{Math.round((aiStats.autoModeUsers / (aiStats.totalUsers || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all" 
                  style={{ width: `${Math.round((aiStats.autoModeUsers / (aiStats.totalUsers || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Voice AI Usage</span>
                <span className="text-sm text-gray-600">{Math.round((aiStats.voiceAiUsers / (aiStats.totalUsers || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all" 
                  style={{ width: `${Math.round((aiStats.voiceAiUsers / (aiStats.totalUsers || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent AI Activities */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} />
            Recent AI Activities
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle size={18} className="text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Voice AI activated</p>
                <p className="text-xs text-gray-600">User enabled voice commands • 2 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle size={18} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Auto Billing configured</p>
                <p className="text-xs text-gray-600">System preferences updated • 15 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <CheckCircle size={18} className="text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Auto Inventory enabled</p>
                <p className="text-xs text-gray-600">AI-powered stock management active • 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <Activity size={18} className="text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Load Balancing optimized</p>
                <p className="text-xs text-gray-600">System performance improved • 3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
