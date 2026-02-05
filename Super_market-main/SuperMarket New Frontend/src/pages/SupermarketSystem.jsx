import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  X,
  Minus,
  DollarSign,
  Archive,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import toast, { Toaster } from "react-hot-toast";

const SupermarketSystem = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Fresh Milk",
      category: "Dairy",
      quantity: 45,
      price: 3.99,
      minStock: 20,
      supplier: "Dairy Farm Co",
      lastUpdated: "2025-10-30",
      sold: 155,
    },
    {
      id: 2,
      name: "Whole Wheat Bread",
      category: "Bakery",
      quantity: 12,
      price: 2.49,
      minStock: 15,
      supplier: "Local Bakery",
      lastUpdated: "2025-10-31",
      sold: 89,
    },
    {
      id: 3,
      name: "Organic Apples",
      category: "Produce",
      quantity: 8,
      price: 4.99,
      minStock: 25,
      supplier: "Fresh Farms",
      lastUpdated: "2025-10-29",
      sold: 203,
    },
    {
      id: 4,
      name: "Ground Beef",
      category: "Meat",
      quantity: 30,
      price: 7.99,
      minStock: 10,
      supplier: "Premium Meats",
      lastUpdated: "2025-10-31",
      sold: 67,
    },
    {
      id: 5,
      name: "Orange Juice",
      category: "Beverages",
      quantity: 55,
      price: 5.49,
      minStock: 20,
      supplier: "Citrus Co",
      lastUpdated: "2025-10-30",
      sold: 134,
    },
    {
      id: 6,
      name: "Cheddar Cheese",
      category: "Dairy",
      quantity: 25,
      price: 6.99,
      minStock: 15,
      supplier: "Dairy Farm Co",
      lastUpdated: "2025-10-30",
      sold: 78,
    },
    {
      id: 7,
      name: "Chocolate Chip Cookies",
      category: "Snacks",
      quantity: 40,
      price: 3.49,
      minStock: 20,
      supplier: "Sweet Treats",
      lastUpdated: "2025-10-31",
      sold: 112,
    },
    {
      id: 8,
      name: "Frozen Pizza",
      category: "Frozen",
      quantity: 18,
      price: 8.99,
      minStock: 10,
      supplier: "Quick Meals Inc",
      lastUpdated: "2025-10-30",
      sold: 95,
    },
  ]);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([
    { id: 1, date: "2025-10-30", total: 45.67, items: 5, customer: "John Doe" },
    {
      id: 2,
      date: "2025-10-30",
      total: 78.9,
      items: 8,
      customer: "Jane Smith",
    },
    {
      id: 3,
      date: "2025-10-31",
      total: 32.45,
      items: 4,
      customer: "Bob Wilson",
    },
    {
      id: 4,
      date: "2025-10-31",
      total: 156.78,
      items: 12,
      customer: "Alice Brown",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    minStock: 0,
    supplier: "",
  });

  const categories = [
    "All",
    "Dairy",
    "Bakery",
    "Produce",
    "Meat",
    "Beverages",
    "Frozen",
    "Snacks",
    "Household",
  ];

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      ...newProduct,
      quantity: Number(newProduct.quantity),
      price: Number(newProduct.price),
      minStock: Number(newProduct.minStock),
      sold: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setProducts([...products, product]);
    setNewProduct({
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      minStock: 0,
      supplier: "",
    });
    setShowAddModal(false);
  };

  const handleEditProduct = () => {
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...editingProduct,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : p,
      ),
    );
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const [_confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [_isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProduct = (id) => {
    setConfirmDeleteId(id);
  };

  const _performDeleteProduct = async (id) => {
    setIsDeleting(true);
    try {
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (e) {
      console.error("Failed to delete", e);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0)
      return { label: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (product.quantity < product.minStock)
      return { label: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { label: "In Stock", color: "text-green-600 bg-green-50" };
  };

  const Dashboard = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0,
    );
    const lowStockProducts = products.filter((p) => p.quantity < p.minStock);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalSold = products.reduce((sum, p) => sum + p.sold, 0);

    const topSellingProducts = [...products]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            subtitle={`From ${orders.length} orders`}
            icon={<DollarSign className="w-12 h-12" />}
            color="blue"
          />

          <StatCard
            title="Inventory Value"
            value={`$${totalValue.toFixed(2)}`}
            subtitle={`${totalProducts} products`}
            icon={<Archive className="w-12 h-12" />}
            color="green"
          />

          <StatCard
            title="Total Items Sold"
            value={totalSold}
            subtitle="Across all products"
            icon={<ShoppingCart className="w-12 h-12" />}
            color="purple"
          />

          <StatCard
            title="Low Stock Alerts"
            value={lowStockProducts.length}
            subtitle="Need restock"
            icon={<AlertCircle className="w-12 h-12" />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card fade-up p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Selling Products
            </h3>
            <div className="space-y-3">
              {topSellingProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{product.sold}</p>
                    <p className="text-sm text-gray-500">sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-up p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Orders
            </h3>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.customer}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.date} • {order.items} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="card fade-up p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Low Stock Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="card p-4 bg-orange-50 border-orange-200"
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
          </div>
        )}
      </div>
    );
  };

  const InventoryManagement = () => {
    const filteredProducts = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Updated: {product.lastUpdated}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {product.quantity}
                          </span>
                          {product.quantity < product.minStock && (
                            <TrendingDown className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {product.minStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.supplier}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct({ ...product });
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const CustomerShop = () => {
    const [shopSearch, setShopSearch] = useState("");
    const [shopCategory, setShopCategory] = useState("All");

    const availableProducts = products.filter((p) => p.quantity > 0);
    const filteredShopProducts = availableProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(shopSearch.toLowerCase());
      const matchesCategory =
        shopCategory === "All" || product.category === shopCategory;
      return matchesSearch && matchesCategory;
    });

    const addToCart = (product) => {
      const existingItem = cart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.quantity) {
          setCart(
            cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          );
        }
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    };

    const removeFromCart = (productId) => {
      setCart(cart.filter((item) => item.id !== productId));
    };

    const updateCartQuantity = (productId, newQuantity) => {
      if (newQuantity === 0) {
        removeFromCart(productId);
      } else {
        const product = products.find((p) => p.id === productId);
        if (newQuantity <= product.quantity) {
          setCart(
            cart.map((item) =>
              item.id === productId ? { ...item, quantity: newQuantity } : item,
            ),
          );
        }
      }
    };

    const cartTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const handleCheckout = () => {
      if (cart.length === 0) return;

      const newOrder = {
        id: orders.length + 1,
        date: new Date().toISOString().split("T")[0],
        total: cartTotal,
        items: cart.reduce((sum, item) => sum + item.quantity, 0),
        customer: "Customer " + (orders.length + 1),
      };

      setOrders([...orders, newOrder]);

      setProducts(
        products.map((p) => {
          const cartItem = cart.find((item) => item.id === p.id);
          if (cartItem) {
            return {
              ...p,
              quantity: p.quantity - cartItem.quantity,
              sold: p.sold + cartItem.quantity,
            };
          }
          return p;
        }),
      );

      setCart([]);
      alert("Order placed successfully!");
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Shop Products</h2>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={shopCategory}
                onChange={(e) => setShopCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShopProducts.map((product) => (
              <div
                key={product.id}
                className="card p-4 hover:shadow-md transition fade-up"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    {product.quantity} in stock
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card-lg sticky top-6 fade-up">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart ({cart.length})
            </h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Your cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${(cartTotal * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                    <span>Total</span>
                    <span>${(cartTotal * 1.1).toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium mt-4"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Navigation = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">SuperMart</span>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("inventory")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === "inventory"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Package className="w-4 h-4" />
              Inventory
            </button>
            <button
              onClick={() => setCurrentView("shop")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === "shop"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Shop
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto p-0">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "inventory" && <InventoryManagement />}
        {currentView === "shop" && <CustomerShop />}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-0">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantity: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Minimum Stock Level"
                value={newProduct.minStock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, minStock: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Supplier"
                value={newProduct.supplier}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, supplier: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Product
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewProduct({
                    name: "",
                    category: "",
                    quantity: 0,
                    price: 0,
                    minStock: 0,
                    supplier: "",
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-0">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={editingProduct.quantity}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Minimum Stock Level"
                value={editingProduct.minStock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    minStock: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Supplier"
                value={editingProduct.supplier}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    supplier: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditProduct}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupermarketSystem;
