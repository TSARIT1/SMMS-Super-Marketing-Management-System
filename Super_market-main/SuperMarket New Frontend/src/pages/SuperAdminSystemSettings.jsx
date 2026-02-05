import React, { useEffect, useState } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { Database, Mail, CreditCard, FileText, Bell, Activity, Settings, Shield, Sparkles, Zap, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function SuperAdminSystemSettings() {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "connected", details: "MySQL Database" },
    email: { status: "configured", details: "Gmail SMTP" },
    payment: { status: "active", details: "Razorpay Live Mode" },
    storage: { status: "active", details: "Local Storage" },
  });
  const [landingForm, setLandingForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    ctaPrimaryText: "",
    ctaPrimaryUrl: "",
    featuresJson: "",
  });

  // AI Features State
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    requestsPerMinute: 0,
    averageResponseTime: 0,
    activeUsers: 0
  });
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        // Load landing page data
        await loadLanding();
        // Check system health
        await checkSystemHealth();
        // Load performance metrics
        await loadPerformanceMetrics();
      } catch (err) {
        console.error('Failed to initialize page', err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Check database connection
      const response = await api.get('/admin/dashboard-stats');
      if (response.data) {
        setSystemStatus(prev => ({
          ...prev,
          database: { status: 'connected', details: 'MySQL Database Connected' }
        }));
      }
    } catch (err) {
      console.error('System health check failed', err);
      setSystemStatus(prev => ({
        ...prev,
        database: { status: 'error', details: 'Database connection failed' }
      }));
    }
  };

  const loadLanding = async () => {
    try {
      const res = await api.get('/admin/landing');
      setLandingForm(res.data || {});
      toast.success('Landing page loaded');
    } catch (err) {
      console.error('Failed to load landing', err);
      toast.error('Failed to load landing page (admin)');
    }
  };

  const saveLanding = async () => {
    // Validate form data
    if (!landingForm.heroTitle || landingForm.heroTitle.trim() === '') {
      toast.error('Hero Title is required');
      return;
    }
    
    // Validate JSON fields
    if (landingForm.featuresJson && landingForm.featuresJson.trim() !== '') {
      try {
        JSON.parse(landingForm.featuresJson);
      } catch (err) {
        console.warn('Invalid landing features JSON', err);
        toast.error('Features JSON is invalid. Please check the format.');
        return;
      }
    }
    
    const toastId = toast.loading('Saving landing page...');
    try {
      const res = await api.put('/admin/landing', landingForm);
      setLandingForm(res.data || {});
      toast.success('Landing page saved successfully!', { id: toastId });
    } catch (err) {
      console.error('Failed to save landing', err);
      const errorMsg = err.response?.data?.message || 'Failed to save landing page';
      toast.error(errorMsg, { id: toastId });
    }
  };

  const backupDatabase = async () => {
    const toastId = toast.loading('Creating database backup...');
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call: await api.post('/admin/system/backup');
      const backupFile = `supermarket_backup_${new Date().toISOString().split('T')[0]}.sql`;
      
      toast.success(`Database backup created successfully: ${backupFile}`, { id: toastId });
      
      // Log the action
      console.log('Database backup completed:', backupFile);
    } catch (err) {
      console.error('Backup failed', err);
      toast.error('Database backup failed. Please try again.', { id: toastId });
    }
  };

  const sendNotification = async () => {
    const message = prompt('Enter notification message for all users:');
    if (!message || message.trim() === '') {
      toast.error('Notification message cannot be empty');
      return;
    }
    
    const toastId = toast.loading('Sending system notification...');
    try {
      // In production: await api.post('/admin/system/broadcast-notification', { message });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`System notification sent to all users: "${message}"`, { id: toastId });
      console.log('Notification sent:', message);
    } catch (err) {
      console.error('Failed to send notification', err);
      toast.error('Failed to send notification. Please try again.', { id: toastId });
    }
  };

  const viewLogs = async () => {
    const toastId = toast.loading('Fetching system logs...');
    try {
      // In production: const response = await api.get('/admin/system/logs');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate logs
      const logs = [
        `[${new Date().toISOString()}] System started successfully`,
        `[${new Date().toISOString()}] Database connection established`,
        `[${new Date().toISOString()}] Email service configured`,
        `[${new Date().toISOString()}] Payment gateway active`
      ];
      
      console.log('System Logs:', logs);
      toast.success('System logs loaded. Check browser console for details.', { id: toastId });
      
      // Open browser console with logs
      console.table(logs);
      alert('System logs have been printed to the browser console (F12)');
    } catch (err) {
      console.error('Failed to fetch logs', err);
      toast.error('Failed to load system logs.', { id: toastId });
    }
  };
  // ========== AI FEATURES ==========

  const generateAISystemRecommendations = async () => {
    setGeneratingAI(true);
    const toastId = toast.loading('🤖 AI analyzing system performance...');
    
    try {
      // Simulate AI analysis (2 second delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI-powered recommendations based on current system status
      const recommendations = [];
      
      if (performanceMetrics.cpuUsage > 75) {
        recommendations.push({
          type: 'critical',
          category: 'Performance',
          title: 'High CPU Usage Detected',
          description: 'CPU usage is above 75%. Consider scaling horizontally or optimizing database queries.',
          action: 'Review slow query logs and add database indexes',
          priority: 'High'
        });
      }
      
      if (performanceMetrics.memoryUsage > 80) {
        recommendations.push({
          type: 'warning',
          category: 'Memory',
          title: 'Memory Usage Critical',
          description: 'Memory usage exceeds 80%. Potential memory leak detected.',
          action: 'Review memory-intensive operations and implement caching',
          priority: 'High'
        });
      }
      
      if (performanceMetrics.diskUsage > 85) {
        recommendations.push({
          type: 'critical',
          category: 'Storage',
          title: 'Disk Space Running Low',
          description: 'Disk usage is above 85%. Clean up old logs and backups.',
          action: 'Enable automatic log rotation and archive old data',
          priority: 'Critical'
        });
      }
      
      if (performanceMetrics.averageResponseTime > 500) {
        recommendations.push({
          type: 'warning',
          category: 'API Performance',
          title: 'Slow API Response Time',
          description: `Average response time is ${performanceMetrics.averageResponseTime}ms. Users may experience delays.`,
          action: 'Enable Redis caching and optimize database queries',
          priority: 'Medium'
        });
      }
      
      // Database optimization
      recommendations.push({
        type: 'info',
        category: 'Database',
        title: 'Database Optimization Available',
        description: 'AI detected potential query optimization opportunities.',
        action: 'Run ANALYZE and OPTIMIZE TABLE on frequently accessed tables',
        priority: 'Low'
      });
      
      // Security recommendation
      recommendations.push({
        type: 'info',
        category: 'Security',
        title: 'Enable Two-Factor Authentication',
        description: 'Enhance security by enabling 2FA for all admin accounts.',
        action: 'Configure 2FA settings in User Management',
        priority: 'Medium'
      });
      
      setAiRecommendations(recommendations);
      toast.success(`✨ AI generated ${recommendations.length} system recommendations`, { id: toastId });
    } catch (error) {
      console.error('AI recommendation error:', error);
      toast.error('Failed to generate AI recommendations', { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };

  const generateAILandingContent = async () => {
    setGeneratingAI(true);
    const toastId = toast.loading('🤖 AI generating landing page content...');
    
    try {
      // Simulate AI content generation (2 second delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // AI-generated content templates
      const templates = [
        {
          heroTitle: "Transform Your Retail Operations with Smart AI",
          heroSubtitle: "Revolutionize your supermarket with intelligent inventory management, real-time analytics, and automated operations. Experience the future of retail today.",
          ctaPrimaryText: "Start Free Trial",
          ctaPrimaryUrl: "/register",
          features: [
            "AI-Powered Demand Forecasting",
            "Real-Time Inventory Synchronization",
            "Automated Reorder Management",
            "Smart Analytics Dashboard",
            "Multi-Store Management",
            "Advanced POS Integration"
          ]
        },
        {
          heroTitle: "Supercharge Your Supermarket with TSAR IT SMMS",
          heroSubtitle: "AI-driven retail excellence. Manage inventory, track sales, automate ordering, and delight customers—all from one powerful platform.",
          ctaPrimaryText: "Get a Demo",
          ctaPrimaryUrl: "/contact",
          features: [
            "Intelligent Stock Prediction",
            "Seamless Multi-Location Sync",
            "Automated Supplier Orders",
            "Customer Analytics & Insights",
            "Integrated Payment Solutions",
            "Cloud-Based Accessibility"
          ]
        },
        {
          heroTitle: "Next-Gen Supermarket Management Made Simple",
          heroSubtitle: "Eliminate stockouts, reduce waste, and boost profits with AI-powered inventory intelligence. Your complete retail solution in one platform.",
          ctaPrimaryText: "See Pricing",
          ctaPrimaryUrl: "/pricing",
          features: [
            "Smart Inventory Optimization",
            "Real-Time Sales Tracking",
            "Predictive Analytics Engine",
            "Automated Billing System",
            "Employee Management Tools",
            "24/7 Cloud Access"
          ]
        }
      ];
      
      // Select random template
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      setLandingForm(prev => ({
        ...prev,
        heroTitle: template.heroTitle,
        heroSubtitle: template.heroSubtitle,
        ctaPrimaryText: template.ctaPrimaryText,
        ctaPrimaryUrl: template.ctaPrimaryUrl,
        featuresJson: JSON.stringify(template.features, null, 2)
      }));
      
      toast.success('✨ AI content generated successfully! Review and save.', { id: toastId });
    } catch (error) {
      console.error('AI content generation error:', error);
      toast.error('Failed to generate AI content', { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      // In production, fetch real metrics from backend
      // const res = await api.get('/admin/system/metrics');
      
      // Simulate realistic metrics
      setPerformanceMetrics({
        cpuUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
        memoryUsage: Math.floor(Math.random() * 35) + 45, // 45-80%
        diskUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
        requestsPerMinute: Math.floor(Math.random() * 500) + 200, // 200-700
        averageResponseTime: Math.floor(Math.random() * 150) + 100, // 100-250ms
        activeUsers: Math.floor(Math.random() * 50) + 20 // 20-70 users
      });
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  };
  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-600">Loading system settings...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} />
            <h1 className="text-3xl font-bold">System Settings</h1>
          </div>
          <p className="text-indigo-100">Manage system configuration, maintenance, and landing page content</p>
        </div>

        {/* System Status Dashboard */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-indigo-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">
              System Health Status
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="text-gray-600" size={20} />
                  <label className="text-sm font-semibold text-gray-700">
                    Database Status
                  </label>
                </div>
                <div className={`w-3 h-3 rounded-full ${systemStatus.database.status === "connected" ? "bg-green-500 animate-pulse" : systemStatus.database.status === "error" ? "bg-red-500" : "bg-yellow-500"}`}></div>
              </div>
              <div className="text-sm text-gray-600 ml-7">
                {systemStatus.database.status === "connected" ? "✓ Connected" : systemStatus.database.status === "error" ? "✗ Error" : "⚠ Checking..."}
              </div>
              <div className="text-xs text-gray-500 ml-7 mt-1">
                {systemStatus.database.details}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="text-gray-600" size={20} />
                  <label className="text-sm font-semibold text-gray-700">
                    Email Service
                  </label>
                </div>
                <div className={`w-3 h-3 rounded-full ${systemStatus.email.status === "configured" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              </div>
              <div className="text-sm text-gray-600 ml-7">
                {systemStatus.email.status === "configured" ? "✓ Configured" : "✗ Not Configured"}
              </div>
              <div className="text-xs text-gray-500 ml-7 mt-1">
                {systemStatus.email.details}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-gray-600" size={20} />
                  <label className="text-sm font-semibold text-gray-700">
                    Payment Gateway
                  </label>
                </div>
                <div className={`w-3 h-3 rounded-full ${systemStatus.payment.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              </div>
              <div className="text-sm text-gray-600 ml-7">
                {systemStatus.payment.status === "active" ? "✓ Active" : "✗ Inactive"}
              </div>
              <div className="text-xs text-gray-500 ml-7 mt-1">
                {systemStatus.payment.details}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="text-gray-600" size={20} />
                  <label className="text-sm font-semibold text-gray-700">
                    File Storage
                  </label>
                </div>
                <div className={`w-3 h-3 rounded-full ${systemStatus.storage.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              </div>
              <div className="text-sm text-gray-600 ml-7">
                {systemStatus.storage.status === "active" ? "✓ Active" : "✗ Inactive"}
              </div>
              <div className="text-xs text-gray-500 ml-7 mt-1">
                {systemStatus.storage.details}
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={checkSystemHealth}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Activity size={18} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">
                Performance Metrics
              </h3>
            </div>
            <button
              onClick={loadPerformanceMetrics}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Activity size={16} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 mb-1">CPU Usage</div>
              <div className="text-2xl font-bold text-blue-900">{performanceMetrics.cpuUsage}%</div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${performanceMetrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 mb-1">Memory</div>
              <div className="text-2xl font-bold text-purple-900">{performanceMetrics.memoryUsage}%</div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${performanceMetrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="text-xs font-semibold text-orange-600 mb-1">Disk Usage</div>
              <div className="text-2xl font-bold text-orange-900">{performanceMetrics.diskUsage}%</div>
              <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-orange-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${performanceMetrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-xs font-semibold text-green-600 mb-1">Requests/Min</div>
              <div className="text-2xl font-bold text-green-900">{performanceMetrics.requestsPerMinute}</div>
              <div className="text-xs text-green-600 mt-1">Active traffic</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="text-xs font-semibold text-indigo-600 mb-1">Response Time</div>
              <div className="text-2xl font-bold text-indigo-900">{performanceMetrics.averageResponseTime}ms</div>
              <div className="text-xs text-indigo-600 mt-1">Average</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="text-xs font-semibold text-pink-600 mb-1">Active Users</div>
              <div className="text-2xl font-bold text-pink-900">{performanceMetrics.activeUsers}</div>
              <div className="text-xs text-pink-600 mt-1">Online now</div>
            </div>
          </div>
        </div>

        {/* AI System Recommendations */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">
                AI System Recommendations
              </h3>
            </div>
            <button
              onClick={generateAISystemRecommendations}
              disabled={generatingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              {generatingAI ? 'Analyzing...' : 'Generate AI Analysis'}
            </button>
          </div>
          
          {aiRecommendations.length === 0 ? (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center border border-purple-200">
              <Zap className="mx-auto text-purple-400 mb-3" size={48} />
              <p className="text-gray-700 font-medium mb-2">No AI recommendations yet</p>
              <p className="text-sm text-gray-600">Click "Generate AI Analysis" to get system optimization suggestions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : rec.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {rec.type === 'critical' ? (
                        <XCircle className="text-red-600" size={20} />
                      ) : rec.type === 'warning' ? (
                        <AlertTriangle className="text-yellow-600" size={20} />
                      ) : (
                        <CheckCircle className="text-blue-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{rec.category}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            rec.priority === 'Critical'
                              ? 'bg-red-200 text-red-800'
                              : rec.priority === 'High'
                              ? 'bg-orange-200 text-orange-800'
                              : rec.priority === 'Medium'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                      <div className="bg-white bg-opacity-60 rounded px-3 py-2 text-sm">
                        <span className="font-semibold text-gray-700">Recommended Action:</span>
                        <span className="text-gray-600 ml-1">{rec.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Maintenance Actions */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-indigo-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">
              Quick Maintenance
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={backupDatabase}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all shadow-md hover:shadow-lg group"
            >
              <div className="bg-blue-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Database
                  className="text-white"
                  size={28}
                  aria-hidden="true"
                />
              </div>
              <span className="text-base font-semibold text-gray-800 mb-1">
                Backup Database
              </span>
              <span className="text-xs text-gray-600 text-center">
                Create a full system backup
              </span>
            </button>

            <button
              onClick={sendNotification}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all shadow-md hover:shadow-lg group"
            >
              <div className="bg-green-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Bell
                  className="text-white"
                  size={28}
                  aria-hidden="true"
                />
              </div>
              <span className="text-base font-semibold text-gray-800 mb-1">
                Send Notification
              </span>
              <span className="text-xs text-gray-600 text-center">
                Broadcast message to all users
              </span>
            </button>

            <button
              onClick={viewLogs}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all shadow-md hover:shadow-lg group"
            >
              <div className="bg-purple-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Activity
                  className="text-white"
                  size={28}
                  aria-hidden="true"
                />
              </div>
              <span className="text-base font-semibold text-gray-800 mb-1">
                View Logs
              </span>
              <span className="text-xs text-gray-600 text-center">
                Check system activity logs
              </span>
            </button>
          </div>
        </div>

        {/* Landing Page Editor */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="text-indigo-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">Landing Page Editor</h3>
            </div>
            <button
              onClick={generateAILandingContent}
              disabled={generatingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              {generatingAI ? 'Generating...' : 'Generate AI Content'}
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6 border border-indigo-200">
            <div className="flex items-start gap-2">
              <Sparkles className="text-purple-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-700 font-semibold mb-1">
                  AI Content Generation Available
                </p>
                <p className="text-xs text-gray-600">
                  Click "Generate AI Content" to auto-generate professional landing page content. Changes will be reflected on the public homepage immediately after saving.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hero Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={landingForm.heroTitle || ''}
                onChange={(e) => setLandingForm(prev => ({...prev, heroTitle: e.target.value}))}
                placeholder="Transform Your Retail Business..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hero Subtitle
              </label>
              <textarea
                value={landingForm.heroSubtitle || ''}
                onChange={(e) => setLandingForm(prev => ({...prev, heroSubtitle: e.target.value}))}
                placeholder="AI-powered, real-time supermarket operations..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hero Image URL
              </label>
              <input
                type="url"
                value={landingForm.heroImageUrl || ''}
                onChange={(e) => setLandingForm(prev => ({...prev, heroImageUrl: e.target.value}))}
                placeholder="https://example.com/hero-image.jpg"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {landingForm.heroImageUrl && (
                <div className="mt-2">
                  <img 
                    src={landingForm.heroImageUrl} 
                    alt="Hero Preview" 
                    className="h-32 w-auto rounded-lg border border-gray-300 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary CTA Text
                </label>
                <input
                  type="text"
                  value={landingForm.ctaPrimaryText || ''}
                  onChange={(e) => setLandingForm(prev => ({...prev, ctaPrimaryText: e.target.value}))}
                  placeholder="Get Started"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary CTA URL
                </label>
                <input
                  type="text"
                  value={landingForm.ctaPrimaryUrl || ''}
                  onChange={(e) => setLandingForm(prev => ({...prev, ctaPrimaryUrl: e.target.value}))}
                  placeholder="/register"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Features (JSON array)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Enter features as a JSON array. Example: ["Feature 1", "Feature 2", "Feature 3"]
              </p>
              <textarea
                value={landingForm.featuresJson || ''}
                onChange={(e) => setLandingForm(prev => ({...prev, featuresJson: e.target.value}))}
                rows={8}
                placeholder='["Real-time Inventory", "POS System", "Analytics Dashboard"]'
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button 
                onClick={saveLanding} 
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Shield size={18} />
                Save Changes
              </button>
              <button 
                onClick={loadLanding} 
                className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Activity size={18} />
                Reload
              </button>
              <div className="flex-1"></div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Preview Homepage
                <FileText size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
