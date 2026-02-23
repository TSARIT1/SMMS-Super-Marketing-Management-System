import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ShoppingCart,
  X,
  Minus,
  CreditCard,
  Smartphone,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Scan,
  User,
  Download,
  Printer,
  Banknote,
  Edit2,
  Save,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import api from "../utils/api";
import { getAdmin } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import Skeleton from "../components/Skeleton";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1pt solid #000",
    paddingBottom: 10,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  shopDetails: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 8,
  },
  totalSection: {
    marginTop: 10,
    borderTop: "1pt solid #000",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  footer: {
    marginTop: 20,
    borderTop: "1pt solid #000",
    paddingTop: 10,
    textAlign: "center",
  },
  offerBadge: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1pt 3pt",
    borderRadius: 2,
    fontSize: 7,
    marginTop: 2,
  },
});

// PDF Bill Component
const BillPDF = ({
  cart,
  cartTotal,
  taxAmount,
  finalTotal,
  orderId,
  customerName,
}) => {
  // PDF is not a React component, so useTranslation cannot be used directly here.
  // Instead, pass translations as props or use a workaround. For now, use English as fallback.
  // For full i18n, refactor to pass t() results as props.
  return (
    <Document>
      <Page size={[350, 400]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.shopName}>{{/*i18n*/}}SUPER MART GROCERY</Text>
          <Text style={styles.shopDetails}>{{/*i18n*/}}123 Main Street, City Center</Text>
          <Text style={styles.shopDetails}>{{/*i18n*/}}Phone: +91 9491301258 | GST: 29AABCU9603R1ZM</Text>
          <Text style={styles.shopDetails}>-----------------------------------</Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{{/*i18n*/}}ORDER RECEIPT</Text>
          <Text>{{/*i18n*/}}Order ID: #{orderId}</Text>
          <Text>{{/*i18n*/}}Date: {new Date().toLocaleDateString()}</Text>
          <Text>{{/*i18n*/}}Time: {new Date().toLocaleTimeString()}</Text>
          <Text>{{/*i18n*/}}Customer: {customerName}</Text>
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{{/*i18n*/}}PRODUCTS</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>{{/*i18n*/}}Item</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>{{/*i18n*/}}Qty</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>{{/*i18n*/}}Price</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>{{/*i18n*/}}Total</Text>
              </View>
            </View>

            {/* Table Rows */}
            {cart.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.name}</Text>
                  {item.offers?.length > 0 && (
                    <View style={styles.offerBadge}>
                      <Text>{item.offers[0]}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>₹{item.price}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text>{{/*i18n*/}}Subtotal:</Text>
            <Text>₹{cartTotal}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>{{/*i18n*/}}Tax (10%):</Text>
            <Text>₹{taxAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold" }}>{{/*i18n*/}}Grand Total:</Text>
            <Text style={{ fontWeight: "bold" }}>₹{finalTotal}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{{/*i18n*/}}Thank you for shopping with us!</Text>
          <Text>{{/*i18n*/}}** Please keep this bill for exchange **</Text>
          <Text>{{/*i18n*/}}Visit again!</Text>
        </View>
      </Page>
    </Document>
  );
};

// Separate Payment Component
const PaymentSection = ({
  cart,
  cartTotal,
  taxAmount,
  finalTotal,
  onBackToShop,
  onPaymentSuccess,
  customerName,
  setCustomerName,
  gstEnabled,
  taxRate,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const processPayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    // For cash payment, skip online validation
    if (paymentMethod === "cash") {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPaymentStatus("success");
      setIsProcessing(false);
      onPaymentSuccess(paymentMethod);
      return;
    }

    // Validate UPI ID if UPI method selected
    if (paymentMethod === "upi" && !upiId) {
      alert("Please enter your UPI ID");
      return;
    }

    // Validate card details if card method selected
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        alert("Please fill all card details");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        amount: finalTotal,
        currency: "INR",
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customerInfo: {
          name: customerName,
          email: "info@tsaritservices.com",
        },
      };

      // Add payment method specific data
      if (paymentMethod === "upi") {
        paymentData.upiId = upiId;
      } else if (paymentMethod === "card") {
        paymentData.cardDetails = {
          number: cardNumber.replace(/\s/g, ""),
          expiry: cardExpiry,
          cvv: cardCvv,
          name: cardName,
        };
      }

      // Payment gateway integration
      toast.error("Payment gateway not configured. Please contact support.");
      setPaymentStatus("failed");
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentMethod("");
    setPaymentStatus("");
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    onBackToShop();
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? "/" + v.substring(2, 4) : "");
    }
    return v;
  };

  return (
    <div className="card-lg max-w-2xl mx-auto fade-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <CreditCard className="w-6 h-6" />
        Payment Details
      </h2>

      {paymentStatus === "" && (
        <>
          {/* Customer Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          {/* Order Summary */}
          <div className="card p-4 mb-6 fade-up">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-gray-600 mb-1"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t mt-3 pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{cartTotal}</span>
              </div>
              {gstEnabled && (
                <div className="flex justify-between text-sm">
                  <span>Tax/GST ({(taxRate * 100).toFixed(1)}%):</span>
                  <span>₹{taxAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total:</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6 mb-6">
            <h3 className="font-semibold text-gray-800">
              Select Payment Method
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "cash"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Cash Payment</p>
                    <p className="text-sm text-gray-600">
                      Pay with cash
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("upi")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "upi"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">UPI Payment</p>
                    <p className="text-sm text-gray-600">
                      PhonePe, GPay, Paytm
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Credit/Debit Card
                    </p>
                    <p className="text-sm text-gray-600">
                      Visa, MasterCard, RuPay
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("netbanking")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "netbanking"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Net Banking</p>
                    <p className="text-sm text-gray-600">All major banks</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("wallet")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "wallet"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Digital Wallet
                    </p>
                    <p className="text-sm text-gray-600">
                      Paytm, MobiKwik, Amazon Pay
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* UPI Payment Fields */}
            {paymentMethod === "upi" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  UPI Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your UPI ID (e.g., username@okicici, username@ybl,
                      etc.)
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 text-center">
                      You will be redirected to your UPI app for payment
                      confirmation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment Fields */}
            {paymentMethod === "card" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Card Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(
                            e.target.value.replace(/\D/g, "").slice(0, 3),
                          )
                        }
                        maxLength={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter cardholder name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other payment method instructions */}
            {(paymentMethod === "netbanking" || paymentMethod === "wallet") && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {paymentMethod === "netbanking"
                    ? "Net Banking"
                    : "Digital Wallet"}
                </h4>
                <p className="text-sm text-gray-600">
                  You will be redirected to the{" "}
                  {paymentMethod === "netbanking" ? "banking" : "wallet"}
                  portal to complete your payment securely.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBackToShop}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Back to Cart
            </button>
            <button
              onClick={processPayment}
              disabled={isProcessing || !paymentMethod}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Pay ₹${finalTotal}`}
            </button>
          </div>
        </>
      )}

      {/* Payment Processing */}
      {isProcessing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
          <p className="text-sm text-gray-500 mt-2">
            Please don't close this window
          </p>
        </div>
      )}

      {/* Payment Success */}
      {paymentStatus === "success" && (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            Your order has been placed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Transaction ID: TXN{Date.now()}
            <br />
            Payment Method: {paymentMethod === "cash" ? "Cash Payment" : paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Card" : paymentMethod === "netbanking" ? "Net Banking" : "Wallet"}
          </p>
          <button
            onClick={resetPayment}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* Payment Failed */}
      {paymentStatus === "failed" && (
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't process your payment. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setPaymentStatus("")}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Try Again
            </button>
            <button
              onClick={resetPayment}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// Main CustomerShop Component
const CustomerShop = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("shop");
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [shopSearch, setShopSearch] = useState("");
  const [shopCategory, setShopCategory] = useState("All");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualProductId, setManualProductId] = useState("");
  const [customerName, setCustomerName] = useState(t("shop.customerNameDefault") || "Walk-in Customer");
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [taxRate, setTaxRate] = useState(0.10); // Default 10% tax rate
  const [gstEnabled, setGstEnabled] = useState(true);
  
  // Editable cart item state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNetPrice, setEditNetPrice] = useState("");

  const categories = [
    "All",
    "Dairy",
    "Bakery",
    "Produce",
    "Meat",
    "Beverages",
    "Frozen",
    "Snacks",
    "Grains",
    "Pulses",
  ];
  const barcodeInputRef = useRef(null);

  // Auto-focus barcode input on component mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Fetch published products for the current admin (if available) and listen for updates
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        return null;
      }
    };
    const user = getUserFromStorage() || getAdmin();
    
    // Fetch tax configuration from profile
    const fetchTaxConfig = async () => {
      try {
        if (user && user.email) {
          const resp = await api.get("/profile", {
            params: { email: user.email },
          });
          if (resp.data) {
            // Set tax rate from profile, default to 10% if not set
            setTaxRate(resp.data.tax_rate !== undefined ? resp.data.tax_rate / 100 : 0.10);
            setGstEnabled(resp.data.gst_enabled !== undefined ? resp.data.gst_enabled : true);
          }
        }
      } catch (err) {
        console.error("Failed to load tax configuration", err);
        // Keep default values
      }
    };
    
    const fetchPublished = async () => {
      setIsLoadingProducts(true);
      try {
        if (user && user.id) {
          const resp = await api.get("/shop/products", {
            params: { userId: user.id },
          });
          if (Array.isArray(resp.data)) {
            setProducts(resp.data);
          }
        }
      } catch (e) {
        console.error("Failed to load shop products", e);
        toast.error("Failed to load products");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchTaxConfig();
    fetchPublished();
    const handler = () => fetchPublished();
    window.addEventListener("productsUpdated", handler);
    return () => window.removeEventListener("productsUpdated", handler);
  }, []);

  // Handle barcode scan result
  const handleBarcodeScan = async (barcode) => {
    try {
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
      const email = admin?.email || "info@tsaritservices.com";
      const resp = await api.get(
        `/shop/products/barcode/${encodeURIComponent(barcode)}`,
        { params: { email } },
      );
      const product = resp.data;
      if (product) {
        setScannedProduct(product);
        addToCart(product);
        setBarcodeInput("");
        setTimeout(() => setScannedProduct(null), 3000);
        return;
      }
    } catch (err) {
      // fallback to local search if backend lookup fails
      console.debug("Barcode lookup failed:", err?.message || err);
    }

    // fallback to local products
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      setScannedProduct(product);
      addToCart(product);
      setBarcodeInput("");
      setTimeout(() => setScannedProduct(null), 3000);
    } else {
      alert("Product not found! Please check the barcode.");
      setBarcodeInput("");
    }
  };

  // Handle manual barcode input
  const handleManualBarcodeSubmit = () => {
    if (barcodeInput.trim().length > 0) {
      handleBarcodeScan(barcodeInput.trim());
    }
  };

  // Handle key press events for barcode input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleManualBarcodeSubmit();
    }
  };

  // Handle manual product addition by ID
  const handleManualAdd = () => {
    const productId = parseInt(manualProductId);
    const product = products.find((p) => p.id === productId);

    if (product) {
      addToCart(product);
      setManualProductId("");
      setShowManualAdd(false);
    } else {
      alert("Product ID not found! Please check the product ID.");
    }
  };

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
    return { label: "Fresh", color: "text-green-600 bg-green-50", days };
  };

  const getOfferColor = (offer) => {
    if (offer.includes("%")) return "bg-red-100 text-red-800";
    if (offer.includes("+") || offer.includes("Free"))
      return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

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
        toast.success(`${product.name} quantity updated in cart`);
      } else {
        toast("Max stock reached", { icon: "⚠️" });
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} added to cart`);
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

  // Edit cart item functions
  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditPrice(item.price?.toString() || "");
    setEditNetPrice(item.netPrice?.toString() || "");
  };

  const saveItemEdit = () => {
    if (editingItemId === null) return;
    
    const newMrp = Math.max(0, parseFloat(editPrice) || 0);
    const newNetPrice = Math.max(0, parseFloat(editNetPrice) || newMrp);
    const newName = editName.trim() || "Unnamed Product";
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === editingItemId) {
          return { ...item, name: newName, price: newMrp, netPrice: newNetPrice };
        }
        return item;
      })
    );
    
    setEditingItemId(null);
    setEditName("");
    setEditPrice("");
    setEditNetPrice("");
    toast.success("Item updated!");
  };

  const cancelItemEdit = () => {
    setEditingItemId(null);
    setEditName("");
    setEditPrice("");
    setEditNetPrice("");
  };

  // Calculate cart total using netPrice (discounted price) instead of MRP price
  const getUnitPrice = (item) => {
    // Use netPrice if available, otherwise fall back to price (MRP)
    const netPrice = item?.netPrice;
    if (netPrice === "" || netPrice === null || netPrice === undefined) {
      return Number(item?.price) || 0;
    }
    const value = Number(netPrice);
    return Number.isFinite(value) ? value : (Number(item?.price) || 0);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + getUnitPrice(item) * item.quantity,
    0,
  );
  
  // Calculate tax per item if gstEnabled, otherwise use 0
  // Each product has its own taxRate (percentage), fallback to profile taxRate
  const taxAmount = gstEnabled 
    ? cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        // Use product's tax rate if available and > 0, otherwise use profile tax rate
        const itemTaxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate / 100 : taxRate;
        return sum + (itemTotal * itemTaxRate);
      }, 0)
    : 0;
  
  const finalTotal = cartTotal + taxAmount;
  
  // Calculate effective tax rate for display (weighted average)
  const effectiveTaxRate = cartTotal > 0 ? (taxAmount / cartTotal) : taxRate;

  const handleCheckout = () => {
    navigate("/cart", { state: { cart } });
  };

  const handlePaymentSuccess = async (selectedPaymentMethod = "cash") => {
    try {
      // Get user info for API call
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!userId) {
        console.error("No user found for order placement");
        return;
      }

      // Build order request matching backend OrderRequest DTO
      const orderRequest = {
        customerName: customerName || "Walk-in Customer",
        customerPhone: "", // Shop doesn't collect phone, but Cart does
        totalAmount: finalTotal,
        taxAmount: taxAmount,
        paymentMethod: (selectedPaymentMethod || "CASH").toUpperCase(),
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          mrp: Number(item.price) || 0,
          netPrice: getUnitPrice(item),
        })),
      };

      // Save order to backend
      const response = await api.post("/orders", orderRequest, {
        params: { userId: userId },
      });

      const savedOrder = response.data;

      // Update local products state to reflect inventory changes
      setProducts(
        products.map((p) => {
          const cartItem = cart.find((item) => item.id === p.id);
          if (cartItem) {
            return {
              ...p,
              quantity: p.quantity - cartItem.quantity,
              sold: (p.sold || 0) + cartItem.quantity,
            };
          }
          return p;
        }),
      );

      // Update orders list with the saved order
      const newOrder = {
        id: savedOrder.id || orders.length + 1,
        date: savedOrder.date || new Date().toISOString().split("T")[0],
        total: savedOrder.total || finalTotal,
        items: savedOrder.items || cart.reduce((sum, item) => sum + item.quantity, 0),
        customer: savedOrder.customer || customerName,
      };

      setOrders([...orders, newOrder]);
      setCurrentOrderId(newOrder.id);
      setOrderCompleted(true);
      setCurrentView("shop");

      // Dispatch event so Dashboard and Inventory can refresh
      window.dispatchEvent(new Event("productsUpdated"));
    } catch (err) {
      console.error("Error saving order:", err);
      // Show error to user instead of silently continuing
      alert("Failed to save order to the server. Please try again.");
      return;
    }
  };

  const handleBackToShop = () => {
    setCurrentView("shop");
  };

  const handleNewOrder = () => {
    setCart([]);
    setOrderCompleted(false);
    setCurrentOrderId(null);
    setCustomerName("Walk-in Customer");
  };

  const downloadBill = async () => {
    const blob = await pdf(
      <BillPDF
        cart={cart}
        cartTotal={cartTotal}
        taxAmount={taxAmount}
        finalTotal={finalTotal}
        orderId={currentOrderId}
        customerName={customerName}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bill-order-${currentOrderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printBill = async () => {
    const blob = await pdf(
      <BillPDF
        cart={cart}
        cartTotal={cartTotal}
        taxAmount={taxAmount}
        finalTotal={finalTotal}
        orderId={currentOrderId}
        customerName={customerName}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (currentView === "payment") {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <PaymentSection
            cart={cart}
            cartTotal={cartTotal}
            taxAmount={taxAmount}
            finalTotal={finalTotal}
            onBackToShop={handleBackToShop}
            onPaymentSuccess={handlePaymentSuccess}
            customerName={customerName}
            setCustomerName={setCustomerName}
            gstEnabled={gstEnabled}
            taxRate={taxRate}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-6">
        {/* Order Completion Modal */}
        {orderCompleted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Order Completed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your purchase. Order ID: #{currentOrderId}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={downloadBill}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Bill
                    </button>
                    <button
                      onClick={printBill}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Bill
                    </button>
                  </div>
                  <button
                    onClick={handleNewOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    New Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Barcode Scanner Section */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Barcode Scanner</h3>
            </div>

            <div className="flex items-center gap-2 w-full md:w-96">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan barcode or enter manually..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleManualBarcodeSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Manual Add Section */}
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <User className="w-4 h-4" />
              {showManualAdd ? "Hide Manual Add" : "Add Product Manually"}
            </button>

            {showManualAdd && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Enter Product ID"
                  value={manualProductId}
                  onChange={(e) => setManualProductId(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                />
                <button
                  onClick={handleManualAdd}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {scannedProduct && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Product Added Successfully!
                    </p>
                    <p className="text-sm text-green-700">
                      {scannedProduct.name} • ₹{scannedProduct.price} • Barcode:{" "}
                      {scannedProduct.barcode}
                    </p>
                  </div>
                </div>
                <button onClick={() => setScannedProduct(null)}>
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">POS Products</h2>

            <Card className="p-4">
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
            </Card>

            {isLoadingProducts ? (
              <div className="p-4">
                <Skeleton rows={4} cols={2} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredShopProducts.map((product) => {
                  const expiryStatus = getExpiryStatus(product.expiryDate);
                  return (
                    <div
                      key={product.id}
                      className="card p-4 hover:shadow-md transition fade-up"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.category} • ID: {product.id}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            {product.quantity} in stock
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${expiryStatus.color}`}
                          >
                            {expiryStatus.label}{" "}
                            {expiryStatus.days > 0 &&
                              `(${expiryStatus.days} days)`}
                          </span>
                        </div>
                      </div>

                      {/* Barcode Display */}
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        Barcode: {product.barcode}
                      </div>

                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires: {product.expiryDate}
                      </div>

                      {/* Offers Display */}
                      {product.offers?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-medium text-gray-700">
                              Special Offers:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {product.offers.map((offer, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 text-xs font-medium rounded ${getOfferColor(offer)}`}
                              >
                                {offer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-blue-600">
                            ₹{product.netPrice && Number(product.netPrice) < Number(product.price) 
                              ? Number(product.netPrice).toFixed(2) 
                              : Number(product.price).toFixed(2)}
                          </span>
                          {product.netPrice && Number(product.netPrice) < Number(product.price) && (
                            <span className="text-sm line-through text-red-400">
                              ₹{Number(product.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        {editingItemId === item.id ? (
                          // Edit Mode
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Product name"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">MRP (₹)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Net Price (₹)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editNetPrice}
                                  onChange={(e) => setEditNetPrice(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveItemEdit}
                                className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center justify-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                onClick={cancelItemEdit}
                                className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-800 text-sm">
                                  {item.name}
                                </p>
                                <button
                                  onClick={() => startEditingItem(item)}
                                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                ₹{getUnitPrice(item).toFixed(2)} each
                                {item.netPrice && item.price && Number(item.netPrice) < Number(item.price) && (
                                  <span className="ml-1 line-through text-red-400">
                                    ₹{Number(item.price).toFixed(2)}
                                  </span>
                                )}
                              </p>
                              {item.offers?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.offers.map((offer, index) => (
                                    <span
                                      key={index}
                                      className={`px-1 py-0.5 text-xs rounded ${getOfferColor(offer)}`}
                                    >
                                      {offer}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {gstEnabled && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax/GST ({(effectiveTaxRate * 100).toFixed(1)}%)</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                      <span>Total</span>
                      <span>₹{finalTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium mt-4 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      View Cart & Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerShop;
