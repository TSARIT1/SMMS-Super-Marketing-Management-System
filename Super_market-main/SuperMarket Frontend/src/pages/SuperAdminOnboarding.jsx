import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "../utils/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/button";

export default function SuperAdminOnboarding() {
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/onboarding/all");
      setOnboardingData(response.data || []);
    } catch (error) {
      console.error("Failed to fetch onboarding data:", error);
      // For demo purposes, create mock data
      setOnboardingData([
        {
          userId: 1,
          userName: "John Doe",
          email: "john@example.com",
          shopName: "FreshMart",
          isCompleted: true,
          isSkipped: false,
          currentStep: 3,
          personalInfoCompleted: true,
          shopDetailsCompleted: true,
          documentsUploaded: true,
          gstCertificatePath: "/uploads/onboarding/1_gst_certificate.jpg",
          shopRegistrationCertificatePath: "/uploads/onboarding/1_shop_registration.pdf",
          panCardPath: "/uploads/onboarding/1_pan_card.jpg",
          aadhaarCardPath: "/uploads/onboarding/1_aadhaar_card.jpg",
          createdAt: "2024-01-15T10:00:00Z",
          completedAt: "2024-01-16T14:30:00Z",
        },
        {
          userId: 2,
          userName: "Jane Smith",
          email: "jane@example.com",
          shopName: "QuickShop",
          isCompleted: false,
          isSkipped: false,
          currentStep: 2,
          personalInfoCompleted: true,
          shopDetailsCompleted: true,
          documentsUploaded: false,
          createdAt: "2024-01-20T09:15:00Z",
          completedAt: null,
        },
        {
          userId: 3,
          userName: "Bob Johnson",
          email: "bob@example.com",
          shopName: "MegaStore",
          isCompleted: false,
          isSkipped: true,
          currentStep: 1,
          personalInfoCompleted: false,
          shopDetailsCompleted: false,
          documentsUploaded: false,
          createdAt: "2024-01-18T16:45:00Z",
          completedAt: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (item) => {
    if (item.isCompleted) {
      return <Badge color="green">Completed</Badge>;
    } else if (item.isSkipped) {
      return <Badge color="yellow">Skipped</Badge>;
    } else {
      return <Badge color="red">In Progress</Badge>;
    }
  };

  const getProgressPercentage = (item) => {
    if (item.isCompleted) return 100;
    if (item.isSkipped) return 0;

    let progress = 0;
    if (item.personalInfoCompleted) progress += 33;
    if (item.shopDetailsCompleted) progress += 33;
    if (item.documentsUploaded) progress += 34;
    return progress;
  };

  const getStepIcon = (step, completed) => {
    if (completed) {
      return <CheckCircle size={16} className="text-green-600" />;
    } else if (step === "current") {
      return <Clock size={16} className="text-blue-600" />;
    } else {
      return <XCircle size={16} className="text-gray-400" />;
    }
  };

  const filteredData = onboardingData.filter((item) => {
    const matchesSearch =
      item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shopName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "completed" && item.isCompleted) ||
      (filterStatus === "skipped" && item.isSkipped) ||
      (filterStatus === "in_progress" && !item.isCompleted && !item.isSkipped);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: onboardingData.length,
    completed: onboardingData.filter(item => item.isCompleted).length,
    skipped: onboardingData.filter(item => item.isSkipped).length,
    inProgress: onboardingData.filter(item => !item.isCompleted && !item.isSkipped).length,
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = [
      "User ID", "Name", "Email", "Shop Name", "Status", "Current Step",
      "Personal Info", "Shop Details", "Documents", "Created At", "Completed At"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map(item => [
        item.userId,
        `"${item.userName}"`,
        item.email,
        `"${item.shopName || ''}"`,
        item.isCompleted ? "Completed" : item.isSkipped ? "Skipped" : "In Progress",
        item.currentStep,
        item.personalInfoCompleted ? "Yes" : "No",
        item.shopDetailsCompleted ? "Yes" : "No",
        item.documentsUploaded ? "Yes" : "No",
        item.createdAt,
        item.completedAt || ""
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onboarding-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Onboarding Management</h1>
          <p className="text-gray-600">Track and manage user onboarding progress</p>
        </div>
        <Button onClick={handleDownloadReport} className="flex items-center gap-2">
          <Download size={16} />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <UserCheck className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <UserX className="text-red-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Skipped</p>
              <p className="text-2xl font-bold text-red-600">{stats.skipped}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Onboarding Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.userName}
                      </div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.shopName || "Not set"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${getProgressPercentage(item)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getProgressPercentage(item)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      Step {item.currentStep}/3
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No onboarding records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No users have started the onboarding process yet."}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                Onboarding Details - {selectedUser.userName}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-sm text-gray-900">{selectedUser.userId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                  <p className="text-sm text-gray-900">{selectedUser.shopName || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                </div>
              </div>

              {/* Progress Steps */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Progress Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {getStepIcon(1, selectedUser.personalInfoCompleted)}
                    <span className={`text-sm ${selectedUser.personalInfoCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      Personal Information {selectedUser.personalInfoCompleted ? '✓' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStepIcon(2, selectedUser.shopDetailsCompleted)}
                    <span className={`text-sm ${selectedUser.shopDetailsCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      Shop Details {selectedUser.shopDetailsCompleted ? '✓' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStepIcon(3, selectedUser.documentsUploaded)}
                    <span className={`text-sm ${selectedUser.documentsUploaded ? 'text-green-600' : 'text-gray-500'}`}>
                      Document Upload {selectedUser.documentsUploaded ? '✓' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(selectedUser.gstCertificatePath || selectedUser.shopRegistrationCertificatePath ||
                selectedUser.panCardPath || selectedUser.aadhaarCardPath) && (
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {selectedUser.gstCertificatePath && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>GST Certificate</span>
                      </div>
                    )}
                    {selectedUser.shopRegistrationCertificatePath && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>Shop Registration Certificate</span>
                      </div>
                    )}
                    {selectedUser.panCardPath && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>PAN Card</span>
                      </div>
                    )}
                    {selectedUser.aadhaarCardPath && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>Aadhaar Card</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedUser.completedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completed At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedUser.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
