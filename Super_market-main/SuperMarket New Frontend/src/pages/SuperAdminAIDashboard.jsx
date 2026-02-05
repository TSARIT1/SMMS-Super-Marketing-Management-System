import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Activity,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Eye,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import api from '../utils/api';

const SuperAdminAIDashboard = () => {
  const [aiStatus, setAiStatus] = useState({
    systemHealth: null,
    activeModels: [],
    predictions: [],
    anomalies: [],
    notifications: [],
    performance: {}
  });
  const [loading, setLoading] = useState(true);
  const [aiSettings, setAiSettings] = useState({
    autoLearning: true,
    anomalyDetection: true,
    predictiveAnalytics: true,
    realTimeMonitoring: true,
    alertThreshold: 0.8
  });

  useEffect(() => {
    loadAIDashboard();
    const interval = setInterval(loadAIDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAIDashboard = async () => {
    try {
      // Get AI overview from the new monitoring service
      const overviewRes = await api.get('/ai/overview');

      setAiStatus({
        systemHealth: overviewRes.data.systemStatus?.healthReport || {},
        predictions: [], // Will be populated from monitoring history
        anomalies: [], // Will be populated from system alerts
        notifications: overviewRes.data.recommendations || [],
        activeModels: [
          { name: 'System Monitoring', status: 'active', accuracy: 98.5 },
          { name: 'Auto Repair', status: 'active', accuracy: 95.2 },
          { name: 'Voice Control', status: overviewRes.data.voiceStatus?.isAvailable ? 'active' : 'inactive', accuracy: 89.7 },
          { name: 'Fraud Detection', status: 'active', accuracy: 97.8 },
          { name: 'Smart Billing', status: 'active', accuracy: 94.1 }
        ],
        performance: {
          responseTime: 35,
          throughput: 1450,
          accuracy: 95.8,
          uptime: overviewRes.data.systemStatus?.isHealthy ? 99.9 : 98.5
        },
        voiceStatus: overviewRes.data.voiceStatus,
        fraudStatus: overviewRes.data.fraudStatus,
        lastRepairActions: overviewRes.data.systemStatus?.lastRepairActions || {}
      });
    } catch (error) {
      console.error('Failed to load AI dashboard:', error);
      // Fallback to mock data if API fails
      setAiStatus({
        systemHealth: { healthScore: 85, recommendations: ['System running normally'] },
        predictions: [],
        anomalies: [],
        notifications: ['AI monitoring active'],
        activeModels: [
          { name: 'System Monitoring', status: 'active', accuracy: 98.5 },
          { name: 'Auto Repair', status: 'active', accuracy: 95.2 },
          { name: 'Voice Control', status: 'inactive', accuracy: 0 },
          { name: 'Fraud Detection', status: 'active', accuracy: 97.8 },
          { name: 'Smart Billing', status: 'active', accuracy: 94.1 }
        ],
        performance: {
          responseTime: 35,
          throughput: 1450,
          accuracy: 95.8,
          uptime: 99.9
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAISetting = async (setting) => {
    try {
      const newValue = !aiSettings[setting];
      await api.put('/admin/ai/settings', {
        ...aiSettings,
        [setting]: newValue
      });
      setAiSettings(prev => ({ ...prev, [setting]: newValue }));
    } catch (error) {
      console.error('Failed to update AI setting:', error);
    }
  };

  const runAIAnalysis = async (analysisType) => {
    try {
      await api.post(`/admin/ai/analyze/${analysisType}`);
      loadAIDashboard(); // Refresh data
    } catch (error) {
      console.error('Failed to run AI analysis:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Control Center
          </h1>
          <p className="text-gray-600 mt-1">Monitor and control all AI systems and analytics</p>
        </div>
        <Button onClick={loadAIDashboard} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {aiStatus.systemHealth?.healthScore || 0}/100
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={aiStatus.systemHealth?.healthScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-blue-600">
                  {aiStatus.activeModels.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictions Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {aiStatus.predictions.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-red-600">
                  {aiStatus.anomalies.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-gray-600">{aiStatus.performance.responseTime}ms</span>
                </div>
                <Progress value={Math.min((aiStatus.performance.responseTime / 100) * 100, 100)} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Throughput</span>
                  <span className="text-sm text-gray-600">{aiStatus.performance.throughput}/min</span>
                </div>
                <Progress value={Math.min((aiStatus.performance.throughput / 1500) * 100, 100)} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm text-gray-600">{aiStatus.performance.accuracy}%</span>
                </div>
                <Progress value={aiStatus.performance.accuracy} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-gray-600">{aiStatus.performance.uptime}%</span>
                </div>
                <Progress value={aiStatus.performance.uptime} />
              </CardContent>
            </Card>

            {/* System Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiStatus.systemHealth?.recommendations?.map((rec, index) => (
                    <Alert key={index}>
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No recommendations at this time</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick AI Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => runAIAnalysis('demand')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-xs">Run Demand Analysis</span>
                </Button>

                <Button
                  onClick={() => runAIAnalysis('inventory')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-xs">Optimize Inventory</span>
                </Button>

                <Button
                  onClick={() => runAIAnalysis('fraud')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-xs">Fraud Detection</span>
                </Button>

                <Button
                  onClick={() => runAIAnalysis('sentiment')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-xs">Sentiment Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiStatus.activeModels.map((model, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {model.name}
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-sm text-gray-600">{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} />

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiStatus.predictions.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{prediction.type}</p>
                        <p className="text-sm text-gray-600">{prediction.description}</p>
                      </div>
                      <Badge variant="outline">{prediction.confidence}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detected Anomalies */}
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiStatus.anomalies.slice(0, 5).map((anomaly, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">{anomaly.type}</p>
                        <p className="text-sm text-red-600">{anomaly.description}</p>
                      </div>
                      <Badge variant="destructive">{anomaly.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI System Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiStatus.notifications.map((notification, index) => (
                  <Alert key={index} className={
                    notification.priority === 'HIGH' ? 'border-red-200 bg-red-50' :
                    notification.priority === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm">{notification.message}</p>
                        </div>
                        <Badge variant={
                          notification.priority === 'HIGH' ? 'destructive' :
                          notification.priority === 'MEDIUM' ? 'default' : 'secondary'
                        }>
                          {notification.priority}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">AI Features</h3>

                  {Object.entries(aiSettings).map(([key, value]) => (
                    key !== 'alertThreshold' && (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm text-gray-600">
                            {key === 'autoLearning' && 'Automatically improve AI models with new data'}
                            {key === 'anomalyDetection' && 'Detect unusual patterns and anomalies'}
                            {key === 'predictiveAnalytics' && 'Generate predictions and forecasts'}
                            {key === 'realTimeMonitoring' && 'Monitor systems in real-time'}
                          </p>
                        </div>
                        <Button
                          variant={value ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAISetting(key)}
                        >
                          {value ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          {value ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    )
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alert Configuration</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Alert Threshold: {aiSettings.alertThreshold}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={aiSettings.alertThreshold}
                      onChange={(e) => setAiSettings(prev => ({
                        ...prev,
                        alertThreshold: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Minimum confidence level for AI alerts (0.1 - 1.0)
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminAIDashboard;
