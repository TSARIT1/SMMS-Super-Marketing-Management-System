import React, { useState, useEffect } from "react";
import {
  Printer, Scan, Camera, Monitor, Wifi, Usb, Bluetooth,
  Plus, Trash2, Edit2, Check, X, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Settings, ChevronDown, Search,
  HardDrive, CreditCard, Scale, Eye, Barcode
} from "lucide-react";
import api from "../utils/api";

// Device type configurations
const deviceTypeConfig = {
  // Printers
  PRINTER_THERMAL: { icon: Printer, label: "Thermal Printer", category: "printer", color: "blue" },
  PRINTER_INKJET: { icon: Printer, label: "Inkjet Printer", category: "printer", color: "blue" },
  PRINTER_LASER: { icon: Printer, label: "Laser Printer", category: "printer", color: "blue" },
  PRINTER_DOT_MATRIX: { icon: Printer, label: "Dot Matrix Printer", category: "printer", color: "blue" },
  PRINTER_LABEL: { icon: Printer, label: "Label Printer", category: "printer", color: "blue" },
  // Scanners
  SCANNER_BARCODE: { icon: Barcode, label: "Barcode Scanner", category: "scanner", color: "green" },
  SCANNER_DOCUMENT: { icon: Scan, label: "Document Scanner", category: "scanner", color: "green" },
  SCANNER_QR: { icon: Barcode, label: "QR Code Scanner", category: "scanner", color: "green" },
  // Cameras
  CAMERA_SECURITY: { icon: Eye, label: "Security Camera", category: "camera", color: "purple" },
  CAMERA_WEBCAM: { icon: Camera, label: "Webcam", category: "camera", color: "purple" },
  CAMERA_DOCUMENT: { icon: Camera, label: "Document Camera", category: "camera", color: "purple" },
  // Other devices
  CASH_DRAWER: { icon: HardDrive, label: "Cash Drawer", category: "cash", color: "orange" },
  CUSTOMER_DISPLAY: { icon: Monitor, label: "Customer Display", category: "display", color: "cyan" },
  WEIGHING_SCALE: { icon: Scale, label: "Weighing Scale", category: "scale", color: "amber" },
  CARD_READER: { icon: CreditCard, label: "Card Reader", category: "payment", color: "pink" },
  BIOMETRIC: { icon: Eye, label: "Biometric Device", category: "security", color: "red" },
  POS_TERMINAL: { icon: Monitor, label: "POS Terminal", category: "pos", color: "indigo" },
  OTHER: { icon: Settings, label: "Other Device", category: "other", color: "gray" },
};

// Connection type icons
const connectionTypeIcons = {
  USB: Usb,
  ETHERNET: Wifi,
  BLUETOOTH: Bluetooth,
  SERIAL: HardDrive,
  PARALLEL: HardDrive,
  CLOUD: Wifi,
};

// Status colors
const statusColors = {
  ONLINE: "bg-green-100 text-green-800 border-green-200",
  OFFLINE: "bg-gray-100 text-gray-800 border-gray-200",
  ERROR: "bg-red-100 text-red-800 border-red-200",
  BUSY: "bg-yellow-100 text-yellow-800 border-yellow-200",
  MAINTENANCE: "bg-orange-100 text-orange-800 border-orange-200",
};

const ProfileDevices = () => {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [connectionTypes, setConnectionTypes] = useState([]);

  // Get user email from localStorage
  const getUserEmail = () => {
    try {
      const admin = localStorage.getItem("admin");
      if (admin) return JSON.parse(admin).email;
      const user = localStorage.getItem("user");
      if (user) return JSON.parse(user).email;
    } catch (e) {
      console.debug("Error getting user email:", e);
    }
    return "";
  };

  const email = getUserEmail();

  // Fetch devices and stats
  useEffect(() => {
    fetchDevices();
    fetchStats();
    fetchDeviceTypes();
    fetchConnectionTypes();
  }, [email]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/devices", { params: { email } });
      setDevices(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/devices/stats", { params: { email } });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching device stats:", err);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await api.get("/api/devices/types");
      setDeviceTypes(response.data);
    } catch (err) {
      console.error("Error fetching device types:", err);
    }
  };

  const fetchConnectionTypes = async () => {
    try {
      const response = await api.get("/api/devices/connection-types");
      setConnectionTypes(response.data);
    } catch (err) {
      console.error("Error fetching connection types:", err);
    }
  };

  const handleTestConnection = async (deviceId) => {
    try {
      const response = await api.post(`/api/devices/${deviceId}/test`, null, {
        params: { email },
      });
      // Update the device in the list
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? response.data : d))
      );
    } catch (err) {
      console.error("Error testing device connection:", err);
    }
  };

  const handleSetDefault = async (deviceId) => {
    try {
      await api.patch(`/api/devices/${deviceId}/default`, null, {
        params: { email },
      });
      // Update devices list to reflect new default
      fetchDevices();
    } catch (err) {
      console.error("Error setting default device:", err);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    
    try {
      await api.delete(`/api/devices/${deviceId}`, { params: { email } });
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      fetchStats();
    } catch (err) {
      console.error("Error deleting device:", err);
    }
  };

  // Filter devices based on search and category
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceTypeDisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || device.deviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group devices by category
  const groupedDevices = filteredDevices.reduce((acc, device) => {
    const category = device.deviceCategory || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(device);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Device Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage printers, scanners, cameras, and other hardware devices
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Device
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Devices"
            value={stats.totalDevices}
            icon={HardDrive}
            color="blue"
          />
          <StatCard
            label="Online"
            value={stats.onlineDevices}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Offline"
            value={stats.offlineDevices}
            icon={XCircle}
            color="gray"
          />
          <StatCard
            label="Printers"
            value={stats.printerCount}
            icon={Printer}
            color="blue"
          />
          <StatCard
            label="Scanners"
            value={stats.scannerCount}
            icon={Scan}
            color="green"
          />
          <StatCard
            label="Cameras"
            value={stats.cameraCount}
            icon={Camera}
            color="purple"
          />
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="printer">Printers</option>
          <option value="scanner">Scanners</option>
          <option value="camera">Cameras</option>
          <option value="cash">Cash Drawers</option>
          <option value="display">Displays</option>
          <option value="scale">Weighing Scales</option>
          <option value="payment">Payment Devices</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Device List */}
      {Object.keys(groupedDevices).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <HardDrive className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No devices found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Try adjusting your search or filter"
              : "Get started by adding your first device"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Device
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDevices).map(([category, categoryDevices]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                {category} Devices
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onTest={handleTestConnection}
                    onSetDefault={handleSetDefault}
                    onEdit={() => setEditingDevice(device)}
                    onDelete={handleDeleteDevice}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Device Modal */}
      {(showAddModal || editingDevice) && (
        <DeviceModal
          device={editingDevice}
          deviceTypes={deviceTypes}
          connectionTypes={connectionTypes}
          email={email}
          onClose={() => {
            setShowAddModal(false);
            setEditingDevice(null);
          }}
          onSave={() => {
            fetchDevices();
            fetchStats();
            setShowAddModal(false);
            setEditingDevice(null);
          }}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-50 text-gray-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Device Card Component
const DeviceCard = ({ device, onTest, onSetDefault, onEdit, onDelete }) => {
  const config = deviceTypeConfig[device.deviceType] || deviceTypeConfig.OTHER;
  const Icon = config.icon;
  const ConnectionIcon = connectionTypeIcons[device.connectionType] || HardDrive;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${config.color}-50`}>
            <Icon className={`w-6 h-6 text-${config.color}-500`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {device.deviceName}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {device.deviceTypeDisplayName}
            </p>
          </div>
        </div>
        {device.isDefault && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Default
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {device.manufacturer && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Manufacturer:</span> {device.manufacturer}
          </p>
        )}
        {device.model && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Model:</span> {device.model}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <ConnectionIcon className="w-4 h-4" />
          <span>{device.connectionTypeDisplayName}</span>
          {device.ipAddress && <span className="text-gray-400">({device.ipAddress})</span>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${
            statusColors[device.status]
          }`}
        >
          {device.statusDisplayName}
        </span>
        {device.errorMessage && (
          <span className="text-xs text-red-500 truncate max-w-[150px]">
            {device.errorMessage}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onTest(device.id)}
          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Test
        </button>
        {!device.isDefault && (
          <button
            onClick={() => onSetDefault(device.id)}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            Set Default
          </button>
        )}
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(device.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Device Modal Component
const DeviceModal = ({ device, deviceTypes, connectionTypes, email, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    deviceType: device?.deviceType || "PRINTER_THERMAL",
    deviceName: device?.deviceName || "",
    manufacturer: device?.manufacturer || "",
    model: device?.model || "",
    serialNumber: device?.serialNumber || "",
    firmwareVersion: device?.firmwareVersion || "",
    connectionType: device?.connectionType || "USB",
    ipAddress: device?.ipAddress || "",
    port: device?.port || "",
    macAddress: device?.macAddress || "",
    bluetoothAddress: device?.bluetoothAddress || "",
    usbPort: device?.usbPort || "",
    isDefault: device?.isDefault || false,
    autoConnect: device?.autoConnect ?? true,
    configuration: device?.configuration || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (device) {
        // Update existing device
        await api.put(`/api/devices/${device.id}`, formData, { params: { email } });
      } else {
        // Create new device
        await api.post("/api/devices", formData, { params: { email } });
      }
      onSave();
    } catch (err) {
      console.error("Error saving device:", err);
      setError(err.response?.data?.message || "Failed to save device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {device ? "Edit Device" : "Add New Device"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Device Type and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Type *
              </label>
              <select
                value={formData.deviceType}
                onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {deviceTypeConfig[type]?.label || type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Name *
              </label>
              <input
                type="text"
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                placeholder="e.g., Main Receipt Printer"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Manufacturer and Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., Epson, HP, Canon"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., TM-T82"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Serial Number and Firmware */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Device serial number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Firmware Version
              </label>
              <input
                type="text"
                value={formData.firmwareVersion}
                onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
                placeholder="e.g., v1.2.3"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection Type *
            </label>
            <select
              value={formData.connectionType}
              onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              {connectionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "ETHERNET" ? "Ethernet/WiFi" : type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Connection Details - Show based on connection type */}
          {(formData.connectionType === "ETHERNET" || formData.connectionType === "CLOUD") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="e.g., 192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || "" })}
                  placeholder="e.g., 9100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          )}

          {formData.connectionType === "USB" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                USB Port
              </label>
              <input
                type="text"
                value={formData.usbPort}
                onChange={(e) => setFormData({ ...formData, usbPort: e.target.value })}
                placeholder="e.g., /dev/usb/lp0 or COM1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          {formData.connectionType === "BLUETOOTH" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bluetooth Address
              </label>
              <input
                type="text"
                value={formData.bluetoothAddress}
                onChange={(e) => setFormData({ ...formData, bluetoothAddress: e.target.value })}
                placeholder="e.g., 00:11:22:33:44:55"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          {/* MAC Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MAC Address
            </label>
            <input
              type="text"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              placeholder="e.g., 00:11:22:33:44:55"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set as default device</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoConnect}
                onChange={(e) => setFormData({ ...formData, autoConnect: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-connect on startup</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {device ? "Update Device" : "Add Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileDevices;