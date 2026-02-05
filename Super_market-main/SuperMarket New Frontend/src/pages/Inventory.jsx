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
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { getAdmin } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import { downloadCSV } from "../utils/csv";
import ConfirmModal from "../components/ConfirmModal";
import Skeleton from "../components/Skeleton";
import { validateCSVFile } from "../utils/fileValidation";

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    minStock: 0,
    supplier: "",
    expiryDate: "",
    published: true,
    taxRate: 0,
  });

  // Loading states
  const [_isAdding, setIsAdding] = useState(false);
  const [_isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const CSV_TEMPLATE_HEADERS = [
    "name",
    "category",
    "quantity",
    "price",
    "minStock",
    "supplier",
    "expiryDate",
    "published",
    "taxRate",
  ];

  // Get user from localStorage (regular user login, not admin)
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error reading user from localStorage:", e);
      return null;
    }
  };

  const admin = getUserFromStorage() || getAdmin();

  const downloadTemplate = () => {
    const sample = [
      {
        name: "Sample Product",
        category: "Dairy",
        quantity: 10,
        price: 19.99,
        minStock: 5,
        supplier: "Supplier Co",
        expiryDate: "2026-01-01",
        published: true,
      },
    ];
    downloadCSV("inventory-upload-template.csv", sample);
    toast.success("CSV template downloaded");
  };

  // Replace inline validation with testable util
  // validateCSVFile(file, requiredHeaders) returns a Promise<{valid, reason}>

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
    "Other",
  ];

  const calculateDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    const days = calculateDaysUntilExpiry(expiryDate);
    if (days < 0)
      return { label: "Expired", color: "text-red-600 bg-red-50", days };
    if (days <= 7)
      return {
        label: "Expiring Soon",
        color: "text-orange-600 bg-orange-50",
        days,
      };
    return { label: "Valid", color: "text-green-600 bg-green-50", days };
  };

  // Fetch inventory for admin and listen for product updates
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        if (!admin || !admin.id) return;
        const resp = await api.get("/admin/inventory", {
          params: { userId: admin.id },
        });
        setProducts(resp.data);
      } catch (e) {
        console.error("Failed to load inventory", e);
        toast.error("Failed to load inventory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    const handler = () => fetchProducts();
    window.addEventListener("productsUpdated", handler);
    return () => window.removeEventListener("productsUpdated", handler);
  }, [admin?.id]);

  const handleAddProduct = async () => {
    const payload = {
      ...newProduct,
      quantity: Number(newProduct.quantity) || 0,
      price: Number(newProduct.price) || 0,
      minStock: Number(newProduct.minStock) || 0,
    };
    setIsAdding(true);
    try {
      if (admin && admin.id) {
        const resp = await api.post("/admin/inventory", payload, {
          params: { userId: admin.id },
        });
        setProducts([...products, resp.data]);
        toast.success("Product added");
      } else {
        const product = {
          id: Date.now(),
          ...payload,
          sold: 0,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
        setProducts([...products, product]);
        toast.success("Product added (local)");
      }
      setNewProduct({
        name: "",
        category: "",
        quantity: 0,
        price: 0,
        minStock: 0,
        supplier: "",
        expiryDate: "",
        published: true,
      });
      setShowAddModal(false);
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to add product", e);
      toast.error("Failed to add product");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditProduct = async () => {
    setIsEditing(true);
    try {
      if (editingProduct && editingProduct.id && admin && admin.id) {
        const resp = await api.put(
          `/admin/inventory/${editingProduct.id}`,
          editingProduct,
        );
        setProducts(
          products.map((p) => (p.id === resp.data.id ? resp.data : p)),
        );
        toast.success("Product updated");
      } else {
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
        toast.success("Product updated (local)");
      }
      setShowEditModal(false);
      setEditingProduct(null);
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to update product", e);
      toast.error("Failed to update product");
    } finally {
      setIsEditing(false);
    }
  };

  // perform actual deletion (called after confirmation)
  const performDelete = async (id) => {
    setIsDeleting(true);
    try {
      if (admin && admin.id) {
        await api.delete(`/admin/inventory/${id}`);
      }
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to delete product", e);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const togglePublishStatus = async (id) => {
    try {
      if (admin && admin.id) {
        const resp = await api.put(`/admin/inventory/${id}/publish`);
        setProducts(
          products.map((p) => (p.id === resp.data.id ? resp.data : p)),
        );
      } else {
        setProducts(
          products.map((p) =>
            p.id === id ? { ...p, published: !p.published } : p,
          ),
        );
      }
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to toggle publish", e);
      alert("Failed to change publish status. Please try again.");
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const valid = await validateCSVFile(file, CSV_TEMPLATE_HEADERS);
      if (!valid.valid) {
        toast.error(valid.reason);
        return;
      }
      if (admin && admin.id) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("userId", admin.id);
        const resp = await api.post("/admin/inventory/bulk-upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(
          resp?.data?.message || `File "${file.name}" uploaded successfully!`,
        );
        const list = await api.get("/admin/inventory", {
          params: { userId: admin.id },
        });
        setProducts(list.data);
        window.dispatchEvent(new CustomEvent("productsUpdated"));
      } else {
        toast.error("Bulk upload is only supported for logged-in admins.");
      }
    } catch (e) {
      console.error("Bulk upload failed", e);
      toast.error("Bulk upload failed. Check file and try again.");
    } finally {
      setShowBulkUpload(false);
      setIsUploading(false);
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0)
      return { label: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (product.quantity < product.minStock)
      return { label: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { label: "In Stock", color: "text-green-600 bg-green-50" };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Toaster position="top-right" />
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Bulk Stock Upload</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload PDF, CSV, or Excel files
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported formats: .csv, .xlsx, .xls, .pdf
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleBulkUpload}
                    className="hidden"
                    id="bulk-upload"
                  />
                  <div className="flex gap-2 justify-center">
                    <label
                      htmlFor="bulk-upload"
                      className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {isUploading ? "Uploading..." : "Choose File"}
                    </label>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
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
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={newProduct.expiryDate}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%) <span className="text-gray-500 font-normal">- Optional</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0 = Use profile tax rate"
                    value={newProduct.taxRate}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave as 0 to use shop's default tax rate from profile
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProduct.published}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        published: e.target.checked,
                      })
                    }
                    className="rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">
                    Publish product
                  </label>
                </div>
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
                      expiryDate: "",
                      published: true,
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

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
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
                  value={editingProduct.quantity || 0}
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
                  value={editingProduct.price || 0}
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
                  value={editingProduct.minStock || 0}
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
                  value={editingProduct.supplier || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      supplier: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={editingProduct.expiryDate || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      expiryDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%) <span className="text-gray-500 font-normal">- Optional</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0 = Use profile tax rate"
                    value={editingProduct.taxRate || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave as 0 to use shop's default tax rate from profile
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.published}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        published: e.target.checked,
                      })
                    }
                    className="rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">
                    Publish product
                  </label>
                </div>
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

        {/* Search and Filter */}
        <div className="card p-4 fade-up">
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
        </div>

        {/* Products Table */}
        <div className="card overflow-hidden fade-up">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <Skeleton rows={4} cols={9} />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Expiry
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Published
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Supplier
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    const expiryStatus = getExpiryStatus(product.expiryDate);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Updated: {product.lastUpdated}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
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
                        <td className="px-4 py-4 text-gray-900 font-medium">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {product.expiryDate}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${expiryStatus.color}`}
                          >
                            {expiryStatus.label}{" "}
                            {expiryStatus.days > 0 &&
                              `(${expiryStatus.days} days)`}
                            {expiryStatus.days < 0 &&
                              `(${Math.abs(expiryStatus.days)} days ago)`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => togglePublishStatus(product.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              product.published
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {product.published ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {product.published ? "Published" : "Unpublished"}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {product.supplier}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...product });
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(product.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
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
            )}
          </div>
        </div>
        <ConfirmModal
          open={confirmDeleteId !== null}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => performDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          loading={isDeleting}
        />
      </div>
    </>
  );
};

export default InventoryManagement;
