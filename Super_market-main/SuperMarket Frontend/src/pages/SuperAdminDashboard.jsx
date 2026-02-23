 import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import "../SuperAdminStyles.css";
import {
  Users,
  BarChart2,
  DollarSign,
  FileText,
  Settings,
  Home,
  UserCheck,
  CreditCard,
  Activity,
  Shield,
  Database,
  Bell,
  Ticket,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  LineChart,
  Mail,
  Zap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import RevenueChart from "../components/dashboard/RevenueChart";
import UserGrowthChart from "../components/dashboard/UserGrowthChart";
import MonthlyPerformanceChart from "../components/dashboard/MonthlyPerformanceChart";
import SubscriptionPie from "../components/dashboard/SubscriptionPie";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [tickets, setTickets] = useState([]);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");

  // Orders state (basic placeholders to satisfy dashboard flows)
  const [Orders, _setOrders] = useState([]);
  const [OrdersSearch, _setOrdersSearch] = useState("");
  const [OrdersSort, _setOrdersSort] = useState({
    field: "date",
    direction: "desc",
  });
  // prevent ESLint 'assigned but not used' until orders features are active
  void Orders;
  void OrdersSearch;
  void OrdersSort;
  const [_orderModalOpen, _setOrderModalOpen] = useState(false);
  const [_orderForm, _setOrderForm] = useState({});
  const [_orderCreating, _setOrderCreating] = useState(false);
  const [adminStatusUpdating, setAdminStatusUpdating] = useState(false);
  const [adminRespondLoading, setAdminRespondLoading] = useState(false);
  const [adminFiles, setAdminFiles] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [replyResolveLoading, setReplyResolveLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsAuthRequired, setAnalyticsAuthRequired] = useState(false);
  const [_useDemoData, setUseDemoData] = useState(false);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Landing page editor state
  const [landingForm, setLandingForm] = useState({});

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
    try {
      // ensure required JSON fields are valid
      if (landingForm.featuresJson) {
        try { JSON.parse(landingForm.featuresJson); } catch (err) { toast.error('Features JSON is invalid'); return; }
      }
      const res = await api.put('/admin/landing', landingForm);
      setLandingForm(res.data || {});
      toast.success('Landing page saved');
    } catch (err) {
      console.error('Failed to save landing', err);
      toast.error('Failed to save landing page');
    }
  };

  useEffect(() => {
    // load landing into editor when settings tab mounts
    if (activeTab === 'settings') {
      loadLanding();
    }
  }, [activeTab]);

  // Admin ticket helpers
  const [ticketPage, setTicketPage] = useState(0);
  const [ticketTotalPages, setTicketTotalPages] = useState(1);

  const fetchAdminTickets = async (page = 0, size = 25, append = false) => {
    try {
      const res = await api.get("/admin/tickets", { params: { page, size } });
      const data = res.data;
      const items = data.items || [];
      setTickets((prev) => (append ? [...prev, ...items] : items));
      setTicketPage(data.page || 0);
      setTicketTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch admin tickets", err);
      toast.error("Failed to load tickets");
    }
  };

  useEffect(() => {
    // Load first page of admin tickets on mount
    fetchAdminTickets(0, 25, false);
  }, []);

  const openAdminTicket = async (ticket) => {
    try {
      const res = await api.get(`/tickets/${ticket.id}`);
      setSelectedAdminTicket(res.data);
      setAdminResponse(res.data.adminResponse || "");
    } catch (err) {
      console.error("Failed to load ticket details", err);
      toast.error("Failed to load ticket details");
    }
  };

  const closeAdminTicket = () => {
    setSelectedAdminTicket(null);
    setAdminResponse("");
  };

  const updateTicketStatus = async (status) => {
    if (!selectedAdminTicket) return;
    setAdminStatusUpdating(true);
    try {
      const payload = { status };
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      if (status === "RESOLVED" && admin?.id) payload.resolvedBy = admin.id;
      await api.put(`/tickets/admin/${selectedAdminTicket.id}/status`, payload);
      toast.success("Ticket status updated");
      await fetchAdminTickets();
      // refresh detail
      await openAdminTicket(selectedAdminTicket);
    } catch (err) {
      console.error("Failed to update ticket status", err);
      toast.error("Failed to update ticket status");
    } finally {
      setAdminStatusUpdating(false);
    }
  };

  const respondToTicket = async () => {
    if (!selectedAdminTicket) return;
    setAdminRespondLoading(true);
    try {
      if (adminFiles && adminFiles.length > 0) {
        const fd = new FormData();
        fd.append("response", adminResponse);
        const admin = JSON.parse(localStorage.getItem("admin") || "null");
        if (admin?.id) fd.append("resolvedBy", admin.id);
        adminFiles.forEach((f) => fd.append("attachments", f));
        await api.put(
          `/tickets/admin/${selectedAdminTicket.id}/respond-multipart`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      } else {
        await api.put(`/tickets/admin/${selectedAdminTicket.id}/respond`, {
          response: adminResponse,
        });
      }

      toast.success("Response sent");
      await fetchAdminTickets();
      await openAdminTicket(selectedAdminTicket);
      // keep modal open so admin can add more responses
    } catch (err) {
      console.error("Failed to respond to ticket", err);
      toast.error("Failed to send response");
    } finally {
      setAdminRespondLoading(false);
      setAdminFiles([]);
    }
  };

  const replyAndResolve = async () => {
    if (!selectedAdminTicket) return;
    if (!adminResponse || !adminResponse.trim()) {
      toast.error("Please type a response before resolving");
      return;
    }
    setReplyResolveLoading(true);
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      await api.put(`/tickets/${selectedAdminTicket.id}/reply`, null, {
        params: { adminResponse: adminResponse, adminId: admin?.id },
      });
      toast.success(`Ticket ${selectedAdminTicket.ticketNumber} resolved`);
      // refresh list and detail
      await fetchAdminTickets();
      await openAdminTicket(selectedAdminTicket);
      // clear response text
      setAdminResponse("");
    } catch (err) {
      console.error("Failed to reply and resolve ticket", err);
      toast.error("Failed to reply & resolve ticket");
    } finally {
      setReplyResolveLoading(false);
    }
  };

  const deleteTicket = async () => {
    if (!selectedAdminTicket) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tickets/admin/${selectedAdminTicket.id}`);
      toast.success(`Ticket ${selectedAdminTicket.ticketNumber} deleted`);
      await fetchAdminTickets();
      setSelectedAdminTicket(null);
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete ticket", err);
      toast.error(err?.response?.data?.error || "Failed to delete ticket");
    } finally {
      setDeleteLoading(false);
    }
  };
  // Default to live data (no dummy/demo) — useful for QA and production environments

  // Auto-provision a dev super-admin and login when running in development so the dashboard is populated with real backend data
  useEffect(() => {
    // Only run in Vite dev mode
    if (!import.meta.env.DEV) return;
    const admin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");
    if (admin && token) return;
    (async () => {
      try {
        // create dev admin (no-op in production because /dev endpoints removed or protected)
        await api.post("/dev/create-admin", {
          email: "info@tsaritservices.com",
          password: "admin123",
        });
        const loginRes = await api.post("/admin/login", {
          email: "info@tsaritservices.com",
          password: "admin123",
        });
        const authToken = loginRes.data.token;
        localStorage.setItem("adminToken", authToken);
        localStorage.setItem(
          "admin",
          JSON.stringify({
            id: loginRes.data.userId,
            email: loginRes.data.email,
            fullName: loginRes.data.fullName,
            role: loginRes.data.role,
          }),
        );

        // fetch fresh data to populate dashboard
        const [
          usersRes,
          auditRes,
          statsRes,
          subsRes,
          plansRes,
          ticketsRes,
          analyticsRes,
        ] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/audit-logs"),
          api.get("/admin/dashboard-stats"),
          api.get("/admin/subscriptions"),
          api.get("/admin/subscription-plans"),
          api.get("/admin/tickets"),
          api.get("/admin/analytics/monthly"),
        ]);

        setUsers(usersRes.data);
        setAuditLogs(auditRes.data);
        setStats(statsRes.data);
        setSubscriptions(subsRes.data);
        setPlans(plansRes.data);
        setTickets(ticketsRes.data);
        setAnalytics(analyticsRes.data);
        setUseDemoData(false);

        // notify other components
        window.dispatchEvent(new Event("freeze:update"));
        window.dispatchEvent(new Event("admin:update"));
      } catch (err) {
        // dev auto-provision failed silently
      }
    })();
  }, []);

  const [freezeStats, setFreezeStats] = useState({
    frozenUsers: 0,
    totalFreezeOperations: 0,
  });
  const [usersFilter, setUsersFilter] = useState("ALL"); // ALL | FROZEN
  const [usersSearch, setUsersSearch] = useState("");
  const [usersSort, setUsersSort] = useState({
    field: "fullName",
    direction: "asc",
  });
  const [auditFilter, setAuditFilter] = useState("ALL"); // ALL | FREEZE
  const [auditQuery, setAuditQuery] = useState("");
  const [auditSort, _setAuditSort] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const navigate = useNavigate();

  // Freeze confirmation modal
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeTarget, setFreezeTarget] = useState(null); // user object
  const [freezeAction, setFreezeAction] = useState("FREEZE"); // 'FREEZE' | 'UNFREEZE'
  const [freezeReason, setFreezeReason] = useState(
    "Account frozen by administrator",
  );
  const [freezeLoading, setFreezeLoading] = useState(false);

  // close modals with Escape key and manage focus
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
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }

    // Auto-redirect to overview page instead of staying on dashboard
    const currentPath = window.location.pathname;
    if (currentPath === "/superadmindashboard") {
      navigate("/superadmin/overview");
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          statsRes,
          subsRes,
          plansRes,
          usersRes,
          auditRes,
          ticketsRes,
          analyticsRes,
        ] = await Promise.all([
          api.get("/admin/dashboard-stats"),
          api.get("/admin/subscriptions"),
          api.get("/admin/subscription-plans"),
          api.get("/admin/users"),
          api.get("/admin/audit-logs"),
          api.get("/admin/tickets"),
          api.get("/admin/analytics/monthly"),
        ]);

        setStats(statsRes.data);
        setSubscriptions(subsRes.data);
        setPlans(plansRes.data);
        setUsers(usersRes.data);
        setAuditLogs(auditRes.data);
        // compute freeze statistics from users and audit logs
        const frozenCount = (usersRes.data || []).filter(
          (u) => u.accountStatus === "FROZEN",
        ).length;
        const freezeOpsCount = (auditRes.data || []).filter((log) =>
          ["ACCOUNT_FREEZE", "ACCOUNT_UNFREEZE"].includes(log.actionType),
        ).length;
        setFreezeStats({
          frozenUsers: frozenCount,
          totalFreezeOperations: freezeOpsCount,
        });
        setTickets(ticketsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Failed to load admin data", err);
        alert("Unable to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  // fetch analytics separately so we can handle auth errors and report them
  useEffect(() => {
    (async () => {
      try {
        const analyticsRes = await api.get("/admin/analytics/monthly");
        setAnalytics(analyticsRes.data);
        setAnalyticsAuthRequired(false);
      } catch (err) {
        setAnalytics(null);
        if (err?.response?.status === 401) {
          setAnalyticsAuthRequired(true);
        } else {
          setAnalyticsAuthRequired(false);
        }
      }
    })();
  }, []);
  useEffect(() => {
    if (!analytics) {
      (async () => {
        try {
          const res = await api.get("/admin/analytics/monthly");
          setAnalytics(res.data);
          setAnalyticsAuthRequired(false);
        } catch (err) {
          setAnalytics(null);
          if (err?.response?.status === 401) {
            setAnalyticsAuthRequired(true);
          }
          console.error("Failed to fetch analytics on toggle", err);
        }
      })();
    }
  }, [analytics]);

  // Auto-refresh users & audit logs when user switches to Users or Audit tabs
  useEffect(() => {
    if (activeTab === "users") {
      (async () => {
        try {
          setLoading(true);
          const [usersRes, auditRes] = await Promise.all([
            api.get("/admin/users"),
            api.get("/admin/audit-logs"),
          ]);
          setUsers(usersRes.data);
          setAuditLogs(auditRes.data);
          const frozenCount = (usersRes.data || []).filter(
            (u) => u.accountStatus === "FROZEN",
          ).length;
          const freezeOpsCount = (auditRes.data || []).filter((log) =>
            ["ACCOUNT_FREEZE", "ACCOUNT_UNFREEZE"].includes(log.actionType),
          ).length;
          setFreezeStats({
            frozenUsers: frozenCount,
            totalFreezeOperations: freezeOpsCount,
          });
        } catch (err) {
          console.error("Failed to refresh users/audit on tab switch", err);
        } finally {
          setLoading(false);
        }
      })();
    }

    if (activeTab === "audit") {
      (async () => {
        try {
          const auditRes = await api.get("/admin/audit-logs");
          setAuditLogs(auditRes.data);
        } catch (err) {
          console.error("Failed to load audit logs", err);
        }
      })();
    }
  }, [activeTab]);

  const handleUpdatePlan = async (planId, updates) => {
    try {
      await api.put(`/admin/subscription-plans/${planId}`, updates);
      const plansRes = await api.get("/admin/subscription-plans");
      setPlans(plansRes.data);
      alert("Plan updated successfully!");
    } catch (err) {
      console.error("Failed to update plan", err);
      alert("Failed to update plan.");
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await api.put(`/admin/users/${userId}`, updates);
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
      alert("User updated successfully!");
    } catch (err) {
      console.error("Failed to update user", err);
      alert("Failed to update user.");
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
      const auditRes = await api.get("/admin/audit-logs");
      setAuditLogs(auditRes.data);
      const frozenCount = (usersRes.data || []).filter(
        (u) => u.accountStatus === "FROZEN",
      ).length;
      const freezeOpsCount = (auditRes.data || []).filter((log) =>
        ["ACCOUNT_FREEZE", "ACCOUNT_UNFREEZE"].includes(log.actionType),
      ).length;
      setFreezeStats({
        frozenUsers: frozenCount,
        totalFreezeOperations: freezeOpsCount,
      });
      // notify other components (eg. Navbar) to refresh their freeze counts
      window.dispatchEvent(new Event("freeze:update"));
      alert("User account frozen successfully!");
    } catch (err) {
      console.error("Failed to freeze user", err);
      alert("Failed to freeze user account.");
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
      // refresh audit logs to reflect unfreeze operation
      const auditRes = await api.get("/admin/audit-logs");
      setAuditLogs(auditRes.data);
      const frozenCount = (usersRes.data || []).filter(
        (u) => u.accountStatus === "FROZEN",
      ).length;
      const freezeOpsCount = (auditRes.data || []).filter((log) =>
        ["ACCOUNT_FREEZE", "ACCOUNT_UNFREEZE"].includes(log.actionType),
      ).length;
      setFreezeStats({
        frozenUsers: frozenCount,
        totalFreezeOperations: freezeOpsCount,
      });
      // notify other components (eg. Navbar) to refresh their freeze counts
      window.dispatchEvent(new Event("freeze:update"));
      alert("User account unfrozen successfully!");
    } catch (err) {
      console.error("Failed to unfreeze user", err);
      alert("Failed to unfreeze user account.");
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
      alert("Operation failed");
    } finally {
      setFreezeLoading(false);
    }
  };

  // Navigate to a tab and ensure the content is visible at the top (account for sticky header).
  const gotoTab = (tab) => {
    setActiveTab(tab);
    // allow React to update layout then scroll/focus the content area
    setTimeout(() => {
      const el = document.getElementById("adminContent");
      if (el) {
        // compute offset to account for sticky header height (so content appears below the header)
        const header = document.querySelector(".sticky.top-0");
        const headerHeight = header ? header.offsetHeight : 0;
        const rect = el.getBoundingClientRect();
        const target = window.pageYOffset + rect.top - headerHeight - 8; // 8px padding buffer
        window.scrollTo({ top: target, behavior: "smooth" });

        // focus first heading inside content for accessibility after scroll completes
        setTimeout(() => {
          const heading = el.querySelector("h1, h2, h3");
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus();
          }
        }, 300);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  // --- Dashboard helper data & formatters ---
  const revenueData =
    analytics?.months
      ? analytics.months.map((m) => ({
          month: m.month,
          revenue: Number(m.revenue) || 0,
          users: Number(m.newSubscriptions) || 0,
        }))
      : [];
  const userGrowthData = revenueData.map((d) => ({
    month: d.month,
    users: d.users || 0,
  }));
  const monthlyPerformanceData = revenueData.map((d) => ({
    month: d.month,
    revenue: d.revenue || 0,
    users: d.users || 0,
  }));
  const subscriptionData =
    analytics?.planBreakdown
      ? Object.keys(analytics.planBreakdown || {}).map((k) => ({
          name: k,
          value: analytics.planBreakdown[k],
        }))
      : [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const calcGrowthPercent = (arr, key = "revenue") => {
    if (!arr || arr.length < 2) return "0.0";
    const last = arr[arr.length - 1][key] || 0;
    const prev = arr[arr.length - 2][key] || 1;
    return (((last - prev) / prev) * 100).toFixed(1);
  };

  const revenueGrowthPercent = calcGrowthPercent(revenueData, "revenue");
  const userGrowthPercent = calcGrowthPercent(revenueData, "users");

  const arpu =
    analytics?.arpu
      ? analytics.arpu
      : stats?.totalUsers
        ? Math.round(
            (stats.totalRevenue ||
              revenueData.reduce((s, r) => s + r.revenue, 0)) /
              stats.totalUsers,
          )
        : Math.round(
            revenueData.reduce((s, r) => s + r.revenue, 0) /
              (revenueData.reduce((s, r) => s + r.users, 0) || 1),
          );

  const mrr =
    analytics?.mrr
      ? analytics.mrr
      : (stats?.monthlyRecurringRevenue ??
        Math.round(
          (stats?.totalRevenue ??
            revenueData.reduce((s, r) => s + r.revenue, 0)) / 12,
        ));
  const clv =
    analytics?.clv
      ? analytics.clv
      : (stats?.customerLifetimeValue ?? Math.round(arpu * 7));
  const _churnRate =
    analytics?.churnRate
      ? analytics.churnRate
      : (stats?.churnRate ?? 0);
  const nps =
    analytics?.nps ? analytics.nps : (stats?.nps ?? 0);
  // --- End helpers ---

  const navigation = [
    { name: "Overview", icon: Home, tab: "overview" },
    { name: "Users", icon: Users, tab: "users" },
    { name: "Subscriptions", icon: DollarSign, tab: "subscriptions" },
    { name: "Audit Logs", icon: FileText, tab: "audit" },
    { name: "Support Tickets", icon: Ticket, tab: "tickets" },
    { name: "Email Management", icon: Mail, tab: "emails" },
    { name: "AI Controls", icon: Zap, tab: "ai-controls" },
    { name: "System Settings", icon: Settings, tab: "settings" },
  ];

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

  const filteredAuditLogs = () => {
    let list = auditLogs || [];
    if (auditFilter === "FREEZE") {
      list = list.filter((l) =>
        ["ACCOUNT_FREEZE", "ACCOUNT_UNFREEZE"].includes(l.actionType),
      );
    }
    if (auditQuery && auditQuery.trim()) {
      const q = auditQuery.toLowerCase();
      list = list.filter(
        (l) =>
          (l.userName || "").toLowerCase().includes(q) ||
          (l.actionType || "").toLowerCase().includes(q),
      );
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading super admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 topbar-elevate">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Shield
                  className="text-indigo-600"
                  size={24}
                  aria-hidden="true"
                />
                <span className="text-lg font-bold text-gray-800">
                  Super Admin
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {navigation.find((item) => item.tab === activeTab)?.name ||
                  "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 whitespace-nowrap">
              <div className="hidden sm:block text-sm text-gray-500">
                Welcome, Super Admin
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("admin");
                  localStorage.removeItem("adminToken");
                  navigate("/");
                }}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />

        {/* Horizontal Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2">
          <nav className="flex items-center justify-center space-x-1 overflow-x-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => gotoTab(item.tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === item.tab
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon size={16} aria-hidden="true" />
                <span className="hidden sm:inline">{item.name}</span>
                <span className="sm:hidden">{item.name.split(" ")[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content area */}
        <div id="adminContent" className="p-6">
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

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {!analytics ? (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-800 rounded flex items-center justify-between fade-up">
                  <div>
                    {analyticsAuthRequired ? (
                      <div className="flex items-center gap-3">
                        <span>Live analytics require admin login.</span>
                        <button
                          onClick={() => navigate("/admin/login")}
                          className="underline font-semibold"
                        >
                          Login as admin
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api.post("/dev/create-admin", {
                                email: "info@tsaritservices.com",
                                password: "admin123",
                              });
                              const loginRes = await api.post("/admin/login", {
                                email: "info@tsaritservices.com",
                                password: "admin123",
                              });
                              const token = loginRes.data.token;
                              localStorage.setItem("adminToken", token);
                              localStorage.setItem(
                                "admin",
                                JSON.stringify({
                                  id: loginRes.data.userId,
                                  email: loginRes.data.email,
                                  fullName: loginRes.data.fullName,
                                  role: loginRes.data.role,
                                }),
                              );
                              const [usersRes, auditRes, analyticsRes] =
                                await Promise.all([
                                  api.get("/admin/users"),
                                  api.get("/admin/audit-logs"),
                                  api.get("/admin/analytics/monthly"),
                                ]);
                              setUsers(usersRes.data);
                              setAuditLogs(auditRes.data);
                              const frozenCount = (usersRes.data || []).filter(
                                (u) => u.accountStatus === "FROZEN",
                              ).length;
                              const freezeOpsCount = (
                                auditRes.data || []
                              ).filter((log) =>
                                ["ACCOUNT_FREEZE", "ACCOUNT_UNFREEZE"].includes(
                                  log.actionType,
                                ),
                              ).length;
                              setFreezeStats({
                                frozenUsers: frozenCount,
                                totalFreezeOperations: freezeOpsCount,
                              });
                              setAnalytics(analyticsRes.data);
                              setAnalyticsAuthRequired(false);
                              window.dispatchEvent(new Event("freeze:update"));
                              window.dispatchEvent(new Event("admin:update"));
                            } catch (err) {
                              console.error("Dev auto-login failed", err);
                              alert(
                                "Auto-login failed. Please login manually.",
                              );
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Auto-login (dev)
                        </button>
                      </div>
                    ) : (
                      <span>
                        Live analytics not available — ensure backend is running
                        and authenticated.
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-up">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold">
                        {stats?.totalUsers ?? "—"}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp
                          className="text-green-300 mr-1"
                          size={16}
                          aria-hidden="true"
                        />
                        <span className="text-green-300 text-sm">+12.5%</span>
                      </div>
                    </div>
                    <Users
                      className="text-blue-200"
                      size={32}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Active Subscriptions
                      </p>
                      <p className="text-3xl font-bold">
                        {stats?.activeSubscriptions ?? "—"}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp
                          className="text-green-300 mr-1"
                          size={16}
                          aria-hidden="true"
                        />
                        <span className="text-green-300 text-sm">+8.2%</span>
                      </div>
                    </div>
                    <DollarSign className="text-green-200" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Total Revenue
                      </p>
                      <p className="text-3xl font-bold">
                        {formatCurrency(
                          stats?.totalRevenue ??
                            revenueData.reduce((s, r) => s + r.revenue, 0),
                        )}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp
                          className="text-green-300 mr-1"
                          size={16}
                          aria-hidden="true"
                        />
                        <span className="text-green-300 text-sm">+15.3%</span>
                      </div>
                    </div>
                    <BarChart2 className="text-purple-200" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Total Transactions
                      </p>
                      <p className="text-3xl font-bold">
                        {stats?.totalTransactions ?? "—"}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingDown
                          className="text-red-300 mr-1"
                          size={16}
                          aria-hidden="true"
                        />
                        <span className="text-red-300 text-sm">-2.1%</span>
                      </div>
                    </div>
                    <Activity className="text-orange-200" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        Frozen Accounts
                      </p>
                      <p className="text-3xl font-bold" aria-live="polite">
                        {freezeStats?.frozenUsers ?? 0}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-red-100 text-sm">
                          Total freeze ops:{" "}
                          <span className="font-semibold">
                            {freezeStats?.totalFreezeOperations ?? 0}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Shield
                      className="text-red-200"
                      size={32}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up">
                <div className="card-lg fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Revenue Trend
                    </h3>
                    <LineChart
                      className="text-gray-400"
                      size={20}
                      aria-hidden="true"
                    />
                  </div>
                  <RevenueChart
                    data={revenueData}
                    formatCurrency={formatCurrency}
                  />
                  <div className="mt-3 text-sm text-gray-500">
                    Month-over-month revenue change:{" "}
                    <span
                      className={`font-semibold ${revenueGrowthPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {revenueGrowthPercent}%
                    </span>
                  </div>
                </div>

                <div className="card-lg fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      User Growth
                    </h3>
                    <BarChart3
                      className="text-gray-400"
                      size={20}
                      aria-hidden="true"
                    />
                  </div>
                  <UserGrowthChart data={userGrowthData} />
                  <div className="mt-3 text-sm text-gray-500">
                    Latest month users:{" "}
                    <span className="font-semibold">
                      {userGrowthData[userGrowthData.length - 1].users}
                    </span>{" "}
                    (
                    <span
                      className={`font-semibold ${userGrowthPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {userGrowthPercent}%
                    </span>
                    )
                  </div>
                </div>

                <div className="card-lg fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Monthly Performance
                    </h3>
                    <BarChart2
                      className="text-gray-400"
                      size={20}
                      aria-hidden="true"
                    />
                  </div>
                  <MonthlyPerformanceChart
                    data={monthlyPerformanceData}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </div>
              {/* Pie Chart and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subscription Distribution */}
                <div className="card-lg fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Subscription Plans
                    </h3>
                    <PieChart
                      className="text-gray-400"
                      size={20}
                      aria-hidden="true"
                    />
                  </div>
                  <SubscriptionPie data={subscriptionData} />
                </div>

                {/* Business Analytics Cards */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm">
                          Monthly Recurring Revenue
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(mrr)}
                        </p>
                      </div>
                      <Target
                        className="text-indigo-200"
                        size={24}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-2 text-sm text-indigo-100">
                      Growth:{" "}
                      <span
                        className={`font-semibold ${revenueGrowthPercent >= 0 ? "text-green-200" : "text-red-200"}`}
                      >
                        {revenueGrowthPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">
                          User Acquisition Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {userGrowthData[userGrowthData.length - 1].users}
                        </p>
                      </div>
                      <UserCheck
                        className="text-green-200"
                        size={24}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-2 text-sm text-green-100">
                      MoM:{" "}
                      <span
                        className={`font-semibold ${userGrowthPercent >= 0 ? "text-green-200" : "text-red-200"}`}
                      >
                        {userGrowthPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-sky-600 p-4 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Conversion Rate</p>
                        <p className="text-2xl font-bold">
                          {stats?.conversionRate ?? "24.8%"}
                        </p>
                      </div>
                      <CreditCard
                        className="text-blue-200"
                        size={24}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">
                          Average Revenue Per User (ARPU)
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(arpu)}
                        </p>
                      </div>
                      <Users
                        className="text-orange-200"
                        size={24}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="card-lg fade-up">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Average Revenue Per User
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(arpu)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Customer Lifetime Value
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(clv)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Net Promoter Score
                      </span>
                      <span className="font-semibold text-green-600">
                        {nps >= 0 ? `+${nps}` : nps}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        System Uptime
                      </span>
                      <span className="font-semibold text-green-600">
                        99.9%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-up">
                <div className="card-lg hover:shadow-lg transition-shadow fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Revenue Report
                    </h4>
                    <FileText
                      className="text-blue-500"
                      size={24}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed financial breakdown and projections
                  </p>
                  <button className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    View Report
                  </button>
                </div>

                <div className="card-lg hover:shadow-lg transition-shadow fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      User Analytics
                    </h4>
                    <Users
                      className="text-green-500"
                      size={24}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    User behavior and engagement insights
                  </p>
                  <button className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                    View Analytics
                  </button>
                </div>

                <div className="card-lg hover:shadow-lg transition-shadow fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Subscription Trends
                    </h4>
                    <BarChart2
                      className="text-purple-500"
                      size={24}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Plan performance and upgrade patterns
                  </p>
                  <button className="w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                    View Trends
                  </button>
                </div>

                <div className="card-lg hover:shadow-lg transition-shadow fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      System Health
                    </h4>
                    <Activity
                      className="text-orange-500"
                      size={24}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Platform performance and monitoring
                  </p>
                  <button className="w-full bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors">
                    View Health
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card-lg bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => gotoTab("users")}
                    className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200 hover:scale-105"
                  >
                    <Users
                      className="text-indigo-600 mb-2"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Manage Users
                    </span>
                  </button>
                  <button
                    onClick={() => gotoTab("subscriptions")}
                    className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-105"
                  >
                    <DollarSign
                      className="text-green-600 mb-2"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Subscriptions
                    </span>
                  </button>

                  <button
                    onClick={() => gotoTab("audit")}
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200 hover:scale-105"
                  >
                    <FileText
                      className="text-purple-600 mb-2"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Audit Logs
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
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
                          alert(
                            "Failed to refresh users. Check backend and admin token.",
                          );
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
          )}

          {/* Subscriptions Tab */}
          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              {/* Manual Plan Creation */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Create New Plan (Manual Entry)
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newPlan = {
                      planName: formData.get("planName"),
                      planType: formData.get("planType"),
                      price: parseFloat(formData.get("price")),
                      durationDays: parseInt(formData.get("durationDays")),
                      description: formData.get("description"),
                      maxProducts: parseInt(formData.get("maxProducts")) || -1,
                      maxUsers: parseInt(formData.get("maxUsers")) || -1,
                      isActive: true,
                      isPopular: formData.get("isPopular") === "on",
                      iconColor: formData.get("iconColor") || "#3B82F6",
                    };

                    try {
                      await api.post("/admin/subscription-plans", newPlan);
                      const plansRes = await api.get(
                        "/admin/subscription-plans",
                      );
                      setPlans(plansRes.data);
                      alert("Plan created successfully!");
                      e.target.reset();
                    } catch (err) {
                      console.error("Failed to create plan", err);
                      alert("Failed to create plan.");
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plan Name
                    </label>
                    <input
                      name="planName"
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plan Type
                    </label>
                    <select
                      name="planType"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (₹)
                    </label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (Days)
                    </label>
                    <input
                      name="durationDays"
                      type="number"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Products (-1 for unlimited)
                    </label>
                    <input
                      name="maxProducts"
                      type="number"
                      defaultValue="-1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Users (-1 for unlimited)
                    </label>
                    <input
                      name="maxUsers"
                      type="number"
                      defaultValue="-1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Icon Color
                    </label>
                    <input
                      name="iconColor"
                      type="color"
                      defaultValue="#3B82F6"
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      name="isPopular"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Mark as Popular
                    </label>
                  </div>
                  <div className="md:col-span-2 lg:col-span-1">
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Create Plan
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Existing Subscription Plans
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-bold text-lg text-gray-900">
                        {plan.planName}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {plan.description}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) => {
                              const updatedPlans = plans.map((p) =>
                                p.id === plan.id
                                  ? { ...p, price: parseFloat(e.target.value) }
                                  : p,
                              );
                              setPlans(updatedPlans);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Max Products
                          </label>
                          <input
                            type="number"
                            value={plan.maxProducts}
                            onChange={(e) => {
                              const updatedPlans = plans.map((p) =>
                                p.id === plan.id
                                  ? {
                                      ...p,
                                      maxProducts: parseInt(e.target.value),
                                    }
                                  : p,
                              );
                              setPlans(updatedPlans);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <button
                          onClick={() =>
                            handleUpdatePlan(plan.id, {
                              price: plan.price,
                              maxProducts: plan.maxProducts,
                            })
                          }
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                        >
                          Update Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    User Subscriptions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Current subscription status for all users
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sub.user?.fullName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sub.planType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                sub.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : sub.status === "TRIAL"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sub.endDate
                              ? new Date(sub.endDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === "audit" && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Audit Logs
                  </h3>
                  <p className="text-sm text-gray-600">
                    System activity and user actions log
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    placeholder="Filter by user/action"
                    className="px-3 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() => setAuditFilter("ALL")}
                    className={`px-3 py-1 rounded text-sm ${auditFilter === "ALL" ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAuditFilter("FREEZE")}
                    className={`px-3 py-1 rounded text-sm ${auditFilter === "FREEZE" ? "bg-red-600 text-white" : "bg-gray-50 text-gray-700"}`}
                  >
                    Freeze Ops
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {filteredAuditLogs().length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No audit logs found for the selected filter.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Timestamp
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              User
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Action
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Entity
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAuditLogs().map((log) => (
                            <tr key={log.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.userName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.actionType === "ACCOUNT_FREEZE" ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Freeze
                                  </span>
                                ) : log.actionType === "ACCOUNT_UNFREEZE" ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Unfreeze
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-700">
                                    {log.actionType}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.entityType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === "SUCCESS" ? "bg-green-100 text-green-800" : log.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                                >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {filteredAuditLogs().map((log) => (
                        <div
                          key={log.id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                {log.userName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${log.status === "SUCCESS" ? "bg-green-100 text-green-800" : log.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {log.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">
                                Action:
                              </span>
                              <span className="text-xs font-medium">
                                {log.actionType === "ACCOUNT_FREEZE" ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    Freeze
                                  </span>
                                ) : log.actionType === "ACCOUNT_UNFREEZE" ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Unfreeze
                                  </span>
                                ) : (
                                  log.actionType
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">
                                Entity:
                              </span>
                              <span className="text-xs font-medium">
                                {log.entityType}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === "tickets" && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Support Tickets
                </h3>
                <p className="text-sm text-gray-600">
                  Manage user support requests
                </p>
              </div>
              <div className="overflow-x-auto">
                {tickets.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No support tickets found.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ticket #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {ticket.ticketNumber || `#${ticket.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {ticket.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.user?.fullName || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    ticket.priority === "HIGH"
                                      ? "bg-red-100 text-red-800"
                                      : ticket.priority === "MEDIUM"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    ticket.status === "OPEN"
                                      ? "bg-blue-100 text-blue-800"
                                      : ticket.status === "IN_PROGRESS"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : ticket.status === "RESOLVED"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  ticket.createdAt,
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                  onClick={() => openAdminTicket(ticket)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                {ticket.subject}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {ticket.ticketNumber || `#${ticket.id}`} •{" "}
                                {ticket.user?.fullName || "N/A"}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                  ticket.priority === "HIGH"
                                    ? "bg-red-100 text-red-800"
                                    : ticket.priority === "MEDIUM"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {ticket.priority}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                  ticket.status === "OPEN"
                                    ? "bg-blue-100 text-blue-800"
                                    : ticket.status === "IN_PROGRESS"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : ticket.status === "RESOLVED"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {ticket.status}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center gap-3">
                              <div>
                                <span className="text-xs text-gray-600">
                                  Created:
                                </span>
                                <div className="text-xs font-medium">
                                  {new Date(
                                    ticket.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="ml-auto">
                                <button
                                  onClick={() => openAdminTicket(ticket)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                                >
                                  Manage
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load more / pagination */}
                    {ticketPage + 1 < ticketTotalPages && (
                      <div className="p-4 text-center">
                        <button
                          onClick={() =>
                            fetchAdminTickets(ticketPage + 1, 25, true)
                          }
                          className="px-4 py-2 bg-gray-100 rounded"
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Ticket Details Modal */}
          {selectedAdminTicket && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Ticket {selectedAdminTicket.ticketNumber} —{" "}
                      {selectedAdminTicket.subject}
                    </h3>
                    <p className="text-sm text-gray-600">
                      From: {selectedAdminTicket.user?.fullName || "N/A"} (
                      {selectedAdminTicket.user?.email || "N/A"})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={closeAdminTicket}
                      className="text-gray-600 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                  {(selectedAdminTicket.messages || []).map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded ${m.sender === "ADMIN" ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"}`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {m.sender} • {new Date(m.createdAt).toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add response
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full border rounded p-2"
                    placeholder="Type your response to user..."
                  />
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-700">
                      Attachments (optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setAdminFiles(Array.from(e.target.files))
                      }
                      className="w-full mt-1"
                    />
                    {adminFiles.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Attached: {adminFiles.map((f) => f.name).join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTicketStatus("IN_PROGRESS")}
                      disabled={adminStatusUpdating}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                    >
                      Mark In-Progress
                    </button>
                    <button
                      onClick={async () => {
                        await respondToTicket();
                        await openAdminTicket(selectedAdminTicket);
                      }}
                      disabled={adminRespondLoading}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                    >
                      Send Response
                    </button>
                    <button
                      onClick={async () => {
                        await updateTicketStatus("RESOLVED");
                        await openAdminTicket(selectedAdminTicket);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={replyAndResolve}
                      disabled={replyResolveLoading || !adminResponse.trim()}
                      className={`px-3 py-1 ${replyResolveLoading ? "bg-green-400" : "bg-green-800"} text-white text-sm rounded`}
                    >
                      {replyResolveLoading ? "Resolving..." : "Reply & Resolve"}
                    </button>
                  </div>
                  <div className="mt-3">
                    {selectedAdminTicket.status === "RESOLVED" ||
                    selectedAdminTicket.status === "CLOSED" ? (
                      <button
                        onClick={() => setConfirmDeleteOpen(true)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                        disabled
                      >
                        Delete (resolve first)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm delete modal for tickets */}
          <ConfirmModal
            open={confirmDeleteOpen}
            title="Delete Ticket"
            message={
              selectedAdminTicket
                ? `Delete ${selectedAdminTicket.ticketNumber || `#${selectedAdminTicket.id}`} — ${selectedAdminTicket.subject}? This action is permanent.`
                : "Delete this ticket?"
            }
            onConfirm={deleteTicket}
            onCancel={() => setConfirmDeleteOpen(false)}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={deleteLoading}
          />

          {/* Email Management Tab */}
          {activeTab === "emails" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Email Management Dashboard
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total Templates</p>
                        <p className="text-2xl font-bold text-blue-800">12</p>
                      </div>
                      <Mail className="text-blue-500" size={24} />
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Emails Sent Today</p>
                        <p className="text-2xl font-bold text-green-800">247</p>
                      </div>
                      <TrendingUp className="text-green-500" size={24} />
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">Open Rate</p>
                        <p className="text-2xl font-bold text-yellow-800">34.2%</p>
                      </div>
                      <Target className="text-yellow-500" size={24} />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">Bounce Rate</p>
                        <p className="text-2xl font-bold text-red-800">1.2%</p>
                      </div>
                      <Activity className="text-red-500" size={24} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Mail className="inline mr-2" size={16} />
                        Send Test Email
                      </button>
                      <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                        <Zap className="inline mr-2" size={16} />
                        AI Generate Template
                      </button>
                      <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <Users className="inline mr-2" size={16} />
                        Bulk Email Campaign
                      </button>
                      <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <BarChart2 className="inline mr-2" size={16} />
                        View Analytics
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">Email Types</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Welcome Emails</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Support Emails</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Marketing Emails</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Plan Upgrade Emails</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">AI Generated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Email Logs</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Welcome Email</p>
                        <p className="text-xs text-gray-600">info@tsaritservices.com</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sent</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Support Response</p>
                        <p className="text-xs text-gray-600">info@tsaritservices.com</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Delivered</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Plan Upgrade Offer</p>
                        <p className="text-xs text-gray-600">info@tsaritservices.com</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Opened</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">AI Email Features</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900">Smart Content Generation</h5>
                      <p className="text-xs text-blue-700 mt-1">AI-powered email content creation with personalization</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="text-sm font-medium text-green-900">Automated Campaigns</h5>
                      <p className="text-xs text-green-700 mt-1">Intelligent scheduling and targeting for email campaigns</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="text-sm font-medium text-purple-900">Performance Analytics</h5>
                      <p className="text-xs text-purple-700 mt-1">Real-time monitoring and optimization suggestions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database Status
                    </label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Connected (H2 In-Memory)
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Service
                    </label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Gmail SMTP Configured
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Gateway
                    </label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Razorpay Live Mode
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Storage
                    </label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Local Storage Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Maintenance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Database
                      className="text-blue-600 mb-2"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Backup Database
                    </span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <Bell
                      className="text-green-600 mb-2"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Send Notification
                    </span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <Activity
                      className="text-purple-600 mb-2"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      View Logs
                    </span>
                  </button>
                </div>
              </div>

              {/* Landing Page Editor */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Landing Page</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="text-sm text-gray-700">Hero Title</label>
                  <input value={landingForm.heroTitle || ''} onChange={(e) => setLandingForm(prev => ({...prev, heroTitle: e.target.value}))} className="w-full border rounded px-3 py-2" />

                  <label className="text-sm text-gray-700">Hero Subtitle</label>
                  <input value={landingForm.heroSubtitle || ''} onChange={(e) => setLandingForm(prev => ({...prev, heroSubtitle: e.target.value}))} className="w-full border rounded px-3 py-2" />

                  <label className="text-sm text-gray-700">Hero Image URL</label>
                  <input value={landingForm.heroImageUrl || ''} onChange={(e) => setLandingForm(prev => ({...prev, heroImageUrl: e.target.value}))} className="w-full border rounded px-3 py-2" />

                  <label className="text-sm text-gray-700">Primary CTA Text</label>
                  <input value={landingForm.ctaPrimaryText || ''} onChange={(e) => setLandingForm(prev => ({...prev, ctaPrimaryText: e.target.value}))} className="w-full border rounded px-3 py-2" />

                  <label className="text-sm text-gray-700">Primary CTA URL</label>
                  <input value={landingForm.ctaPrimaryUrl || ''} onChange={(e) => setLandingForm(prev => ({...prev, ctaPrimaryUrl: e.target.value}))} className="w-full border rounded px-3 py-2" />

                  <label className="text-sm text-gray-700">Features (JSON array)</label>
                  <textarea value={landingForm.featuresJson || ''} onChange={(e) => setLandingForm(prev => ({...prev, featuresJson: e.target.value}))} rows={6} className="w-full border rounded px-3 py-2 font-mono text-sm" />

                  <div className="flex items-center gap-3">
                    <button onClick={saveLanding} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
                    <button onClick={loadLanding} className="border px-4 py-2 rounded">Reload</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
