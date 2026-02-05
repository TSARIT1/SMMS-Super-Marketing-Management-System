import React, { useEffect, useState } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  Shield,
  User,
  Activity,
  Filter,
  Download,
  Search,
  Calendar,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function SuperAdminAuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logType, setLogType] = useState("ALL"); // ALL | ADMIN | USER | TRANSACTION
  const [auditQuery, setAuditQuery] = useState("");
  const [auditSort, setAuditSort] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const [dateFilter, setDateFilter] = useState("all");
  const [aiThreats, setAiThreats] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/audit-logs");
      setAuditLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeLabel = (entity) => {
    if (!entity) return { label: "SYSTEM", color: "bg-gray-100 text-gray-700", icon: Activity };
    if (entity === "ADMIN") return { label: "ADMIN", color: "bg-red-100 text-red-700", icon: Shield };
    if (entity === "USER") return { label: "USER", color: "bg-blue-100 text-blue-700", icon: User };
    if (entity === "AUTH") return { label: "AUTH", color: "bg-purple-100 text-purple-700", icon: Shield };
    return { label: entity, color: "bg-gray-100 text-gray-700", icon: Activity };
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredAuditLogs = () => {
    let list = auditLogs || [];
    
    // Filter by log type
    if (logType === "ADMIN") {
      list = list.filter((l) => l.entity === "ADMIN" || l.actionType?.includes("ADMIN"));
    } else if (logType === "USER") {
      list = list.filter((l) => l.entity === "USER" || l.entity === "AUTH");
    } else if (logType === "TRANSACTION") {
      list = list.filter((l) => 
        l.actionType?.includes("ORDER") || 
        l.actionType?.includes("PAYMENT") || 
        l.actionType?.includes("PURCHASE")
      );
    }
    
    // Filter by search query
    if (auditQuery && auditQuery.trim()) {
      const q = auditQuery.toLowerCase();
      list = list.filter(
        (l) =>
          (l.userName || "").toLowerCase().includes(q) ||
          (l.actionType || "").toLowerCase().includes(q) ||
          (l.entity || "").toLowerCase().includes(q)
      );
    }
    
    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      list = list.filter((l) => new Date(l.timestamp) >= filterDate);
    }
    
    // Sort audit logs
    list.sort((a, b) => {
      const aVal = new Date(a[auditSort.field]);
      const bVal = new Date(b[auditSort.field]);
      if (auditSort.direction === "asc") {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
    
    return list;
  };

  const handleRefresh = () => {
    fetchAuditLogs();
    toast.success("Audit logs refreshed");
  };

  const handleExport = () => {
    toast.success("Export feature coming soon");
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-600">Loading audit logs...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="text-indigo-600" size={32} />
                Audit Logs
              </h3>
              <p className="text-gray-600 mt-1">
                Complete system activity tracking - All user actions, admin operations, and transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All Logs</option>
              <option value="ADMIN">Admin Actions Only</option>
              <option value="USER">User Actions Only</option>
              <option value="TRANSACTION">Transactions Only</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={18} />
              <span>{filteredAuditLogs().length} logs found</span>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-gray-600">Loading audit logs...</div>
            </div>
          ) : filteredAuditLogs().length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-64 text-gray-500">
              <Activity size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">No audit logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAuditLogs().map((log, index) => {
                    const typeInfo = getLogTypeLabel(log.entity);
                    const IconComponent = typeInfo.icon;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {new Date(log.timestamp).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString("en-IN")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User size={16} className="text-indigo-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.userName || "System"}
                              </div>
                              {log.userEmail && (
                                <div className="text-xs text-gray-500">{log.userEmail}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">{log.actionType || "N/A"}</div>
                          {log.details && (
                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                              {log.details}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            <IconComponent size={12} />
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status || "SUCCESS"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.ipAddress && (
                            <div className="text-xs">IP: {log.ipAddress}</div>
                          )}
                          {log.metadata && (
                            <div className="text-xs text-gray-400">
                              {JSON.stringify(log.metadata).substring(0, 50)}...
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
              </div>
              <Activity size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.filter(l => l.entity === "ADMIN").length}
                </p>
              </div>
              <Shield size={32} className="text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">User Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.filter(l => l.entity === "USER" || l.entity === "AUTH").length}
                </p>
              </div>
              <User size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.length > 0 
                    ? ((auditLogs.filter(l => l.status === "SUCCESS").length / auditLogs.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <Activity size={32} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
