import React, { useState, useEffect } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import toast, { Toaster } from "react-hot-toast";
import {
  Settings,
  Database,
  Mail,
  Bell,
  Shield,
  Server,
  HardDrive,
  Wifi,
  Save,
  RotateCcw,
} from "lucide-react";

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: "SuperMarket Pro",
    systemEmail: "info@tsaritservices.com",
    maintenanceMode: false,
    
    // Email Settings
    emailHost: "smtp.gmail.com",
    emailPort: "587",
    emailUsername: "",
    emailPassword: "",
    emailFromAddress: "info@tsaritservices.com",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    twoFactorAuth: false,
    
    // Database Settings
    dbBackupEnabled: true,
    dbBackupFrequency: "daily",
    dbBackupRetentionDays: 30,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save settings to backend (API call would go here)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    toast.info("Settings reset to defaults");
    // Reset to default values
  };

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="text-indigo-600" size={32} />
                System Settings
              </h1>
              <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2 transition"
              >
                <RotateCcw size={20} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Server size={20} className="text-indigo-600" />
              General Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  name="systemName"
                  value={settings.systemName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Email
                </label>
                <input
                  type="email"
                  name="systemEmail"
                  value={settings.systemEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />
              Email Configuration
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  name="emailHost"
                  value={settings.emailHost}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  name="emailPort"
                  value={settings.emailPort}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="emailUsername"
                  value={settings.emailUsername}
                  onChange={handleChange}
                  placeholder="smtp username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="emailPassword"
                  value={settings.emailPassword}
                  onChange={handleChange}
                  placeholder="smtp password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Address
                </label>
                <input
                  type="email"
                  name="emailFromAddress"
                  value={settings.emailFromAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              Notification Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Send notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Send push notifications to users</p>
              </div>
              <input
                type="checkbox"
                name="pushNotifications"
                checked={settings.pushNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Security Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  name="passwordExpiryDays"
                  value={settings.passwordExpiryDays}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database size={20} className="text-indigo-600" />
              Database & Backup Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                name="dbBackupEnabled"
                checked={settings.dbBackupEnabled}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Automatic Database Backups
              </label>
            </div>
            {settings.dbBackupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    name="dbBackupFrequency"
                    value={settings.dbBackupFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    name="dbBackupRetentionDays"
                    value={settings.dbBackupRetentionDays}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
