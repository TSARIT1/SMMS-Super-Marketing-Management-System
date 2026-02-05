import React, { useState, useEffect } from "react";
import { FileText, Filter, Download, RefreshCw, Calendar, User, Activity } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { getAdmin } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import { downloadCSV } from "../utils/csv";

const AuditLogDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: "all",
    entityType: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  });

  const admin = getAdmin();

  const actionTypes = [
    "all",
    "LOGIN",
    "LOGOUT",
    "CREATE",
    "UPDATE",
    "DELETE",
    "PAYMENT_SUCCESS",
    "PAYMENT_FAILED",
    "ORDER_CREATE",
    "INVENTORY_UPDATE",
  ];

  const entityTypes = [
    "all",
    "USER",
    "PRODUCT",
    "ORDER",
    "PAYMENT",
    "PROFILE",
    "INVENTORY",
  ];

  const statusOptions = ["all", "SUCCESS", "FAILED", "ERROR", "PENDING"];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/audit/logs`, {
        params: { 
          userId: admin.id,
          size: 1000  // Get more logs for better filtering
        },
      });
      // Handle both response formats (paginated or direct array)
      const logsData = response.data.logs || response.data || [];
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Action type filter
    if (filters.actionType !== "all") {
      filtered = filtered.filter((log) => log.actionType === filters.actionType);
    }

    // Entity type filter
    if (filters.entityType !== "all") {
      filtered = filtered.filter((log) => log.entityType === filters.entityType);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((log) => log.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.actionDescription?.toLowerCase().includes(term) ||
          log.userName?.toLowerCase().includes(term) ||
          log.entityId?.toString().includes(term)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExport = () => {
    const exportData = filteredLogs.map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleString(),
      user: log.userName || "System",
      action: log.actionType,
      entity: log.entityType,
      description: log.actionDescription,
      status: log.status,
      ipAddress: log.ipAddress || "N/A",
    }));
    downloadCSV(exportData, `audit-logs-${Date.now()}.csv`);
    toast.success("Audit logs exported successfully");
  };

  const getStatusBadge = (status) => {
    const colors = {
      SUCCESS: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      ERROR: "bg-orange-100 text-orange-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getActionIcon = (actionType) => {
    if (actionType?.includes("PAYMENT")) return "💳";
    if (actionType?.includes("ORDER")) return "🛒";
    if (actionType?.includes("LOGIN")) return "🔐";
    if (actionType?.includes("INVENTORY")) return "📦";
    return "📝";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Audit Log Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Monitor and track all system activities and user actions
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={filters.actionType}
                onChange={(e) =>
                  setFilters({ ...filters, actionType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Actions" : type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <select
                value={filters.entityType}
                onChange={(e) =>
                  setFilters({ ...filters, entityType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Entities" : type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Status" : status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() =>
                setFilters({
                  actionType: "all",
                  entityType: "all",
                  status: "all",
                  dateFrom: "",
                  dateTo: "",
                  searchTerm: "",
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchAuditLogs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter((log) => log.status === "SUCCESS").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter((log) => log.status === "FAILED").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">✕</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    filteredLogs.filter(
                      (log) =>
                        new Date(log.timestamp).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">No audit logs found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {log.userName || "System"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getActionIcon(log.actionType)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {log.actionType?.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {log.entityType}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {log.actionDescription}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-mono">
                        {log.ipAddress || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDashboard;
