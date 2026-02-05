import React, { useState, useEffect } from "react";

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
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Sparkles,
  Zap,
  Brain,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import api from "../utils/api";
import RevenueChart from "../components/dashboard/RevenueChart";
import ProductCategoryPieChart from "../components/dashboard/ProductCategoryPieChart";
import InventoryStatusChart from "../components/dashboard/InventoryStatusChart";
import MonthlyPerformanceChart from "../components/dashboard/MonthlyPerformanceChart";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState("ALL");
  const [auditPage, setAuditPage] = useState(0);
  const [auditHasMore, setAuditHasMore] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [_loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);

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
      const response = await api.get("/shop/products", {
        params: { userId: user.id }
      });
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
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
        console.warn('Failed to parse admin info from localStorage', err);
      }
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u && u.id) headers["userId"] = headers["userId"] || u.id;
        }
      } catch (err) {
        console.warn('Failed to parse user info from localStorage', err);
      }

      console.log("Fetching subscription with headers:", headers);
      const response = await api.get("/subscription", { headers });
      console.log("Subscription response:", response.data);
      
      if (response.data) {
        setSubscription(response.data);
      } else {
        console.warn("No subscription data received");
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
        console.warn('Failed to parse user info from localStorage', err);
      }

      // Use /recent endpoint for regular users (simpler and works without admin permissions)
      if (userRole === "USER" && userId) {
        const params = { 
          limit: 20 * (page + 1) // Get all logs up to current page
        };
        
        const headers = {
          "requesterId": userId,
          "requesterRole": userRole
        };

        console.log("Fetching user audit logs with headers:", headers);
        const response = await api.get("/audit/recent", { headers, params });
        
        let allLogs = response.data.logs || [];
        
        // Apply filter if needed
        if (filter !== "ALL") {
          allLogs = allLogs.filter(log => 
            filter === "SUCCESS" ? log.status === "SUCCESS" : log.status === "FAILED"
          );
        }
        
        // Handle pagination
        const startIndex = page * 20;
        const newLogs = allLogs.slice(startIndex, startIndex + 20);
        
        if (append) {
          setAuditLogs(prev => [...prev, ...newLogs]);
        } else {
          setAuditLogs(newLogs);
        }
        
        setAuditHasMore(allLogs.length > (page + 1) * 20);
        setAuditPage(page);
        console.log(`Loaded ${newLogs.length} audit logs (page ${page})`);
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
          console.warn('Failed to parse admin requester info from localStorage', err);
        }

        const params = { page, size: 20 };
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

        setAuditHasMore(newLogs.length === 20);
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
    // Debug authentication status
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    console.log("=== Dashboard Authentication Debug ===");
    console.log("User:", user ? JSON.parse(user) : "NONE");
    console.log("Token:", token ? `${token.substring(0, 30)}...` : "NONE");
    console.log("======================================");
    
    if (!user || !token) {
      console.error("⚠️ User not authenticated! Redirecting to login...");
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
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);

  const topSellingProducts = [...products]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate additional analytics
  const totalCostOfGoods = products.reduce(
    (sum, p) => sum + (p.sold || 0) * (p.price * 0.7),
    0,
  ); // Assuming 70% COGS
  const grossProfit = totalRevenue - totalCostOfGoods;
  const profitMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

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

  // Performance metrics from real data
  const performanceData = React.useMemo(() => {
    return monthlyRevenueData.map(item => ({
      month: item.month,
      sales: Math.round(item.revenue / 100),
      profit: Math.round(item.revenue * 0.3) // 30% profit margin estimate
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
            title="Total Revenue"
            value={`₹${totalRevenue.toFixed(2)}`}
            subtitle={`From ${orders.length} orders`}
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

          {/* Audit Trail Section */}
          <Card className="fade-up p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity (Audit Trail)
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Activities</option>
                  <option value="SUCCESS">Successful Only</option>
                  <option value="FAILED">Failed Only</option>
                </select>
                <button
                  onClick={refreshAuditLogs}
                  disabled={auditLoading}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh audit logs"
                >
                  {auditLoading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            {auditLogs.length > 0 ? (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {log.status === "SUCCESS" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {log.actionDescription}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {log.actionType || "UNKNOWN"}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            {log.entityType || "UNKNOWN"}
                          </span>
                          <span>
                            {log.timestamp 
                              ? new Date(log.timestamp).toLocaleString() 
                              : "N/A"}
                          </span>
                        </div>
                        {log.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {auditHasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMoreAuditLogs}
                      disabled={auditLoading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {auditLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Showing {auditLogs.length} activities • Like a bank statement for your operations
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {auditLoading ? "Loading audit logs..." : "No audit logs found"}
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

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card className="p-4 lg:p-6 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">
                Total Revenue
              </h4>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">This month</p>
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
                Cost of Goods
              </h4>
              <p className="text-2xl font-bold text-orange-600">
                ₹{totalCostOfGoods.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">70% of revenue</p>
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
