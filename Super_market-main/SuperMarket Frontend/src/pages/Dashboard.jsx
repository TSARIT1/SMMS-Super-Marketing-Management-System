import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Package,
  AlertCircle,
  ShoppingCart,
  Archive,
  IndianRupee,
  Clock,
  X,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Sparkles,
  Zap,
  Brain,
  Calendar,
  Filter,
  User,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  CreditCard,
  Settings,
  Shield,
  Eye,
  Plus,
  Upload,
  RefreshCw,
  Search,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import api from "../utils/api";
import RevenueChart from "../components/dashboard/RevenueChart";
import ProductCategoryPieChart from "../components/dashboard/ProductCategoryPieChart";
import InventoryStatusChart from "../components/dashboard/InventoryStatusChart";
import MonthlyPerformanceChart from "../components/dashboard/MonthlyPerformanceChart";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Dashboard = () => {
  const { t } = useTranslation();
  void t;
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(0);
  const [auditHasMore, setAuditHasMore] = useState(true);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("ALL");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState("ALL");
  const [revenuePeriod, setRevenuePeriod] = useState("month");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);

  // Fetch products from API (use app api instance)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error("No user found in localStorage");
        return;
      }
      const user = JSON.parse(userStr);
      // Try admin inventory endpoint first (returns ALL products), fallback to shop
      let response;
      try {
        response = await api.get("/admin/inventory", {
          params: { userId: user.id }
        });
      } catch (adminErr) {
        // Fallback to shop endpoint for non-admin users
        response = await api.get("/shop/products", {
          params: { userId: user.id }
        });
      }
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error("No user found in localStorage");
        return;
      }
      const user = JSON.parse(userStr);
      const response = await api.get("/orders", {
        params: { userId: user.id }
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  // Fetch user subscription
  const fetchSubscription = async () => {
    try {
      const headers = {};
      try {
        const adminRaw = localStorage.getItem("admin");
        if (adminRaw) {
          const a = JSON.parse(adminRaw);
          if (a && a.id) headers["userId"] = a.id;
        }
      } catch (err) {
        // silently ignore parse errors
      }
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u && u.id) headers["userId"] = headers["userId"] || u.id;
        }
      } catch (err) {
        // silently ignore parse errors
      }

      const response = await api.get("/subscription", { headers });
      
      if (response.data) {
        setSubscription(response.data);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      console.error("Error details:", err.response?.data || err.message);
      setSubscription(null);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async (page = 0, append = false, filter = "ALL") => {
    try {
      setAuditLoading(true);
      
      // Get user info for proper request headers
      let userId = null;
      let userRole = "USER";
      
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          userId = u.id;
          userRole = u.role || "USER";
        }
      } catch (err) {
        // silently ignore parse errors
      }

      // Use /recent endpoint for regular users (simpler and works without admin permissions)
      if (userRole === "USER" && userId) {
        const params = { 
          limit: 50 * (page + 1) // Get all logs up to current page
        };
        
        const headers = {
          "requesterId": userId,
          "requesterRole": userRole
        };

        const response = await api.get("/audit/recent", { headers, params });
        
        let allLogs = response.data.logs || [];
        
        // Apply filter if needed
        if (filter !== "ALL") {
          allLogs = allLogs.filter(log => 
            filter === "SUCCESS" ? log.status === "SUCCESS" : log.status === "FAILED"
          );
        }
        
        // Handle pagination
        const startIndex = page * 50;
        const newLogs = allLogs.slice(startIndex, startIndex + 50);
        
        if (append) {
          setAuditLogs(prev => [...prev, ...newLogs]);
        } else {
          setAuditLogs(newLogs);
        }
        
        setAuditHasMore(allLogs.length > (page + 1) * 50);
        setAuditPage(page);
      } else {
        // For admin users, use the /logs endpoint
        const headers = {};
        try {
          const adminRaw = localStorage.getItem("admin");
          if (adminRaw) {
            const a = JSON.parse(adminRaw);
            if (a && a.id) headers["requesterId"] = a.id;
            if (a && a.role) headers["requesterRole"] = a.role;
          }
        } catch (err) {
          // silently ignore parse errors
        }

        const params = { page, size: 50 };
        if (filter !== "ALL") {
          params.status = filter === "SUCCESS" ? "SUCCESS" : "FAILED";
        }

        const response = await api.get("/audit/logs", { headers, params });
        const newLogs = response.data.logs || [];

        if (append) {
          setAuditLogs(prev => [...prev, ...newLogs]);
        } else {
          setAuditLogs(newLogs);
        }

        setAuditHasMore(newLogs.length === 50);
        setAuditPage(page);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      console.error("Error details:", err.response?.data || err.message);
      if (!append) setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  // Refresh audit logs
  const refreshAuditLogs = () => {
    setAuditLogs([]);
    setAuditPage(0);
    setAuditHasMore(true);
    fetchAuditLogs(0, false, auditFilter);
  };

  // Load more audit logs
  const loadMoreAuditLogs = () => {
    if (!auditLoading && auditHasMore) {
      fetchAuditLogs(auditPage + 1, true, auditFilter);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!user || !token) {
      window.location.href = "/login";
      return;
    }
    
    fetchProducts();
    fetchOrders();
    fetchSubscription();
    fetchAuditLogs(0, false);
  }, []);

  // Handle audit filter changes
  useEffect(() => {
    setAuditLogs([]);
    setAuditPage(0);
    setAuditHasMore(true);
    fetchAuditLogs(0, false, auditFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditFilter]);

  const getExpiringSoonProducts = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return products.filter((product) => {
      if (!product.expiryDate) return false;
      const expiryDate = new Date(product.expiryDate);
      return expiryDate <= nextWeek && expiryDate >= today;
    });
  };

  // Calculate statistics
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const lowStockProducts = products.filter(
    (p) => p.quantity < p.minStock && p.quantity > 0,
  );
  const outOfStockProducts = products.filter((p) => p.quantity === 0);
  const expiringSoonProducts = getExpiringSoonProducts();
  // Calculate revenue from actual orders
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);

  // Today's revenue calculation
  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(o => {
      if (!o.date) return false;
      return new Date(o.date) >= today;
    }).reduce((s, o) => s + (o.total || 0), 0);
  }, [orders]);

  const todayOrderCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(o => {
      if (!o.date) return false;
      return new Date(o.date) >= today;
    }).length;
  }, [orders]);

  const topSellingProducts = [...products]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate profit from actual order items vs product cost
  // Revenue is from orders, cost is estimated from order items
  const grossProfit = orders.reduce((sum, order) => {
    if (!order.orderItems || order.orderItems.length === 0) return sum;
    const orderCost = order.orderItems.reduce((itemSum, item) => {
      return itemSum + (item.price || 0) * (item.quantity || 0);
    }, 0);
    return sum + ((order.total || 0) - orderCost * 0.7);
  }, 0);
  const profitMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // ========== REVENUE PERIOD FILTERING ==========
  const getDateRange = (period) => {
    const now = new Date();
    const start = new Date();
    switch (period) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case "year":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    }
    return { start, end: now };
  };

  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange(revenuePeriod);
    return orders.filter(o => {
      if (!o.date) return false;
      const d = new Date(o.date);
      return d >= start && d <= end;
    });
  }, [orders, revenuePeriod]);

  const periodRevenue = useMemo(() => filteredOrders.reduce((s, o) => s + (o.total || 0), 0), [filteredOrders]);
  const periodOrders = filteredOrders.length;
  const periodItems = useMemo(() => filteredOrders.reduce((s, o) => s + (o.items || 0), 0), [filteredOrders]);
  const periodAvgOrder = periodOrders > 0 ? periodRevenue / periodOrders : 0;

  // Daily revenue breakdown for current period
  const dailyRevenueBreakdown = useMemo(() => {
    const { start } = getDateRange(revenuePeriod);
    const buckets = {};
    
    if (revenuePeriod === "today") {
      // Hourly breakdown for today
      for (let h = 0; h < 24; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`;
        buckets[label] = { label, revenue: 0, orders: 0 };
      }
      filteredOrders.forEach(o => {
        const d = new Date(o.date);
        const label = `${d.getHours().toString().padStart(2, '0')}:00`;
        if (buckets[label]) {
          buckets[label].revenue += o.total || 0;
          buckets[label].orders += 1;
        }
      });
    } else if (revenuePeriod === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.forEach(d => { buckets[d] = { label: d, revenue: 0, orders: 0 }; });
      filteredOrders.forEach(o => {
        const d = new Date(o.date);
        const label = days[d.getDay()];
        buckets[label].revenue += o.total || 0;
        buckets[label].orders += 1;
      });
    } else if (revenuePeriod === "month") {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const label = d.toString();
        buckets[label] = { label, revenue: 0, orders: 0 };
      }
      filteredOrders.forEach(o => {
        const d = new Date(o.date);
        const label = d.getDate().toString();
        if (buckets[label]) {
          buckets[label].revenue += o.total || 0;
          buckets[label].orders += 1;
        }
      });
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(m => { buckets[m] = { label: m, revenue: 0, orders: 0 }; });
      filteredOrders.forEach(o => {
        const d = new Date(o.date);
        const label = months[d.getMonth()];
        buckets[label].revenue += o.total || 0;
        buckets[label].orders += 1;
      });
    }
    
    return Object.values(buckets);
  }, [filteredOrders, revenuePeriod]);

  // Product category distribution
  const categoryData = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // ========== AI BUSINESS INSIGHTS ==========
  const generateAIInsights = async () => {
    setGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = [];
      
      // Stock Management
      if (lowStockProducts.length > 0) {
        insights.push({
          type: 'warning',
          category: 'Inventory',
          title: 'Low Stock Alert',
          description: `${lowStockProducts.length} products are running low. AI recommends immediate restocking to avoid lost sales.`,
          action: `Prioritize restocking: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}`,
          priority: 'High'
        });
      }
      
      if (outOfStockProducts.length > 0) {
        insights.push({
          type: 'critical',
          category: 'Inventory',
          title: 'Out of Stock Products',
          description: `${outOfStockProducts.length} products are out of stock. This may result in customer dissatisfaction.`,
          action: 'Restock immediately or remove from inventory display',
          priority: 'Critical'
        });
      }
      
      // Revenue Analysis
      if (totalRevenue > 0) {
        const revenuePerProduct = totalRevenue / totalProducts;
        insights.push({
          type: revenuePerProduct > 500 ? 'success' : 'info',
          category: 'Revenue',
          title: revenuePerProduct > 500 ? 'Strong Revenue Performance' : 'Revenue Optimization Opportunity',
          description: `Average revenue per product: ₹${revenuePerProduct.toFixed(2)}. ${revenuePerProduct > 500 ? 'Excellent performance!' : 'Consider upselling strategies.'}`,
          action: revenuePerProduct > 500 ? 'Maintain current pricing strategy' : 'Implement bundle offers and loyalty programs',
          priority: 'Medium'
        });
      }
      
      // Profit Margin Analysis
      if (profitMargin > 0) {
        insights.push({
          type: profitMargin > 25 ? 'success' : 'warning',
          category: 'Profitability',
          title: profitMargin > 25 ? 'Healthy Profit Margins' : 'Profit Margin Improvement Needed',
          description: `Current profit margin: ${profitMargin.toFixed(1)}%. ${profitMargin > 25 ? 'Great cost management!' : 'Review supplier costs and pricing.'}`,
          action: profitMargin > 25 ? 'Focus on maintaining supplier relationships' : 'Negotiate better supplier rates or adjust pricing',
          priority: profitMargin > 25 ? 'Low' : 'High'
        });
      }
      
      // Top Selling Products
      if (topSellingProducts.length > 0) {
        insights.push({
          type: 'success',
          category: 'Sales',
          title: 'Best Performers Identified',
          description: `Top product: ${topSellingProducts[0].name} with ${topSellingProducts[0].sold || 0} units sold.`,
          action: 'Increase stock of top performers and create promotional bundles',
          priority: 'Medium'
        });
      }
      
      // Expiring Products
      if (expiringSoonProducts.length > 0) {
        insights.push({
          type: 'warning',
          category: 'Inventory',
          title: 'Products Expiring Soon',
          description: `${expiringSoonProducts.length} products will expire within 7 days.`,
          action: 'Run clearance sales or donate before expiration',
          priority: 'High'
        });
      }
      
      setAiInsights(insights);
    } finally {
      setGeneratingAI(false);
    }
  };

  const categoryChartData = Object.entries(categoryData).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  // Inventory status data
  const inventoryStatusData = [
    {
      category: "All Products",
      inStock: products.filter((p) => p.quantity > p.minStock).length,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
    },
  ];

  // Calculate monthly revenue from actual orders
  const monthlyRevenueData = React.useMemo(() => {
    const monthlyData = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData[months[monthIndex]] = 0;
    }
    
    // Aggregate revenue from orders
    orders.forEach(order => {
      if (order.date) {
        const orderDate = new Date(order.date);
        const monthName = months[orderDate.getMonth()];
        if (monthlyData.hasOwnProperty(monthName)) {
          monthlyData[monthName] += order.total || 0;
        }
      }
    });
    
    return Object.keys(monthlyData).map(month => ({
      month,
      revenue: monthlyData[month]
    }));
  }, [orders]);

  // Performance metrics from real data - must match MonthlyPerformanceChart dataKeys (revenue, users)
  const performanceData = React.useMemo(() => {
    return monthlyRevenueData.map(item => ({
      month: item.month,
      revenue: item.revenue,
      profit: Math.round(item.revenue * 0.3) || 0
    }));
  }, [monthlyRevenueData]);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading dashboard data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Navbar />

      <div className="space-y-6 p-4 pb-8">
        {/* Stats Grid - Move to top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Today's Revenue"
            value={`₹${todayRevenue.toFixed(2)}`}
            subtitle={`From ${todayOrderCount} orders today`}
            icon={<IndianRupee className="w-10 h-10" />}
            color="blue"
          />

          <StatCard
            title="Total Products"
            value={totalProducts}
            subtitle={`${totalSold} items sold`}
            icon={<Package className="w-10 h-10" />}
            color="green"
          />

          <StatCard
            title="Low Stock Alert"
            value={lowStockProducts.length}
            subtitle="Products running low"
            icon={<AlertCircle className="w-10 h-10" />}
            color="orange"
          />

          <StatCard
            title="Out of Stock"
            value={outOfStockProducts.length}
            subtitle="Items to restock"
            icon={<Archive className="w-10 h-10" />}
            color="red"
          />
        </div>

        {/* Two Column Layout for Current Plan and Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan Display */}
          {subscription ? (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg h-fit">
              <h3 className="text-xl font-bold mb-2">
                Current Plan: {subscription.planName || "N/A"}
              </h3>
              <p className="text-indigo-100 mb-4">
                {subscription.description || "No description available"}
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscription.status === "ACTIVE"
                        ? "bg-green-500 text-white"
                        : subscription.status === "TRIAL"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-500 text-white"
                    }`}
                  >
                    {subscription.status || "UNKNOWN"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Max Products:</span>
                  <span className="text-white">
                    {subscription.maxProducts === -1
                      ? "Unlimited"
                      : (subscription.maxProducts || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Max Users:</span>
                  <span className="text-white">
                    {subscription.maxUsers === -1
                      ? "Unlimited"
                      : (subscription.maxUsers || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Expires:</span>
                  <span className="text-white">
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="border-t border-indigo-400 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-semibold text-lg">Price:</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{Number(subscription.price || 0).toFixed(2)}</p>
                    <p className="text-indigo-100 text-xs">
                      per {subscription.durationDays || 0} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-6 rounded-xl shadow-lg h-fit">
              <h3 className="text-xl font-bold mb-2">No Active Plan</h3>
              <p className="text-gray-100 mb-4">
                You don't have an active subscription plan yet.
              </p>
              <button
                onClick={() => window.location.href = "/profile"}
                className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                View Plans
              </button>
            </div>
          )}

          {/* Audit Trail Section - Comprehensive Activity Log */}
          <Card className="fade-up p-4 lg:p-6">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Activity Audit Trail
                </h3>
                <button
                  onClick={refreshAuditLogs}
                  disabled={auditLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  title="Refresh audit logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                  {auditLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">✅ Successful</option>
                  <option value="FAILED">❌ Failed</option>
                </select>
                <select
                  value={auditCategoryFilter}
                  onChange={(e) => setAuditCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="AUTH">🔐 Login / Auth</option>
                  <option value="ORDER">🛒 Orders</option>
                  <option value="PRODUCT">📦 Products</option>
                  <option value="INVENTORY">📋 Inventory</option>
                  <option value="USER">👤 Profile / User</option>
                  <option value="PAYMENT">💳 Payments</option>
                  <option value="SUBSCRIPTION">⭐ Subscriptions</option>
                  <option value="SETTINGS">⚙️ Settings</option>
                </select>
              </div>
            </div>

            {(() => {
              // Filter logs by category and search
              const filteredLogs = auditLogs.filter(log => {
                // Category filter
                if (auditCategoryFilter !== "ALL") {
                  const type = (log.entityType || log.actionType || "").toUpperCase();
                  if (auditCategoryFilter === "AUTH" && !["AUTH", "LOGIN", "LOGOUT", "REGISTER", "PASSWORD_RESET", "PASSWORD_CHANGE"].some(k => type.includes(k) || (log.actionType || "").includes(k))) return false;
                  if (auditCategoryFilter === "ORDER" && !type.includes("ORDER")) return false;
                  if (auditCategoryFilter === "PRODUCT" && !type.includes("PRODUCT")) return false;
                  if (auditCategoryFilter === "INVENTORY" && !type.includes("INVENTORY")) return false;
                  if (auditCategoryFilter === "USER" && !["USER", "ACCOUNT"].some(k => type.includes(k) || (log.actionType || "").includes(k))) return false;
                  if (auditCategoryFilter === "PAYMENT" && !type.includes("PAYMENT")) return false;
                  if (auditCategoryFilter === "SUBSCRIPTION" && !["SUBSCRIPTION", "PLAN"].some(k => type.includes(k))) return false;
                  if (auditCategoryFilter === "SETTINGS" && !["SETTINGS", "CONFIG"].some(k => type.includes(k) || (log.actionType || "").includes(k))) return false;
                }
                // Search filter
                if (auditSearch.trim()) {
                  const q = auditSearch.toLowerCase();
                  return (
                    (log.actionDescription || "").toLowerCase().includes(q) ||
                    (log.actionType || "").toLowerCase().includes(q) ||
                    (log.entityType || "").toLowerCase().includes(q) ||
                    (log.userName || "").toLowerCase().includes(q)
                  );
                }
                return true;
              });

              // Helper: get icon & color for action type
              const getAuditIcon = (actionType, entityType) => {
                const at = (actionType || "").toUpperCase();
                if (at.includes("LOGIN")) return { icon: LogIn, color: "text-blue-600", bg: "bg-blue-50" };
                if (at.includes("LOGOUT")) return { icon: LogOut, color: "text-gray-600", bg: "bg-gray-50" };
                if (at.includes("REGISTER")) return { icon: Plus, color: "text-green-600", bg: "bg-green-50" };
                if (at.includes("ORDER_CREATE")) return { icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" };
                if (at.includes("ORDER_VIEW")) return { icon: Eye, color: "text-sky-600", bg: "bg-sky-50" };
                if (at.includes("PRODUCT_CREATE")) return { icon: Plus, color: "text-green-600", bg: "bg-green-50" };
                if (at.includes("PRODUCT_UPDATE")) return { icon: Edit, color: "text-amber-600", bg: "bg-amber-50" };
                if (at.includes("PRODUCT_DELETE")) return { icon: Trash2, color: "text-red-600", bg: "bg-red-50" };
                if (at.includes("PAYMENT")) return { icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" };
                if (at.includes("SUBSCRIPTION")) return { icon: Zap, color: "text-violet-600", bg: "bg-violet-50" };
                if (at.includes("USER_UPDATE") || at.includes("PROFILE")) return { icon: User, color: "text-indigo-600", bg: "bg-indigo-50" };
                if (at.includes("USER_DELETE")) return { icon: Trash2, color: "text-red-600", bg: "bg-red-50" };
                if (at.includes("FREEZE") || at.includes("SUSPEND")) return { icon: Shield, color: "text-orange-600", bg: "bg-orange-50" };
                if (at.includes("INVENTORY")) return { icon: Package, color: "text-teal-600", bg: "bg-teal-50" };
                if (at.includes("SETTINGS") || at.includes("CONFIG")) return { icon: Settings, color: "text-gray-600", bg: "bg-gray-50" };
                if (at.includes("PASSWORD")) return { icon: Shield, color: "text-yellow-600", bg: "bg-yellow-50" };
                if (at.includes("REPORT")) return { icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50" };
                if (at.includes("UPLOAD") || at.includes("IMPORT")) return { icon: Upload, color: "text-blue-600", bg: "bg-blue-50" };
                return { icon: Activity, color: "text-gray-600", bg: "bg-gray-50" };
              };

              // Helper: format action type label
              const formatActionType = (at) => {
                if (!at) return "UNKNOWN";
                return at.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace(/\bCreate\b/, "Created").replace(/\bUpdate\b/, "Updated").replace(/\bDelete\b/, "Deleted").replace(/\bView\b/, "Viewed");
              };

              // Helper: get border color for entity type
              const getBorderColor = (entityType) => {
                const et = (entityType || "").toUpperCase();
                if (et.includes("ORDER")) return "border-l-emerald-500";
                if (et.includes("PRODUCT") || et.includes("INVENTORY")) return "border-l-amber-500";
                if (et.includes("AUTH")) return "border-l-blue-500";
                if (et.includes("USER")) return "border-l-indigo-500";
                if (et.includes("PAYMENT")) return "border-l-purple-500";
                if (et.includes("SUBSCRIPTION") || et.includes("PLAN")) return "border-l-violet-500";
                if (et.includes("SETTINGS") || et.includes("SYSTEM")) return "border-l-gray-500";
                return "border-l-blue-500";
              };

              // Helper: format relative time (timestamps auto-adapt to user's locale)
              const timeAgo = (ts) => {
                if (!ts) return "";
                const now = new Date();
                const then = new Date(ts);
                const diff = Math.floor((now - then) / 1000);
                if (diff < 0) return "Just now"; // handle slight clock skew
                if (diff < 60) return "Just now";
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
                return then.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
              };

              // Helper: format full timestamp for tooltip — uses user's browser timezone
              const formatTimestamp = (ts) => {
                if (!ts) return "";
                const d = new Date(ts);
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const tzShort = d.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop();
                return d.toLocaleString(undefined, {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                  hour12: true,
                }) + " " + tzShort;
              };

              return (
                <>
                  {/* Summary Stats */}
                  {auditLogs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-700">
                          {auditLogs.filter(l => l.status === "SUCCESS").length}
                        </p>
                        <p className="text-[10px] text-green-600">Successful</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-red-700">
                          {auditLogs.filter(l => l.status === "FAILED").length}
                        </p>
                        <p className="text-[10px] text-red-600">Failed</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-700">
                          {auditLogs.filter(l => (l.actionType || "").includes("ORDER")).length}
                        </p>
                        <p className="text-[10px] text-blue-600">Orders</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-700">
                          {auditLogs.filter(l => (l.actionType || "").includes("PRODUCT") || (l.actionType || "").includes("INVENTORY")).length}
                        </p>
                        <p className="text-[10px] text-purple-600">Product Changes</p>
                      </div>
                    </div>
                  )}

                  {filteredLogs.length > 0 ? (
                    <>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {filteredLogs.map((log) => {
                          const { icon: AuditIcon, color, bg } = getAuditIcon(log.actionType, log.entityType);
                          return (
                            <div
                              key={log.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getBorderColor(log.entityType)} ${
                                log.status === "FAILED" ? "bg-red-50/50" : "bg-gray-50/70"
                              } hover:shadow-sm transition-shadow`}
                            >
                              <div className={`flex-shrink-0 p-1.5 rounded-lg ${bg} mt-0.5`}>
                                <AuditIcon className={`w-4 h-4 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-800 leading-tight">
                                    {log.actionDescription || formatActionType(log.actionType)}
                                  </p>
                                  <div className="flex-shrink-0 flex items-center gap-1">
                                    {log.status === "SUCCESS" ? (
                                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    log.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {formatActionType(log.actionType)}
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                                    {log.entityType || "SYSTEM"}
                                  </span>
                                  {log.userName && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                                      <User className="w-3 h-3" />
                                      {log.userName}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1" title={log.timestamp ? formatTimestamp(log.timestamp) : ""}>
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(log.timestamp)}
                                  </span>
                                  {log.ipAddress && (
                                    <span className="text-[10px] text-gray-400">
                                      IP: {log.ipAddress}
                                    </span>
                                  )}
                                </div>
                                {log.errorMessage && (
                                  <p className="text-xs text-red-600 mt-1 bg-red-50 p-1.5 rounded">
                                    ⚠ {log.errorMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {auditHasMore && (
                        <div className="mt-3 text-center">
                          <button
                            onClick={loadMoreAuditLogs}
                            disabled={auditLoading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm transition-colors"
                          >
                            {auditLoading ? "Loading..." : "Load More Activities"}
                          </button>
                        </div>
                      )}

                      <div className="mt-3 text-center">
                        <p className="text-[10px] text-gray-400">
                          Showing {filteredLogs.length} of {auditLogs.length} activities
                          {auditSearch || auditCategoryFilter !== "ALL" ? " (filtered)" : ""}
                          {" "} • Every operation is tracked for security
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2 text-sm">
                        {auditLoading ? "Loading audit logs..." : 
                         auditSearch || auditCategoryFilter !== "ALL" ? "No activities match your filters" : 
                         "No activity recorded yet"}
                      </p>
                      {!auditLoading && (
                        <button
                          onClick={refreshAuditLogs}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Try refreshing
                        </button>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </Card>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            title="Inventory Value"
            value={`₹${totalValue.toFixed(2)}`}
            subtitle={`${totalProducts} products`}
            icon={<Archive className="w-10 h-10" />}
            color="purple"
          />

          <StatCard
            title="Gross Profit"
            value={`₹${grossProfit.toFixed(2)}`}
            subtitle={`${profitMargin.toFixed(1)}% margin`}
            icon={<TrendingUp className="w-10 h-10" />}
            color="green"
          />

          <StatCard
            title="Expiring Soon"
            value={expiringSoonProducts.length}
            subtitle="Next 7 days"
            icon={<Clock className="w-10 h-10" />}
            color="red"
          />
        </div>

        {/* Expiring Soon Section */}
        {expiringSoonProducts.length > 0 && (
          <Card className="fade-up p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Expiring Soon (Next 7 Days)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {expiringSoonProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 lg:p-4 border border-red-200 bg-red-50 rounded-lg"
                >
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Expires: {product.expiryDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Stock: {product.quantity}
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Urgent attention needed
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="fade-up p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Selling Products
            </h3>
            <div className="space-y-3">
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 font-bold rounded-full text-xs lg:text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm lg:text-base">
                          {product.name}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm lg:text-base">
                        {product.sold || 0}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500">sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="fade-up p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Orders
            </h3>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm lg:text-base">
                        {order.customer || "Customer"}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500">
                        {order.date} • {order.items || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm lg:text-base">
                        ₹{(order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Analytics Charts Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics & Reports
          </h2>

          {/* Revenue Trend Chart */}
          <Card className="fade-up p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Revenue Trend
            </h3>
            <RevenueChart
              data={monthlyRevenueData}
              formatCurrency={(v) => `₹${v.toLocaleString()}`}
            />
          </Card>

          {/* Charts Grid - Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Product Category Distribution */}
            <Card className="fade-up p-4 lg:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Product Categories
              </h3>
              <ProductCategoryPieChart data={categoryChartData} />
            </Card>

            {/* Inventory Status */}
            <Card className="fade-up p-4 lg:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Inventory Status
              </h3>
              <InventoryStatusChart data={inventoryStatusData} />
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="fade-up p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Monthly Performance
            </h3>
            <MonthlyPerformanceChart data={performanceData} />
          </Card>

          {/* Revenue Report with Time Period Filter */}
          <Card className="fade-up p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Revenue Report
              </h3>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {[
                  { key: "today", label: "Today" },
                  { key: "week", label: "This Week" },
                  { key: "month", label: "This Month" },
                  { key: "year", label: "This Year" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setRevenuePeriod(key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      revenuePeriod === key
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">Revenue</p>
                <p className="text-xl font-bold text-green-700">₹{periodRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-xs font-medium text-blue-600 mb-1">Orders</p>
                <p className="text-xl font-bold text-blue-700">{periodOrders}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <p className="text-xs font-medium text-purple-600 mb-1">Items Sold</p>
                <p className="text-xl font-bold text-purple-700">{periodItems}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <p className="text-xs font-medium text-orange-600 mb-1">Avg Order</p>
                <p className="text-xl font-bold text-orange-700">₹{periodAvgOrder.toFixed(2)}</p>
              </div>
            </div>

            {/* Revenue Breakdown Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? `₹${Number(value).toFixed(2)}` : value,
                      name === "revenue" ? "Revenue" : "Orders"
                    ]}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" name="Orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Orders in Selected Period */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Orders in selected period ({filteredOrders.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2 font-medium text-gray-600">Order #</th>
                        <th className="text-left p-2 font-medium text-gray-600">Customer</th>
                        <th className="text-left p-2 font-medium text-gray-600">Date</th>
                        <th className="text-left p-2 font-medium text-gray-600">Items</th>
                        <th className="text-right p-2 font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-gray-800">{order.orderNumber || `#${order.id}`}</td>
                          <td className="p-2 text-gray-700">{order.customer || "Walk-in"}</td>
                          <td className="p-2 text-gray-500">{order.date ? new Date(order.date).toLocaleString() : "N/A"}</td>
                          <td className="p-2 text-gray-600">{order.items || 0}</td>
                          <td className="p-2 text-right font-semibold text-green-600">₹{(order.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Showing 10 of {filteredOrders.length} orders
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card className="p-4 lg:p-6 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">
                Total Revenue (All Time)
              </h4>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">{orders.length} orders</p>
            </Card>
            <Card className="p-4 lg:p-6 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Gross Profit</h4>
              <p className="text-2xl font-bold text-blue-600">
                ₹{grossProfit.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {profitMargin.toFixed(1)}% margin
              </p>
            </Card>
            <Card className="p-4 lg:p-6 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">
                Average Order Value
              </h4>
              <p className="text-2xl font-bold text-orange-600">
                ₹{(orders.length > 0 ? totalRevenue / orders.length : 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">{totalSold} items sold</p>
            </Card>
          </div>

          {/* AI Business Insights */}
          <Card className="fade-up p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">AI Business Insights</h3>
              </div>
              <button
                onClick={generateAIInsights}
                disabled={generatingAI}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Brain className="w-4 h-4" />
                {generatingAI ? 'Analyzing...' : 'Generate AI Insights'}
              </button>
            </div>
            
            {aiInsights.length === 0 ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center border border-purple-200">
                <Zap className="mx-auto text-purple-400 mb-3" size={48} />
                <p className="text-gray-700 font-medium mb-2">No AI insights yet</p>
                <p className="text-sm text-gray-600">Click "Generate AI Insights" to get intelligent business recommendations based on your store data</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsights.map((insight, index) => (
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          insight.type === 'critical'
                            ? 'bg-red-200 text-red-800'
                            : insight.type === 'warning'
                            ? 'bg-yellow-200 text-yellow-800'
                            : insight.type === 'success'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {insight.category}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          Priority: {insight.priority}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    <div className="bg-white bg-opacity-50 rounded-md p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Recommended Action:</p>
                      <p className="text-sm text-gray-800">{insight.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Low Stock Products */}
        {lowStockProducts.length > 0 && (
          <Card className="fade-up p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Low Stock Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 lg:p-4 border border-orange-200 bg-orange-50 rounded-lg"
                >
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Current: {product.quantity} • Min: {product.minStock}
                  </p>
                  <p className="text-xs text-orange-600 font-medium mt-2">
                    Restock needed
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Out of Stock Products */}
        {outOfStockProducts.length > 0 && (
          <Card className="p-4 lg:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Out of Stock Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {outOfStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 lg:p-4 border border-red-200 bg-red-50 rounded-lg"
                >
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Category: {product.category}
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Out of stock
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
export default Dashboard;
