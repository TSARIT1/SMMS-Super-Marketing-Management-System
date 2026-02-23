import {
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingDown,
  Archive,
  Upload,
  Eye,
  EyeOff,
  Scan,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { getAdmin } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import { downloadCSV } from "../utils/csv";
import ConfirmModal from "../components/ConfirmModal";
import Skeleton from "../components/Skeleton";
import { validateCSVFile } from "../utils/fileValidation";

const InventoryManagement = () => {
  const { t } = useTranslation();
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
    quantity: "",
    price: "",
    netPrice: "",
    minStock: "",
    supplier: "",
    expiryDate: "",
    published: true,
    taxRate: "",
    barcode: "",
  });

  // Barcode scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null); // 'add' or 'edit'

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
    "netPrice",
    "minStock",
    "supplier",
    "expiryDate",
    "published",
    "taxRate",
    "barcode",
  ];

  // Check if BarcodeDetector API is supported
  const isBarcodeDetectorSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  // Start barcode scanner
  const startBarcodeScanner = async (target) => {
    if (!isBarcodeDetectorSupported) {
      toast.error(t("inventory.barcodeScannerNotSupported"));
      return;
    }

    try {
      setIsScanning(true);
      setScannerTarget(target);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.getElementById('barcode-scanner-video');
      if (video) {
        video.srcObject = stream;
        video.play();
        scanBarcode(video);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error(t("inventory.cameraAccessDenied") || "Camera access denied. Please allow camera access to use barcode scanner.");
      setIsScanning(false);
      setScannerTarget(null);
    }
  };

  // Scan barcode from video stream
  const scanBarcode = async (video) => {
    if (!isScanning) return;

    try {
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code']
      });

      const barcodes = await barcodeDetector.detect(video);
      
      if (barcodes.length > 0) {
        const scannedValue = barcodes[0].rawValue;
        
        if (scannerTarget === 'add') {
          setNewProduct(prev => ({ ...prev, barcode: scannedValue }));
        } else if (scannerTarget === 'edit') {
          setEditingProduct(prev => ({ ...prev, barcode: scannedValue }));
        }
        
        toast.success(t("inventory.barcodeScanned") || `Barcode scanned: ${scannedValue}`);
        stopBarcodeScanner();
        return;
      }
    } catch (err) {
      console.error("Barcode detection error:", err);
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(() => scanBarcode(video));
    }
  };

  // Stop barcode scanner
  const stopBarcodeScanner = () => {
    setIsScanning(false);
    setScannerTarget(null);
    
    const video = document.getElementById('barcode-scanner-video');
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
  };

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
        netPrice: 19.99,
        minStock: 5,
        supplier: "Supplier Co",
        expiryDate: "2026-01-01",
        published: true,
      },
    ];
    downloadCSV("inventory-upload-template.csv", sample);
    toast.success(t("inventory.csvTemplateDownloaded"));
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

  const parseNumber = (value, fallback = 0) => {
    if (value === "" || value === null || value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getUnitMrpPrice = (product) => parseNumber(product?.price, 0);
  const getUnitNetPrice = (product) =>
    parseNumber(product?.netPrice, getUnitMrpPrice(product));
  const getUnitDiscount = (product) =>
    Math.max(getUnitMrpPrice(product) - getUnitNetPrice(product), 0);

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
        const userRole = admin.role || "USER";
        // Use admin endpoint for ADMIN/SUPER_ADMIN, shop endpoint for regular users
        const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
        const endpoint = isAdmin ? "/admin/inventory" : "/shop/products";
        const resp = await api.get(endpoint, {
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
    const mrpPrice = parseNumber(newProduct.price, 0);
    const netPrice = parseNumber(newProduct.netPrice, mrpPrice);
    const payload = {
      ...newProduct,
      quantity: parseNumber(newProduct.quantity, 0),
      price: mrpPrice,
      netPrice,
      minStock: parseNumber(newProduct.minStock, 0),
      taxRate: parseNumber(newProduct.taxRate, 0),
    };
    setIsAdding(true);
    try {
      if (admin && admin.id) {
        const resp = await api.post("/admin/inventory", payload, {
          params: { userId: admin.id },
        });
        setProducts([...products, resp.data]);
        toast.success(t("inventory.productAdded"));
      } else {
        const product = {
          id: Date.now(),
          ...payload,
          sold: 0,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
        setProducts([...products, product]);
        toast.success(t("inventory.productAdded"));
      }
      setNewProduct({
        name: "",
        category: "",
        quantity: "",
        price: "",
        netPrice: "",
        minStock: "",
        supplier: "",
        expiryDate: "",
        published: true,
        taxRate: "",
      });
      setShowAddModal(false);
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to add product", e);
      toast.error(t("inventory.failedToAdd"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditProduct = async () => {
    const mrpPrice = parseNumber(editingProduct?.price, 0);
    const netPrice = parseNumber(editingProduct?.netPrice, mrpPrice);
    const updatedProduct = {
      ...editingProduct,
      quantity: parseNumber(editingProduct?.quantity, 0),
      price: mrpPrice,
      netPrice,
      minStock: parseNumber(editingProduct?.minStock, 0),
      taxRate: parseNumber(editingProduct?.taxRate, 0),
    };
    setIsEditing(true);
    try {
      if (editingProduct && editingProduct.id && admin && admin.id) {
        const resp = await api.put(
          `/admin/inventory/${editingProduct.id}`,
          updatedProduct,
          { params: { userId: admin.id } }
        );
        setProducts(
          products.map((p) => (p.id === resp.data.id ? resp.data : p)),
        );
        toast.success(t("inventory.productUpdated"));
      } else {
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...updatedProduct,
                  lastUpdated: new Date().toISOString().split("T")[0],
                }
              : p,
          ),
        );
        toast.success(t("inventory.productUpdated"));
      }
      setShowEditModal(false);
      setEditingProduct(null);
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to update product", e);
      toast.error(t("inventory.failedToUpdate"));
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
      toast.success(t("inventory.productDeleted"));
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (e) {
      console.error("Failed to delete product", e);
      toast.error(t("inventory.failedToDelete"));
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
      toast.error(t("inventory.failedToToggle"));
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
          resp?.data?.message || t("inventory.bulkUploadSuccess", { name: file.name }),
        );
        const list = await api.get("/admin/inventory", {
          params: { userId: admin.id },
        });
        setProducts(list.data);
        window.dispatchEvent(new CustomEvent("productsUpdated"));
      } else {
        toast.error(t("inventory.bulkUploadAdminOnly"));
      }
    } catch (e) {
      console.error("Bulk upload failed", e);
      toast.error(t("inventory.bulkUploadFailed"));
    } finally {
      setShowBulkUpload(false);
      setIsUploading(false);
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0)
      return { label: t("inventory.outOfStock"), color: "text-red-600 bg-red-50" };
    if (product.quantity < product.minStock)
      return { label: t("inventory.lowStock"), color: "text-orange-600 bg-orange-50" };
    return { label: t("inventory.inStock"), color: "text-green-600 bg-green-50" };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode || "").toLowerCase().includes(searchTerm.toLowerCase());
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
            {t("inventory.title")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Toaster position="top-right" />
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Upload className="w-4 h-4" />
              {t("inventory.bulkUpload")}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              {t("inventory.addProduct")}
            </button>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">{t("inventory.bulkUploadTitle")}</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    {t("inventory.uploadDesc")}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {t("inventory.supportedFormats")}
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
                      {isUploading ? t("inventory.uploading") : t("inventory.chooseFile")}
                    </label>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      {t("inventory.downloadTemplate")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t("inventory.addNewProduct")}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("inventory.productName")}
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
                  <option value="">{t("inventory.selectCategory")}</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder={t("inventory.quantity")}
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="MRP Price"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Net Price"
                  value={newProduct.netPrice}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, netPrice: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  readOnly
                  value={`Discount: ₹${Math.max(parseNumber(newProduct.price, 0) - parseNumber(newProduct.netPrice, parseNumber(newProduct.price, 0)), 0).toFixed(2)}`}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                />
                <input
                  type="number"
                  placeholder={t("inventory.minStockLevel")}
                  value={newProduct.minStock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, minStock: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={t("inventory.supplier")}
                  value={newProduct.supplier}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, supplier: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  placeholder={t("inventory.expiryDate")}
                  value={newProduct.expiryDate}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.taxRateLabel")} <span className="text-gray-500 font-normal">{t("inventory.taxRateOptional")}</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder={t("inventory.taxRatePlaceholder")}
                    value={newProduct.taxRate}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, taxRate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("inventory.taxRateHelp")}
                  </p>
                </div>
                {/* Barcode Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.barcodeLabel") || "Barcode Number"} <span className="text-gray-500 font-normal">({t("inventory.optional") || "Optional"})</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("inventory.barcodePlaceholder") || "Enter or scan barcode"}
                      value={newProduct.barcode || ""}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, barcode: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => startBarcodeScanner('add')}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
                      title={t("inventory.scanBarcode") || "Scan Barcode"}
                    >
                      <Scan className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("inventory.barcodeHelp") || "Scan or manually enter the product barcode"}
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
                    {t("inventory.publishProduct")}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t("inventory.addProduct")}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewProduct({
                      name: "",
                      category: "",
                      quantity: "",
                      price: "",
                      netPrice: "",
                      minStock: "",
                      supplier: "",
                      expiryDate: "",
                      published: true,
                      taxRate: "",
                      barcode: "",
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t("inventory.editProduct")}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("inventory.productName")}
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
                  placeholder={t("inventory.quantity")}
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
                  placeholder="MRP Price"
                  value={editingProduct.price ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Net Price"
                  value={editingProduct.netPrice ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      netPrice: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  readOnly
                  value={`Discount: ₹${Math.max(parseNumber(editingProduct.price, 0) - parseNumber(editingProduct.netPrice, parseNumber(editingProduct.price, 0)), 0).toFixed(2)}`}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                />
                <input
                  type="number"
                  placeholder={t("inventory.minStockLevel")}
                  value={editingProduct.minStock ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      minStock: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={t("inventory.supplier")}
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
                  placeholder={t("inventory.expiryDate")}
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
                    {t("inventory.taxRateLabel")} <span className="text-gray-500 font-normal">{t("inventory.taxRateOptional")}</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder={t("inventory.taxRatePlaceholder")}
                    value={editingProduct.taxRate ?? ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        taxRate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("inventory.taxRateHelp")}
                  </p>
                </div>
                {/* Barcode Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.barcodeLabel") || "Barcode Number"} <span className="text-gray-500 font-normal">({t("inventory.optional") || "Optional"})</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("inventory.barcodePlaceholder") || "Enter or scan barcode"}
                      value={editingProduct.barcode || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, barcode: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => startBarcodeScanner('edit')}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
                      title={t("inventory.scanBarcode") || "Scan Barcode"}
                    >
                      <Scan className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("inventory.barcodeHelp") || "Scan or manually enter the product barcode"}
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
                    {t("inventory.publishProduct")}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditProduct}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t("inventory.saveChanges")}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  {t("common.cancel")}
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
                placeholder={t("inventory.searchPlaceholder")}
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
              <option value="All">{t("inventory.categoryFilter")}</option>
              {categories.slice(1).map((cat) => (
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
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.product")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.category")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Barcode
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.quantity")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      MRP Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Net Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Discount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.status")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.expiry")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.published")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.supplier")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.actions")}
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
                            {t("inventory.updated", { date: product.lastUpdated })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {product.barcode ? (
                            <span className="px-2 py-1 text-xs font-mono bg-purple-50 text-purple-700 rounded border border-purple-200">
                              {product.barcode}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">N/A</span>
                          )}
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
                            {t("inventory.minStock", { count: product.minStock })}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900 font-medium">
                          ₹{getUnitMrpPrice(product).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-gray-900 font-medium">
                          ₹{getUnitNetPrice(product).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-gray-900 font-medium">
                          ₹{getUnitDiscount(product).toFixed(2)}
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
                            {product.published ? t("inventory.publishedLabel") : t("inventory.unpublished")}
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
                              title={t("common.edit")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(product.id)}
                              className="text-red-600 hover:text-red-800"
                              title={t("common.delete")}
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
          title={t("inventory.deleteProduct")}
          message={t("inventory.deleteConfirm")}
          onConfirm={() => performDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          loading={isDeleting}
        />

        {/* Barcode Scanner Modal */}
        {isScanning && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {t("inventory.scanBarcode") || "Scan Barcode"}
                </h2>
                <button
                  onClick={stopBarcodeScanner}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  id="barcode-scanner-video"
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-32 border-2 border-purple-500 rounded-lg opacity-50">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                {t("inventory.positionBarcodeInFrame") || "Position the barcode within the frame to scan"}
              </p>
              <button
                onClick={stopBarcodeScanner}
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InventoryManagement;

