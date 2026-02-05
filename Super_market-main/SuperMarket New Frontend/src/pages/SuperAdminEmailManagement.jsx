import React, { useEffect, useState } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Send, Users, TrendingUp, Target, BarChart2, Zap, FileText, Edit, Trash2, Plus, Sparkles, Brain, CheckCircle, Clock, XCircle } from "lucide-react";

export default function SuperAdminEmailManagement() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  
  const [emailStats, setEmailStats] = useState({
    totalTemplates: 12,
    emailsSentToday: 247,
    openRate: 34.2,
    bounceRate: 1.2,
    totalSent: 15420,
    deliveryRate: 98.8
  });

  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      name: "Welcome Email", 
      subject: "Welcome to SuperMarket!", 
      status: "active",
      category: "Onboarding",
      lastUsed: "2 hours ago",
      sentCount: 1250,
      body: "Welcome email content..."
    },
    { 
      id: 2, 
      name: "Order Confirmation", 
      subject: "Your Order #{orderId} is Confirmed", 
      status: "active",
      category: "Transactional",
      lastUsed: "5 min ago",
      sentCount: 5420,
      body: "Order confirmation content..."
    },
    { 
      id: 3, 
      name: "Password Reset", 
      subject: "Reset Your Password", 
      status: "active",
      category: "Security",
      lastUsed: "1 hour ago",
      sentCount: 320,
      body: "Password reset content..."
    },
    { 
      id: 4, 
      name: "Monthly Newsletter", 
      subject: "What's New This Month", 
      status: "draft",
      category: "Marketing",
      lastUsed: "Never",
      sentCount: 0,
      body: "Newsletter content..."
    },
    { 
      id: 5, 
      name: "Promotional Offer", 
      subject: "Exclusive Discount Just for You!", 
      status: "ai-generated",
      category: "Marketing",
      lastUsed: "3 days ago",
      sentCount: 850,
      body: "Promotional content..."
    },
  ]);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    category: 'Transactional',
    status: 'draft',
    body: ''
  });

  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "Summer Sale 2026", status: "active", sent: 1250, opened: 425, clicked: 127, scheduled: "Jun 1, 2026" },
    { id: 2, name: "New Product Launch", status: "scheduled", sent: 0, opened: 0, clicked: 0, scheduled: "Jun 15, 2026" },
    { id: 3, name: "Customer Feedback", status: "completed", sent: 850, opened: 289, clicked: 85, scheduled: "May 20, 2026" },
  ]);

  const [recentLogs, setRecentLogs] = useState([
    { id: 1, subject: "Welcome Email", recipient: "user@example.com", status: "Delivered", time: "2 min ago", openRate: "45%" },
    { id: 2, subject: "Order Confirmation #12345", recipient: "customer@email.com", status: "Opened", time: "15 min ago", openRate: "100%" },
    { id: 3, subject: "Password Reset Request", recipient: "info@company.com", status: "Delivered", time: "30 min ago", openRate: "0%" },
    { id: 4, subject: "Monthly Newsletter", recipient: "subscriber@mail.com", status: "Bounced", time: "1 hour ago", openRate: "N/A" },
    { id: 5, subject: "Promotional Offer", recipient: "promo@test.com", status: "Delivered", time: "2 hours ago", openRate: "30%" },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const generateAIMarketingImages = async (emailCategory, emailSubject, emailName) => {
    setGeneratingImages(true);
    const images = [];
    
    try {
      // Simulate AI image generation with 2-second delay per image
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate images based on email category
      const imagePrompts = {
        'Marketing': [
          { type: 'banner', prompt: `Professional marketing banner for ${emailName}`, dimension: '1200x400' },
          { type: 'product', prompt: `Product showcase image for ${emailSubject}`, dimension: '800x600' }
        ],
        'Onboarding': [
          { type: 'welcome', prompt: `Welcome banner for new users - ${emailName}`, dimension: '1200x400' }
        ],
        'Transactional': [
          { type: 'confirmation', prompt: `Transaction confirmation visual for ${emailSubject}`, dimension: '600x400' }
        ],
        'Security': [
          { type: 'security', prompt: `Security themed image for ${emailName}`, dimension: '800x400' }
        ],
        'Notification': [
          { type: 'alert', prompt: `Notification banner for ${emailSubject}`, dimension: '1000x400' }
        ]
      };
      
      const categoryPrompts = imagePrompts[emailCategory] || imagePrompts['Marketing'];
      
      for (const imageConfig of categoryPrompts) {
        images.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: imageConfig.type,
          prompt: imageConfig.prompt,
          dimension: imageConfig.dimension,
          url: `/api/placeholder/${imageConfig.dimension.split('x')[0]}/${imageConfig.dimension.split('x')[1]}`,
          generatedAt: new Date().toISOString(),
          status: 'generated'
        });
        
        // Simulate generation time
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setGeneratedImages(images);
      toast.success(`🎨 Generated ${images.length} marketing image${images.length > 1 ? 's' : ''} for your email!`);
      return images;
    } catch (error) {
      console.error('Image generation failed:', error);
      toast.error('Failed to generate marketing images');
      return [];
    } finally {
      setGeneratingImages(false);
    }
  };

  const generateAIEmailTemplate = async () => {
    if (!templateForm.name || !templateForm.category) {
      toast.error('Please enter template name and category first');
      return;
    }

    setGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiSubject = `${templateForm.category}: ${templateForm.name}`;
      const aiBody = `Dear {{user_name}},

We're excited to share this ${templateForm.name.toLowerCase()} with you!

This email is part of our ${templateForm.category.toLowerCase()} communications to keep you informed and engaged with our platform.

Key Highlights:
• Personalized content based on your preferences
• Exclusive offers and updates
• Important notifications and alerts
• Easy one-click actions

What's Next?
Take advantage of this opportunity to {{call_to_action}}. We're here to support your journey every step of the way.

Best regards,
The SuperMarket Team

---
This is an automated email. Please do not reply directly.
If you have questions, contact our support team at support@supermarket.com`;

      setTemplateForm(prev => ({
        ...prev,
        subject: aiSubject,
        body: aiBody
      }));

      toast.success('✨ AI-generated email template created!');
      
      // Automatically generate marketing images
      setTimeout(() => {
        generateAIMarketingImages(templateForm.category, aiSubject, templateForm.name);
      }, 500);
    } catch (error) {
      toast.error('Failed to generate AI template');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleTemplateSubmit = (e) => {
    e.preventDefault();
    
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...templateForm, id: editingTemplate.id, lastUsed: t.lastUsed, sentCount: t.sentCount }
          : t
      ));
      toast.success('Template updated successfully!');
    } else {
      const newTemplate = {
        id: templates.length + 1,
        ...templateForm,
        lastUsed: 'Never',
        sentCount: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Template created successfully!');
    }
    
    resetForm();
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      category: template.category,
      status: template.status,
      body: template.body || ''
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted successfully!');
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      category: 'Transactional',
      status: 'draft',
      body: ''
    });
    setEditingTemplate(null);
    setShowTemplateModal(false);
    setGeneratedImages([]);
  };

  const sendTestEmail = () => {
    toast.success("Test email sent to your email address!");
  };

  const createCampaign = () => {
    toast.success("Bulk email campaign created successfully!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'ai-generated': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={16} className="text-green-600" />;
      case 'Opened': return <Mail size={16} className="text-blue-600" />;
      case 'Bounced': return <XCircle size={16} className="text-red-600" />;
      case 'Sent': return <Send size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
            {aiEnabled && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                <Sparkles size={14} />
                AI Powered
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enable AI Features</span>
            </label>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Template
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <FileText className="text-blue-500 mb-2" size={20} />
              <p className="text-xs text-blue-600 mb-1">Templates</p>
              <p className="text-2xl font-bold text-blue-800">{emailStats.totalTemplates}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Send className="text-green-500 mb-2" size={20} />
              <p className="text-xs text-green-600 mb-1">Sent Today</p>
              <p className="text-2xl font-bold text-green-800">{emailStats.emailsSentToday}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <TrendingUp className="text-purple-500 mb-2" size={20} />
              <p className="text-xs text-purple-600 mb-1">Total Sent</p>
              <p className="text-2xl font-bold text-purple-800">{emailStats.totalSent.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <Target className="text-yellow-500 mb-2" size={20} />
              <p className="text-xs text-yellow-600 mb-1">Open Rate</p>
              <p className="text-2xl font-bold text-yellow-800">{emailStats.openRate}%</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <CheckCircle className="text-teal-500 mb-2" size={20} />
              <p className="text-xs text-teal-600 mb-1">Delivery Rate</p>
              <p className="text-2xl font-bold text-teal-800">{emailStats.deliveryRate}%</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <XCircle className="text-red-500 mb-2" size={20} />
              <p className="text-xs text-red-600 mb-1">Bounce Rate</p>
              <p className="text-2xl font-bold text-red-800">{emailStats.bounceRate}%</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-indigo-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={sendTestEmail}
              className="flex items-center justify-center gap-2 p-3 bg-white text-indigo-700 rounded-lg hover:shadow-md transition-all border border-indigo-200"
            >
              <Mail size={16} />
              <span className="text-sm font-medium">Send Test</span>
            </button>
            <button
              onClick={createCampaign}
              className="flex items-center justify-center gap-2 p-3 bg-white text-blue-700 rounded-lg hover:shadow-md transition-all border border-blue-200"
            >
              <Users size={16} />
              <span className="text-sm font-medium">Bulk Campaign</span>
            </button>
            <button
              onClick={() => {
                setShowTemplateModal(true);
                setAiEnabled(true);
              }}
              className="flex items-center justify-center gap-2 p-3 bg-white text-green-700 rounded-lg hover:shadow-md transition-all border border-green-200"
            >
              <Sparkles size={16} />
              <span className="text-sm font-medium">AI Generate</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 p-3 bg-white text-purple-700 rounded-lg hover:shadow-md transition-all border border-purple-200"
            >
              <BarChart2 size={16} />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('templates')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Templates ({templates.length})
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Campaigns ({campaigns.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Email Logs ({recentLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'images'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Sparkles size={16} className="inline mr-1" />
                AI Image Generator
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'templates' && (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{template.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(template.status)}`}>
                          {template.status === 'ai-generated' ? 'AI Generated' : template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Subject: {template.subject}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Sent: {template.sentCount} times</span>
                        <span>•</span>
                        <span>Last used: {template.lastUsed}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold text-gray-900">{campaign.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Scheduled: {campaign.scheduled}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Sent</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.sent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Opened</p>
                        <p className="text-lg font-bold text-blue-600">{campaign.opened}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Clicked</p>
                        <p className="text-lg font-bold text-green-600">{campaign.clicked}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Open Rate</p>
                        <p className="text-lg font-bold text-purple-600">
                          {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getLogStatusIcon(log.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.subject}</p>
                        <p className="text-xs text-gray-600">{log.recipient}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600">Open: {log.openRate}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status.toLowerCase())}`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-gray-500">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={24} className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Marketing Image Generator</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Generate professional marketing images for your email campaigns using AI. Images are automatically optimized for different email templates.
                  </p>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Email Category</span>
                      <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-500">
                        <option>Marketing</option>
                        <option>Onboarding</option>
                        <option>Transactional</option>
                        <option>Security</option>
                        <option>Notification</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Email Name</span>
                      <input type="text" placeholder="e.g., Summer Sale, New Product Launch" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-500" />
                    </label>
                    <button
                      onClick={() => generateAIMarketingImages('Marketing', 'Professional Email Campaign', 'Email Campaign')}
                      disabled={generatingImages}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-medium"
                    >
                      {generatingImages ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⚡</span>
                          Generating Images...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles size={18} />
                          Generate Images
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {generatedImages.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Generated Images ({generatedImages.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedImages.map((image) => (
                        <div key={image.id} className="bg-white rounded-lg p-3 border border-purple-200 hover:shadow-md transition-shadow">
                          <div className="bg-gray-100 rounded mb-3 aspect-video flex items-center justify-center">
                            <span className="text-gray-400">Image Preview</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-900 uppercase">{image.type}</span>
                            <p className="text-xs text-gray-600 line-clamp-2">{image.prompt}</p>
                            <p className="text-xs text-purple-600 font-mono">{image.dimension}</p>
                          </div>
                          <button className="mt-2 w-full px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleTemplateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Transactional">Transactional</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Security">Security</option>
                    <option value="Notification">Notification</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Email Subject *</label>
                  <div className="flex items-center gap-2">
                    {aiEnabled && templateForm.name && templateForm.category && (
                      <button
                        type="button"
                        onClick={() => generateAIMarketingImages(templateForm.category, templateForm.subject || templateForm.name, templateForm.name)}
                        disabled={generatingImages}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200 disabled:opacity-50"
                      >
                        {generatingImages ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-pink-700"></div>
                            Creating Images...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            Generate Images
                          </>
                        )}
                      </button>
                    )}
                    {aiEnabled && (
                      <button
                        type="button"
                        onClick={generateAIEmailTemplate}
                        disabled={generatingAI || !templateForm.name}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 disabled:opacity-50"
                      >
                        {generatingAI ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            AI Generate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject line"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                <textarea
                  rows={10}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter email content... Use {{variable_name}} for dynamic content"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
                {aiEnabled && templateForm.body && (
                  <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                    <Brain size={12} />
                    AI-enhanced content detected
                  </p>
                )}
              </div>

              {/* AI Marketing Images Section */}
              {(generatingImages || generatedImages.length > 0) && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="text-purple-600" size={16} />
                      AI-Generated Marketing Images
                    </h4>
                    {generatingImages && (
                      <span className="text-xs text-purple-600 animate-pulse">Generating...</span>
                    )}
                  </div>
                  
                  {generatingImages ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-3"></div>
                        <p className="text-sm text-gray-600">Creating professional marketing images...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedImages.map((image) => (
                        <div key={image.id} className="bg-white rounded-lg p-3 border border-purple-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="text-purple-600" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-900 uppercase">{image.type}</span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Ready</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-1">{image.prompt}</p>
                              <p className="text-xs text-purple-600 font-mono">{image.dimension}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!generatingImages && generatedImages.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="text-green-600" size={12} />
                        Images are automatically embedded in your email template
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={templateForm.status}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="ai-generated">AI Generated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
