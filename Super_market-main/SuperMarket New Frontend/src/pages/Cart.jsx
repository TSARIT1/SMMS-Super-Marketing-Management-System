import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Receipt,
  Download,
  Printer,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { getAdmin } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

// Paper size configurations (in points: 1mm = 2.83465 points)
const PAPER_SIZES = {
  '58mm': { width: 164.4, height: 'auto', name: '58mm Thermal' },
  '80mm': { width: 226.77, height: 'auto', name: '80mm Thermal' },
  'A4': { width: 595.28, height: 841.89, name: 'A4' },
  'A5': { width: 419.53, height: 595.28, name: 'A5' },
};

// Dynamic PDF styles based on paper size
const getPdfStyles = (paperSize) => {
  const isThermal = paperSize === '58mm' || paperSize === '80mm';
  const isSmall = paperSize === '58mm';
  
  return StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      padding: isThermal ? 5 : 20,
      fontSize: isThermal ? (isSmall ? 7 : 8) : 10,
      fontFamily: "Courier",
    },
    header: {
      marginBottom: isThermal ? 5 : 15,
      borderBottom: isThermal ? "1pt dashed #000" : "1pt solid #000",
      paddingBottom: isThermal ? 3 : 10,
    },
    shopName: {
      fontSize: isThermal ? (isSmall ? 10 : 12) : 16,
      fontWeight: "bold",
      marginBottom: 2,
      textAlign: "center",
    },
    shopDetails: {
      fontSize: isThermal ? (isSmall ? 6 : 7) : 9,
      textAlign: "center",
      marginBottom: 2,
    },
    section: {
      marginBottom: isThermal ? 5 : 10,
    },
    sectionTitle: {
      fontSize: isThermal ? (isSmall ? 8 : 9) : 12,
      fontWeight: "bold",
      marginBottom: 3,
      textAlign: isThermal ? "left" : "left",
    },
    receiptRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
      fontSize: isThermal ? (isSmall ? 7 : 8) : 9,
    },
    itemRow: {
      flexDirection: "column",
      marginBottom: isThermal ? 3 : 5,
      borderBottom: isThermal ? "0.5pt dotted #ccc" : "none",
      paddingBottom: 2,
    },
    itemName: {
      fontSize: isThermal ? (isSmall ? 7 : 8) : 9,
      fontWeight: "bold",
      marginBottom: 1,
    },
    itemDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: isThermal ? (isSmall ? 6 : 7) : 8,
    },
    divider: {
      borderTop: isThermal ? "1pt dashed #000" : "1pt solid #000",
      marginVertical: isThermal ? 3 : 5,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 3,
      paddingTop: 3,
      fontSize: isThermal ? (isSmall ? 9 : 10) : 12,
      fontWeight: "bold",
      borderTop: "2pt solid #000",
    },
    footer: {
      marginTop: isThermal ? 10 : 20,
      textAlign: "center",
      fontSize: isThermal ? (isSmall ? 6 : 7) : 8,
      borderTop: isThermal ? "1pt dashed #000" : "1pt solid #000",
      paddingTop: isThermal ? 5 : 10,
    },
    text: {
      fontSize: isThermal ? (isSmall ? 7 : 8) : 10,
    },
    textBold: {
      fontSize: isThermal ? (isSmall ? 7 : 8) : 10,
      fontWeight: "bold",
    },
  });
};
// PDF Receipt Component with dynamic paper size
const ReceiptPDF = ({ order, profile, taxConfig, paperSize = 'A4' }) => {
  const pdfStyles = getPdfStyles(paperSize);
  const isThermal = paperSize === '58mm' || paperSize === '80mm';
  const paperConfig = PAPER_SIZES[paperSize];
  
  return (
  <Document>
    <Page size={paperConfig.height === 'auto' ? { width: paperConfig.width } : { width: paperConfig.width, height: paperConfig.height }} style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.shopName}>{profile?.shop_name || "SuperMarket"}</Text>
        <Text style={pdfStyles.shopDetails}>{profile?.shop_address || ""}</Text>
        <Text style={pdfStyles.shopDetails}>
          {profile?.phone_number ? `Tel: ${profile.phone_number}` : ""}
        </Text>
        {profile?.gst_number && (
          <Text style={pdfStyles.shopDetails}>GST: {profile.gst_number}</Text>
        )}
      </View>

      <View style={pdfStyles.section}>
        <View style={pdfStyles.receiptRow}>
          <Text style={pdfStyles.text}>Receipt #:</Text>
          <Text style={pdfStyles.textBold}>{order.id}</Text>
        </View>
        <View style={pdfStyles.receiptRow}>
          <Text style={pdfStyles.text}>Date:</Text>
          <Text style={pdfStyles.text}>{new Date(order.date).toLocaleString()}</Text>
        </View>
        <View style={pdfStyles.receiptRow}>
          <Text style={pdfStyles.text}>Customer:</Text>
          <Text style={pdfStyles.text}>{order.customerName}</Text>
        </View>
        <View style={pdfStyles.receiptRow}>
          <Text style={pdfStyles.text}>Payment:</Text>
          <Text style={pdfStyles.text}>{order.paymentMethod?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={pdfStyles.divider} />

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>ITEMS</Text>
        {order.items.map((item, index) => (
          <View style={pdfStyles.itemRow} key={index}>
            <Text style={pdfStyles.itemName}>{item.name}</Text>
            <View style={pdfStyles.itemDetails}>
              <Text style={pdfStyles.text}>{item.quantity} x ₹{item.price}</Text>
              <Text style={pdfStyles.textBold}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={pdfStyles.divider} />

      <View style={pdfStyles.section}>
        <View style={pdfStyles.receiptRow}>
          <Text style={pdfStyles.text}>Subtotal:</Text>
          <Text style={pdfStyles.text}>₹{order.subtotal.toFixed(2)}</Text>
        </View>
        {taxConfig.gstEnabled && (
          <View style={pdfStyles.receiptRow}>
            <Text style={pdfStyles.text}>Tax/GST ({(taxConfig.effectiveTaxRate * 100).toFixed(1)}%):</Text>
            <Text style={pdfStyles.text}>₹{order.taxAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.textBold}>TOTAL:</Text>
          <Text style={pdfStyles.textBold}>₹{order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={pdfStyles.footer}>
        <Text>Thank you for shopping with us!</Text>
        <Text>Please visit again!</Text>
        {!isThermal && <Text>Powered by SuperMarket POS</Text>}
      </View>
    </Page>
  </Document>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAdmin();

  // Get cart items from location state, localStorage, or initialize empty
  const getInitialCart = () => {
    if (location.state?.cart && location.state.cart.length > 0) {
      return location.state.cart;
    }
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  };

  const [cart, setCart] = useState(getInitialCart());
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  
  // Tax configuration
  const [taxRate, setTaxRate] = useState(0.10); // Default 10%
  const [gstEnabled, setGstEnabled] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isTaxEditable, setIsTaxEditable] = useState(false);
  const [customTaxRate, setCustomTaxRate] = useState(null);

  // Payment states
  const [currentView, setCurrentView] = useState("cart"); // cart, payment, success
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Consolidated payment details (single state object)
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
  });
  
  // Order details
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Paper size selection
  const [paperSize, setPaperSize] = useState('80mm'); // Default to 80mm thermal
  const [billFont, setBillFont] = useState('normal'); // Font style: normal, modern, classic
  const [showBillPreview, setShowBillPreview] = useState(true); // Show real-time preview

  // Fetch profile and tax configuration
  useEffect(() => {
    const fetchTaxConfig = async () => {
      try {
        if (user && user.email) {
          const resp = await api.get("/profile", {
            params: { email: user.email },
          });
          if (resp.data) {
            setProfile(resp.data);
            // Tax rate from backend is in percentage (e.g., 18), convert to decimal (0.18)
            setTaxRate(resp.data.tax_rate !== undefined ? resp.data.tax_rate / 100 : 0.10);
            setGstEnabled(resp.data.gst_enabled !== undefined ? resp.data.gst_enabled : true);
            // Set paper size from profile, default to 80mm if not set
            if (resp.data.paper_size) {
              setPaperSize(resp.data.paper_size);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load tax configuration", e);
        // Keep default values
      }
    };

    fetchTaxConfig();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart && cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else if (cart && cart.length === 0) {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  // Calculate totals with per-product tax rates (MEMOIZED)
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  
  // Use custom tax rate if set, otherwise calculate per-item taxes (MEMOIZED)
  const taxAmount = useMemo(() => gstEnabled ? (
    customTaxRate !== null 
      ? cartTotal * (customTaxRate / 100)
      : cart.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          // Use product's tax rate if available and > 0, otherwise use profile tax rate
          const itemTaxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate / 100 : taxRate;
          return sum + (itemTotal * itemTaxRate);
        }, 0)
  ) : 0, [cart, customTaxRate, gstEnabled, taxRate]);
  
  const finalTotal = useMemo(() => cartTotal + taxAmount, [cartTotal, taxAmount]);
  
  // Get effective tax rate for display (weighted average or custom) (MEMOIZED)
  const effectiveTaxRate = useMemo(() => customTaxRate !== null 
    ? customTaxRate / 100
    : (taxAmount / cartTotal) || taxRate, [customTaxRate, taxAmount, cartTotal, taxRate]);

  // Cart operations (MEMOIZED for performance)
  const updateQuantity = useCallback((productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const clearCart = () => {
    setCart([]);
  };

  // Payment processing
  const processPayment = useCallback(async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Validate payment method specific fields
      if (paymentMethod === "upi" && !paymentDetails.upiId.trim()) {
        toast.error("Please enter UPI ID");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "card") {
        if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv || !paymentDetails.cardName) {
          toast.error("Please fill all card details");
          setIsProcessing(false);
          return;
        }
      }

      // Ultra-fast payment processing (minimal delay for user feedback)
      toast.loading("Processing payment...", { duration: 100 });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order instantly
      const orderData = {
        id: Date.now(),
        date: new Date().toISOString(),
        customerName: customerName,
        paymentMethod: paymentMethod,
        items: cart,
        subtotal: cartTotal,
        taxAmount: taxAmount,
        total: finalTotal,
        status: "completed",
      };

      setCurrentOrder(orderData);
      setPaymentStatus("success");
      setCurrentView("success");
      
      toast.dismiss();
      toast.success("Payment successful! Ready to print.", { duration: 1000 });
      
      // Clear cart immediately after order creation
      setTimeout(() => {
        clearCart();
      }, 100);

    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentStatus("failed");
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethod, customerName, cart, cartTotal, taxAmount, finalTotal, paymentDetails]);

  // PDF Generation (Download)
  // ULTRA-FAST: Print directly using HTML - NO PDF GENERATION
  const printReceipt = useCallback(() => {
    if (!currentOrder) {
      toast.error("No order found to print");
      return;
    }

    try {
      // Get paper size config
      const widthMM = paperSize === '58mm' ? '58mm' : paperSize === '80mm' ? '80mm' : paperSize === 'A4' ? '210mm' : '148mm';
      const fontSize = paperSize === '58mm' ? '8px' : paperSize === '80mm' ? '10px' : '12px';
      const headerSize = paperSize === '58mm' ? '10px' : paperSize === '80mm' ? '12px' : '16px';
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Courier, monospace; font-size: ${fontSize}; line-height: 1.4; }
            @media print { 
              body { margin: 0; padding: 0; }
              @page { size: ${widthMM} auto; margin: 0; }
            }
            .receipt { width: ${widthMM}; margin: 5px auto; padding: 5px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 5px; }
            .shop-name { font-size: ${headerSize}; font-weight: bold; }
            .shop-info { font-size: ${fontSize}; margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .items { margin: 5px 0; }
            .item { margin: 3px 0; font-size: 11px; }
            .item-line { display: flex; justify-content: space-between; }
            .totals { margin: 5px 0; font-weight: bold; }
            .total { display: flex; justify-content: space-between; margin: 3px 0; border-top: 2px solid #000; padding-top: 3px; }
            .footer { text-align: center; font-size: 10px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="receipt">
            <div class="header">
              <div class="shop-name">${profile?.shop_name || "SuperMarket"}</div>
              <div class="shop-info">${profile?.shop_address || ""}</div>
              <div class="shop-info">${profile?.phone_number || ""}</div>
              ${profile?.gst_number ? `<div class="shop-info">GST: ${profile.gst_number}</div>` : ""}
            </div>
            
            <div class="divider"></div>
            <div class="items">
              ${currentOrder.items.map(item => `
                <div class="item">
                  <div class="item-line">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join("")}
            </div>
            
            <div class="divider"></div>
            <div class="totals">
              <div class="item-line">
                <span>Subtotal:</span>
                <span>₹${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              ${gstEnabled ? `
                <div class="item-line">
                  <span>Tax (${(effectiveTaxRate * 100).toFixed(1)}%):</span>
                  <span>₹${currentOrder.taxAmount.toFixed(2)}</span>
                </div>
              ` : ""}
              <div class="total">
                <span>TOTAL:</span>
                <span>₹${currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Order #${currentOrder.id}</div>
              <div>${new Date(currentOrder.date).toLocaleString()}</div>
              <div>Payment: ${currentOrder.paymentMethod.toUpperCase()}</div>
              <div style="margin-top: 10px; font-size: 9px;">Thank you for shopping!</div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open("", "", "width=800,height=600");
      printWindow.document.write(printContent);
      printWindow.document.close();
      toast.success("Receipt printing!");
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate("/shop");
      }, 2000);
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Print failed: " + (error.message || "Unknown error"));
    }
  }, [currentOrder, profile, gstEnabled, effectiveTaxRate, paperSize, navigate]);

  // Ultra-fast HTML download (instant)
  const downloadHTML = useCallback(() => {
    if (!currentOrder) {
      toast.error("No order found to download");
      return;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Courier New, monospace; font-size: 12px; line-height: 1.5; background: #f5f5f5; }
            .container { width: 80mm; margin: 20px auto; background: white; padding: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .shop-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .shop-info { font-size: 10px; color: #555; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .items { margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
            .total-section { margin: 8px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; }
            .total-amount { font-size: 14px; font-weight: bold; color: #2ecc71; text-align: right; }
            .footer { text-align: center; font-size: 10px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 8px; }
            @media print { body { background: white; margin: 0; padding: 0; } .container { box-shadow: none; margin: 0; } }
          </style>
        </head>
        <body onload="window.print()">
          <div class="container">
            <div class="header">
              <div class="shop-name">${profile?.shop_name || 'SuperMarket'}</div>
              <div class="shop-info">${profile?.shop_address || 'Address'}</div>
              <div class="shop-info">${profile?.phone_number || 'Phone'}</div>
              ${profile?.gst_number ? `<div class="shop-info">GST: ${profile.gst_number}</div>` : ''}
            </div>
            
            <div class="divider"></div>
            <div class="items">
              ${currentOrder.items.map(item => `
                <div class="item">
                  <span>${item.name} x${item.quantity}</span>
                  <span>₹${(item.price * item.quantity).toFixed(0)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            <div class="total-section">
              <div class="item">
                <span>Subtotal:</span>
                <span>₹${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              ${gstEnabled ? `
                <div class="item">
                  <span>Tax (${(effectiveTaxRate * 100).toFixed(1)}%):</span>
                  <span>₹${currentOrder.taxAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="divider"></div>
              <div class="total-row">
                <span>TOTAL:</span>
                <span class="total-amount">₹${currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Order: #${currentOrder.id}</div>
              <div>${new Date(currentOrder.date).toLocaleString()}</div>
              <div>Payment: ${currentOrder.paymentMethod.toUpperCase()}</div>
              <div style="margin-top: 10px;">Thank You!</div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${currentOrder.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded!");
      
      // Auto-redirect after 1.5 seconds
      setTimeout(() => {
        navigate("/shop");
      }, 1500);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    }
  }, [currentOrder, profile, gstEnabled, effectiveTaxRate, navigate]);

  // Fast PDF download (background generation) (MEMOIZED) - with timeout
  const generatePDF = useCallback(async () => {
    if (!currentOrder) {
      toast.error("No order found to download");
      return;
    }

    try {
      toast.loading("Generating PDF...", { duration: 3000 });
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 5000)
      );
      
      const taxConfig = { taxRate, gstEnabled, effectiveTaxRate };
      const pdfPromise = pdf(
        <ReceiptPDF order={currentOrder} profile={profile} taxConfig={taxConfig} paperSize={paperSize} />
      ).toBlob();
      
      const blob = await Promise.race([pdfPromise, timeoutPromise]);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${currentOrder.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF too slow, trying HTML download...");
      // Fallback to HTML download
      setTimeout(() => downloadHTML(), 500);
    }
  }, [currentOrder, profile, taxRate, gstEnabled, effectiveTaxRate, paperSize, downloadHTML]);

  // Format card number with spaces
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

  // Format expiry date MM/YY
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? "/" + v.substring(2, 4) : "");
    }
    return v;
  };

  // Render Cart View
  if (currentView === "cart") {
    return (
      <>
        <Navbar />
        <Toaster position="top-right" />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/shop")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="w-7 h-7" />
                  Shopping Cart
                </h1>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="card-lg text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">Add some products to get started</p>
                <button
                  onClick={() => navigate("/shop")}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="card p-4 fade-up">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            ₹{item.price}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            ₹{item.price * item.quantity}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="card-lg sticky top-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Order Summary
                    </h3>

                    {/* Customer Name */}
                    <div className="mb-4">
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

                    {/* Tax Info Badge */}
                    {gstEnabled && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-blue-700">
                            <span className="font-semibold">Tax Rate:</span> {(effectiveTaxRate * 100).toFixed(1)}%
                          </p>
                          <button
                            onClick={() => setIsTaxEditable(!isTaxEditable)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            {isTaxEditable ? 'Lock' : 'Edit'}
                          </button>
                        </div>
                        {isTaxEditable && (
                          <div className="mt-2">
                            <label className="block text-xs text-blue-600 mb-1">
                              Custom Tax Rate (%)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={customTaxRate !== null ? customTaxRate : (effectiveTaxRate * 100).toFixed(1)}
                                onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) || 0)}
                                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter tax %"
                              />
                              {customTaxRate !== null && (
                                <button
                                  onClick={() => setCustomTaxRate(null)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-blue-600 mt-2">
                          {customTaxRate !== null 
                            ? 'Using custom tax rate'
                            : 'Using per-product tax rates'}
                        </p>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6 pb-6 border-b">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cart.length} items):</span>
                        <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      
                      {gstEnabled && (
                        <div className="flex justify-between text-gray-600">
                          <span>Tax/GST ({(effectiveTaxRate * 100).toFixed(1)}%):</span>
                          <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t">
                        <span>Total:</span>
                        <span className="text-blue-600">₹{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={() => setCurrentView("payment")}
                      className="btn-primary w-full text-lg py-3 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </button>
                  </div>
                </div>

                {/* Real-Time Bill Preview */}
                <div className="lg:col-span-1">
                  <div className="card-lg sticky top-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Live Preview</h3>
                      <button
                        onClick={() => setShowBillPreview(!showBillPreview)}
                        className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {showBillPreview ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Paper Size Selector */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Paper Size:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PAPER_SIZES).map(([size, config]) => (
                          <button
                            key={size}
                            onClick={() => setPaperSize(size)}
                            className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                              paperSize === size
                                ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                                : "border-gray-300 hover:border-blue-300"
                            }`}
                          >
                            {config.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Selector */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Font:</label>
                      <select
                        value={billFont}
                        onChange={(e) => setBillFont(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="normal">Standard</option>
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                      </select>
                    </div>

                    {/* Bill Preview Display */}
                    {showBillPreview && currentOrder === null && cart.length > 0 && (
                      <div
                        className="border border-gray-300 rounded bg-white overflow-auto text-black"
                        style={{
                          width: paperSize === "58mm" ? "150px" : paperSize === "80mm" ? "200px" : "280px",
                          maxHeight: "400px",
                          fontSize: paperSize === "58mm" ? "8px" : paperSize === "80mm" ? "10px" : "11px",
                          fontFamily: billFont === "modern" ? "Arial" : billFont === "classic" ? "Georgia" : "Courier",
                          lineHeight: "1.3",
                          padding: "8px",
                        }}
                      >
                        <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "4px" }}>
                          <strong>{profile?.shop_name || "SuperMarket"}</strong>
                          <div style={{ fontSize: "8px" }}>{profile?.address || ""}</div>
                        </div>
                        <div style={{ margin: "4px 0", borderBottom: "1px dashed #000", paddingBottom: "4px" }}>
                          {cart.map((item) => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
                              <span>{item.name} x{item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontWeight: "bold", textAlign: "right", borderTop: "1px solid #000", paddingTop: "4px" }}>
                          <div>Subtotal: ₹{cartTotal.toFixed(2)}</div>
                          {gstEnabled && <div>Tax: ₹{taxAmount.toFixed(2)}</div>}
                          <div style={{ fontSize: "11px", color: "#000" }}>Total: ₹{finalTotal.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: "center", fontSize: "8px", marginTop: "4px" }}>Thank you!</div>
                      </div>
                    )}

                    {currentOrder && (
                      <div className="bg-green-50 border border-green-300 rounded p-3 text-center">
                        <p className="text-sm font-bold text-green-700">✓ Order Created!</p>
                        <p className="text-xs text-green-600 mt-1">Ready for printing</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Render Payment View
  if (currentView === "payment") {
    return (
      <>
        <Navbar />
        <Toaster position="top-right" />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="card-lg fade-up">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Payment Details
                </h2>
                <button
                  onClick={() => {
                    setCurrentView("cart");
                    setPaymentMethod("");
                    setPaymentDetails({ upiId: "", cardNumber: "", cardExpiry: "", cardCvv: "", cardName: "" });
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {paymentStatus === "" && (
                <>
                  {/* Order Summary */}
                  <div className="card p-4 mb-6">
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
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      {gstEnabled && (
                        <div className="flex justify-between text-sm">
                          <span>Tax/GST ({(effectiveTaxRate * 100).toFixed(1)}%):</span>
                          <span>₹{taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-6 mb-6">
                    <h3 className="font-semibold text-gray-800">
                      Select Payment Method
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          paymentMethod === "cash"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Banknote className="w-8 h-8 text-green-600" />
                          <p className="font-semibold text-gray-800">Cash</p>
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
                        <div className="flex flex-col items-center gap-2">
                          <Smartphone className="w-8 h-8 text-blue-600" />
                          <p className="font-semibold text-gray-800">UPI</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          paymentMethod === "card"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="w-8 h-8 text-purple-600" />
                          <p className="font-semibold text-gray-800">Card</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Specific Fields */}
                  {paymentMethod === "upi" && (
                    <div className="mb-6 fade-up">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.upiId}
                        onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="example@upi"
                      />
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-4 mb-6 fade-up">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber}
                          onChange={(e) =>
                            setPaymentDetails({...paymentDetails, cardNumber: formatCardNumber(e.target.value)})
                          }
                          maxLength="19"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardName}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cardExpiry}
                            onChange={(e) =>
                              setPaymentDetails({...paymentDetails, cardExpiry: formatExpiry(e.target.value)})
                            }
                            maxLength="5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cardCvv}
                            onChange={(e) =>
                              setPaymentDetails({...paymentDetails, cardCvv: e.target.value.replace(/\D/g, "").substring(0, 3)})
                            }
                            maxLength="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCurrentView("cart");
                        setPaymentMethod("");
                        setPaymentDetails({ upiId: "", cardNumber: "", cardExpiry: "", cardCvv: "", cardName: "" });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={processPayment}
                      disabled={isProcessing || !paymentMethod}
                      className="flex-1 btn-primary px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Complete Payment
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {paymentStatus === "failed" && (
                <div className="text-center py-8 fade-up">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    There was an issue processing your payment. Please try again.
                  </p>
                  <button
                    onClick={() => {
                      setPaymentStatus("");
                      setPaymentMethod("");
                    }}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render Success View
  if (currentView === "success" && currentOrder) {
    return (
      <>
        <Navbar />
        <Toaster position="top-right" />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="card-lg text-center fade-up">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-8">
                Thank you for your purchase, {customerName}
              </p>

              {/* Order Details */}
              <div className="card p-6 mb-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order Details
                  </h3>
                  <span className="text-sm text-gray-500">
                    #{currentOrder.id}
                  </span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{currentOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {gstEnabled && (
                    <div className="flex justify-between text-sm">
                      <span>Tax/GST ({(effectiveTaxRate * 100).toFixed(1)}%):</span>
                      <span>₹{currentOrder.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Paid:</span>
                    <span className="text-green-600">
                      ₹{currentOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <p>Payment Method: {currentOrder.paymentMethod.toUpperCase()}</p>
                  <p>Date: {new Date(currentOrder.date).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadHTML}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
                <button
                  onClick={printReceipt}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </button>
              </div>

              <button
                onClick={() => navigate("/shop")}
                className="btn-primary w-full mt-6 py-3"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default Cart;
