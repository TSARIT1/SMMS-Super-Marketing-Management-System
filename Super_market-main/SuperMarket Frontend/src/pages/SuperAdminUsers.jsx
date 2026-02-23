import React, { useEffect, useState } from "react";
import api from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import toast, { Toaster } from "react-hot-toast";
import { Sparkles, Zap, TrendingUp, AlertCircle } from "lucide-react";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersFilter, setUsersFilter] = useState("ALL"); // ALL | FROZEN
  const [usersSearch, setUsersSearch] = useState("");
  const [usersSort, setUsersSort] = useState({
    field: "fullName",
    direction: "asc",
  });

  // Freeze confirmation modal
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeTarget, setFreezeTarget] = useState(null); // user object
  const [freezeAction, setFreezeAction] = useState("FREEZE"); // 'FREEZE' | 'UNFREEZE'
  const [freezeReason, setFreezeReason] = useState(
    "Account frozen by administrator",
  );
  const [freezeLoading, setFreezeLoading] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  // close modals with Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (freezeModalOpen) {
          setFreezeModalOpen(false);
          setFreezeTarget(null);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [freezeModalOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId, updates) => {
    try {
      await api.put(`/admin/users/${userId}`, updates);
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
      toast.success("User updated successfully!");
    } catch (err) {
      console.error("Failed to update user", err);
      toast.error("Failed to update user.");
    }
  };

  const handleFreezeUser = async (
    userId,
    reason = "Account frozen by administrator",
  ) => {
    try {
      const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
      await api.put(`/admin/users/${userId}/freeze`, {
        reason,
        adminId,
      });
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
      // refresh audit logs to reflect freeze operation
      // notify other components (eg. Navbar) to refresh their freeze counts
      window.dispatchEvent(new Event("freeze:update"));
      toast.success("User account frozen successfully!");
    } catch (err) {
      console.error("Failed to freeze user", err);
      toast.error("Failed to freeze user account.");
    }
  };

  const handleUnfreezeUser = async (userId) => {
    try {
      const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
      await api.put(`/admin/users/${userId}/unfreeze`, {
        adminId,
      });
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
      // notify other components (eg. Navbar) to refresh their freeze counts
      window.dispatchEvent(new Event("freeze:update"));
      toast.success("User account unfrozen successfully!");
    } catch (err) {
      console.error("Failed to unfreeze user", err);
      toast.error("Failed to unfreeze user account.");
    }
  };

  // Open freeze confirmation modal
  const openFreezeModal = (user, action = "FREEZE") => {
    setFreezeTarget(user);
    setFreezeAction(action);
    setFreezeReason(
      action === "FREEZE" ? "Account frozen by administrator" : "",
    );
    setFreezeModalOpen(true);
  };

  const confirmFreezeAction = async () => {
    if (!freezeTarget) return;
    setFreezeLoading(true);
    try {
      if (freezeAction === "FREEZE") {
        await handleFreezeUser(freezeTarget.id, freezeReason);
      } else {
        await handleUnfreezeUser(freezeTarget.id);
      }
      setFreezeModalOpen(false);
      setFreezeTarget(null);
    } catch (err) {
      console.error("Freeze/Unfreeze failed", err);
      toast.error("Operation failed");
    } finally {
      setFreezeLoading(false);
    }
  };

  // ========== AI USER ANALYSIS ==========
  const generateAIUserAnalysis = async () => {
    setGeneratingAI(true);
    const toastId = toast.loading('🤖 AI analyzing user behavior...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalUsers = users.length;
      const frozenUsers = users.filter(u => u.accountStatus === 'FROZEN').length;
      const activeUsers = totalUsers - frozenUsers;
      const usersWithSubscriptions = users.filter(u => u.subscriptionStatus === 'ACTIVE').length;
      const conversionRate = ((usersWithSubscriptions / totalUsers) * 100).toFixed(1);
      
      const analysis = {
        totalUsers,
        activeUsers,
        frozenUsers,
        usersWithSubscriptions,
        conversionRate,
        insights: [],
        riskUsers: [],
        topUsers: []
      };
      
      // Risk Analysis
      const riskUsers = users.filter(u => u.accountStatus === 'FROZEN').slice(0, 3);
      analysis.riskUsers = riskUsers.map(u => ({
        name: u.fullName,
        email: u.email,
        reason: 'Account frozen - requires review',
        risk: 'High'
      }));
      
      // Top Users
      const activeUsersData = users.filter(u => u.accountStatus !== 'FROZEN').slice(0, 3);
      analysis.topUsers = activeUsersData.map(u => ({
        name: u.fullName,
        email: u.email,
        subscription: u.subscriptionStatus || 'Free',
        score: 'A+'
      }));
      
      // Generate Insights
      if (conversionRate < 20) {
        analysis.insights.push({
          type: 'warning',
          title: 'Low Subscription Conversion',
          description: `Only ${conversionRate}% of users have active subscriptions. This is below industry average.`,
          action: 'Launch promotional campaigns and improve onboarding experience',
          priority: 'High'
        });
      } else if (conversionRate > 40) {
        analysis.insights.push({
          type: 'success',
          title: 'Excellent Conversion Rate',
          description: `${conversionRate}% subscription conversion rate exceeds industry benchmarks!`,
          action: 'Document successful strategies for replication',
          priority: 'Low'
        });
      }
      
      if (frozenUsers > totalUsers * 0.1) {
        analysis.insights.push({
          type: 'critical',
          title: 'High Account Freeze Rate',
          description: `${frozenUsers} accounts frozen (${((frozenUsers/totalUsers)*100).toFixed(1)}%). This may indicate security issues.`,
          action: 'Review freeze reasons and implement preventive measures',
          priority: 'Critical'
        });
      }
      
      analysis.insights.push({
        type: 'info',
        title: 'User Engagement Opportunity',
        description: `${totalUsers - usersWithSubscriptions} users haven't subscribed yet.`,
        action: 'Send targeted emails with special offers and feature highlights',
        priority: 'Medium'
      });
      
      analysis.insights.push({
        type: 'success',
        title: 'Active User Base',
        description: `${activeUsers} active users maintaining platform health.`,
        action: 'Continue monitoring and maintaining quality standards',
        priority: 'Low'
      });
      
      setAiAnalysis(analysis);
      toast.success('✨ AI analysis complete!', { id: toastId });
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to generate AI analysis', { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };

  const filteredUsers = () => {
    let filtered = users || [];
    if (usersFilter === "FROZEN") {
      filtered = filtered.filter((u) => u.accountStatus === "FROZEN");
    }
    if (usersSearch && usersSearch.trim()) {
      const q = usersSearch.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.role || "").toLowerCase().includes(q),
      );
    }
    // Sort users
    filtered.sort((a, b) => {
      const aVal = a[usersSort.field] || "";
      const bVal = b[usersSort.field] || "";
      if (usersSort.direction === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    return filtered;
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-600">Loading users...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* Freeze / Order Modals */}
      {freezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">
              {freezeAction === "FREEZE"
                ? "Confirm Freeze"
                : "Confirm Unfreeze"}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {freezeAction === "FREEZE"
                ? `You are about to freeze ${freezeTarget?.fullName || freezeTarget?.email}. This will prevent them from accessing the system.`
                : `You are about to unfreeze ${freezeTarget?.fullName || freezeTarget?.email}.`}
            </p>

            {freezeAction === "FREEZE" && (
              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setFreezeModalOpen(false);
                  setFreezeTarget(null);
                }}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmFreezeAction}
                disabled={freezeLoading}
                className={`px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 ${freezeLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {freezeLoading
                  ? "Please wait..."
                  : freezeAction === "FREEZE"
                    ? "Freeze"
                    : "Unfreeze"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI User Analysis Section */}
      {aiAnalysis && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">AI User Analysis</h3>
            </div>
            <button
              onClick={() => setAiAnalysis(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-blue-900">{aiAnalysis.totalUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-xs font-semibold text-green-600 mb-1">Active</div>
              <div className="text-2xl font-bold text-green-900">{aiAnalysis.activeUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <div className="text-xs font-semibold text-red-600 mb-1">Frozen</div>
              <div className="text-2xl font-bold text-red-900">{aiAnalysis.frozenUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 mb-1">Subscribed</div>
              <div className="text-2xl font-bold text-purple-900">{aiAnalysis.usersWithSubscriptions}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="text-xs font-semibold text-indigo-600 mb-1">Conversion</div>
              <div className="text-2xl font-bold text-indigo-900">{aiAnalysis.conversionRate}%</div>
            </div>
          </div>
          
          {/* AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiAnalysis.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : insight.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        insight.priority === 'Critical'
                          ? 'bg-red-200 text-red-800'
                          : insight.priority === 'High'
                          ? 'bg-orange-200 text-orange-800'
                          : insight.priority === 'Medium'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    <div className="bg-white bg-opacity-60 rounded px-3 py-2 text-sm">
                      <span className="font-semibold text-gray-700">Action:</span>
                      <span className="text-gray-600 ml-1">{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden fade-up">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                User Management
              </h3>
              <p className="text-sm text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateAIUserAnalysis}
                disabled={generatingAI}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                {generatingAI ? 'Analyzing...' : 'AI Analysis'}
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">
                  {filteredUsers().length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {users?.length ?? 0}
                </span>{" "}
                users
              </div>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await api.get("/admin/users");
                    setUsers(res.data);
                  } catch (e) {
                    console.error("Failed to refresh users", e);
                    toast.error("Failed to refresh users");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn-secondary px-3 py-1 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                className="search-input w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={usersFilter}
                onChange={(e) => setUsersFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Users</option>
                <option value="FROZEN">Frozen Only</option>
              </select>
              <select
                value={`${usersSort.field}-${usersSort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-");
                  setUsersSort({ field, direction });
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fullName-asc">Name A-Z</option>
                <option value="fullName-desc">Name Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="email-desc">Email Z-A</option>
                <option value="role-asc">Role A-Z</option>
                <option value="role-desc">Role Z-A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredUsers().length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No users found for the selected filter. Try clicking
              "Refresh Users" and ensure you're logged in as a Super
              Admin. If this persists, check backend is running and that
              `adminToken` is set in localStorage.
              {(users || []).filter((u) => u.role === "USER").length ===
                0 && (
                <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                  It looks like there are no site users in this
                  environment — only admin accounts exist. You can create
                  a test user using the dev helper or register via the
                  public site.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table
                  className="min-w-full"
                  aria-describedby="usersTableDesc"
                >
                  <caption className="sr-only">
                    Users table showing all user accounts
                  </caption>
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers().map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.accountStatus === "ACTIVE" ? "bg-green-100 text-green-800" : user.accountStatus === "FROZEN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {user.accountStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateUser(user.id, {
                                role: e.target.value,
                              })
                            }
                            className="mr-2 px-2 py-1 border rounded text-xs"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">
                              SUPER_ADMIN
                            </option>
                          </select>
                          <select
                            value={user.accountStatus}
                            onChange={(e) =>
                              handleUpdateUser(user.id, {
                                accountStatus: e.target.value,
                              })
                            }
                            className="px-2 py-1 border rounded text-xs"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="FROZEN">FROZEN</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                          </select>
                          <div className="inline-flex space-x-1">
                            {user.accountStatus === "ACTIVE" ? (
                              <button
                                onClick={() =>
                                  openFreezeModal(user, "FREEZE")
                                }
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                title="Freeze Account"
                              >
                                Freeze
                              </button>
                            ) : user.accountStatus === "FROZEN" ? (
                              <button
                                onClick={() =>
                                  openFreezeModal(user, "UNFREEZE")
                                }
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                title="Unfreeze Account"
                              >
                                Unfreeze
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredUsers().map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {user.fullName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${user.accountStatus === "ACTIVE" ? "bg-green-100 text-green-800" : user.accountStatus === "FROZEN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {user.accountStatus}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateUser(user.id, {
                              role: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={user.accountStatus}
                          onChange={(e) =>
                            handleUpdateUser(user.id, {
                              accountStatus: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="FROZEN">FROZEN</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        {user.accountStatus === "ACTIVE" ? (
                          <button
                            onClick={() => handleFreezeUser(user.id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Freeze Account
                          </button>
                        ) : user.accountStatus === "FROZEN" ? (
                          <button
                            onClick={() => handleUnfreezeUser(user.id)}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            Unfreeze Account
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
