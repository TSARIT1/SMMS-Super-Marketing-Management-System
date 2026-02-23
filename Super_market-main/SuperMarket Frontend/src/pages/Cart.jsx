import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Download,
  Printer,
  Edit2,
  FileText,
  QrCode,
  Settings,
  Image as ImageIcon,
  XCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { getAdmin, getUser } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
// QR Code removed - using external QR code service instead

// Paper size configurations (in points: 1mm = 2.83465 points)
// For thermal printers, we calculate dynamic height based on content
// Accurate paper widths for thermal printers
const PAPER_SIZES = {
  '58mm': { width: 164.41, height: 'auto', name: '58mm Thermal', isThermal: true, mmWidth: 58, mmHeight: 'auto' },
  '80mm': { width: 226.77, height: 'auto', name: '80mm Thermal', isThermal: true, mmWidth: 80, mmHeight: 'auto' },
  'A4': { width: 595.28, height: 841.89, name: 'A4', isThermal: false, mmWidth: 210, mmHeight: 297 },
  'A5': { width: 419.53, height: 595.28, name: 'A5', isThermal: false, mmWidth: 148, mmHeight: 210 },
  'Letter': { width: 612, height: 792, name: 'Letter', isThermal: false, mmWidth: 216, mmHeight: 279 },
};

// Calculate dynamic page height based on content for thermal printers
const calculatePageHeight = (items, paperSize, profile) => {
  if (paperSize === 'A4' || paperSize === 'A5' || paperSize === 'Letter') {
    return PAPER_SIZES[paperSize].height;
  }
  
  // Base height for header, shop info, invoice details, totals, footer
  let baseHeight = 180; // Header section with logo
  
  // Add height for address lines
  const billProfile = getBillProfileMeta(profile);
  baseHeight += (billProfile.addressLines.length || 0) * 12;
  
  // Invoice details section
  baseHeight += 60;
  
  // Items table header
  baseHeight += 20;
  
  // Each item row (approximately 14 points per item)
  const itemHeight = items && items.length > 0 ? items.length * 14 : 0;
  baseHeight += itemHeight;
  
  // Totals section
  baseHeight += 80;
  
  // Terms and footer
  baseHeight += 50;
  
  // UPI QR code section if applicable
  if (billProfile.upiId) {
    baseHeight += paperSize === '58mm' ? 100 : 140;
  }
  
  // Add padding and minimum height
  const minHeight = paperSize === '58mm' ? 300 : 400;
  const calculatedHeight = Math.max(baseHeight + 40, minHeight);
  
  return calculatedHeight;
};

// Background paper patterns
const BACKGROUND_PATTERNS = {
  'none': { name: 'None', value: 'none' },
  'dots': { name: 'Dotted', value: 'dots' },
  'lines': { name: 'Lined', value: 'lines' },
  'grid': { name: 'Grid', value: 'grid' },
  'custom': { name: 'Custom Image', value: 'custom' },
};

// Dynamic Pdf styles based on paper size
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatMoney = (value) => toNumber(value, 0).toFixed(2);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "\x26amp;")
    .replace(/</g, "\x26lt;")
    .replace(/>/g, "\x26gt;")
    .replace(/"/g, "\x26quot;")
    .replace(/'/g, "\x26#39;");

const getProfileValue = (profile, keys, fallback = "") => {
  for (const key of keys) {
    const value = profile?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
};

const toAbsoluteAssetUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  if (value.startsWith("//")) return `${window.location.protocol}${value}`;
  if (value.startsWith("/")) return `${window.location.origin}${value}`;
  return `${window.location.origin}/${value.replace(/^\.?\//, "")}`;
};

const getBillProfileMeta = (profile) => {
  const shopName = getProfileValue(profile, ["shop_name", "shopName"], "STAR SUPER MARKET");
  const shopAddress = getProfileValue(profile, ["shop_address", "shopAddress", "address"], "");
  const phone = getProfileValue(profile, ["phone_number", "phone", "mobile"], "-");
  const whatsapp = getProfileValue(profile, ["whatsapp_number", "whatsapp", "whatsApp"], "");
  const gstNumber = getProfileValue(profile, ["gst_number", "gstNumber"], "-");
  const upiId = getProfileValue(profile, ["upi_id", "upiId"], "");
  const logoUrl = toAbsoluteAssetUrl(
    getProfileValue(profile, ["profile_photo", "shop_logo", "shopLogo", "logo", "logo_url"], ""),
  );
  const addressLines = String(shopAddress || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    shopName,
    addressLines,
    phone,
    whatsapp,
    gstNumber,
    upiId,
    logoUrl,
  };
};

// Generate UPI payment link for QR code
const generateUpiLink = (upiId, amount, shopName, transactionRef) => {
  if (!upiId || !amount) return "";
  const encodedShopName = encodeURIComponent(shopName || "Shop");
  const encodedUpiId = encodeURIComponent(upiId);
  return `upi://pay?pa=${encodedUpiId}&pn=${encodedShopName}&am=${amount.toFixed(2)}&tr=${transactionRef}&cu=INR`;
};

const numberToWords = (num) => {
  const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const twoDigits = (n) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`);
  const threeDigits = (n) => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${h ? `${ones[h]} HUNDRED` : ""}${h && r ? " " : ""}${r ? twoDigits(r) : ""}`.trim();
  };
  if (!num || num <= 0) return "ZERO";
  const n = Math.floor(num);
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;
  return [
    crore ? `${threeDigits(crore)} CRORE` : "",
    lakh ? `${threeDigits(lakh)} LAKH` : "",
    thousand ? `${threeDigits(thousand)} THOUSAND` : "",
    hundred ? threeDigits(hundred) : "",
  ].filter(Boolean).join(" ").trim();
};

const computeBillSummary = (order, taxConfig) => {
  const items = (order?.items || []).map((item) => {
    const qty = toNumber(item.quantity, 0);
    const mrp = toNumber(item.mrp ?? item.price, 0);
    const netRate = toNumber(item.netRate ?? item.netPrice ?? item.price, mrp);
    const amount = toNumber(item.amount, netRate * qty);
    const discount = Math.max(mrp - netRate, 0) * qty;
    return { ...item, qty, mrp, netRate, amount, discount };
  });
  const grossTotal = items.reduce((sum, item) => sum + item.mrp * item.qty, 0);
  const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
  const netTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = taxConfig?.gstEnabled ? toNumber(order?.taxAmount, 0) : 0;
  const grandTotal = toNumber(order?.total, netTotal + gstAmount);
  return {
    items,
    grossTotal,
    discountTotal,
    netTotal,
    gstAmount,
    grandTotal,
    totalInWords: `${numberToWords(Math.round(grandTotal))} RUPEES ONLY`,
  };
};

const getPdfStyles = (paperSize) => {
  const is58 = paperSize === "58mm";
  const is80 = paperSize === "80mm";
  
  return StyleSheet.create({
    page: { 
      backgroundColor: "#fff", 
      padding: is58 ? 4 : is80 ? 6 : 12, 
      fontFamily: "Courier", 
      fontSize: is58 ? 5 : is80 ? 6.5 : 8 
    },
    center: { textAlign: "center" },
    topHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: is58 ? 1 : 2 },
    logoWrap: { width: is58 ? 20 : is80 ? 30 : 42, height: is58 ? 20 : is80 ? 30 : 42, justifyContent: "center", alignItems: "flex-start" },
    logo: { width: is58 ? 18 : is80 ? 26 : 36, height: is58 ? 18 : is80 ? 26 : 36, objectFit: "contain" },
    topText: { flex: 1, marginLeft: is58 ? 2 : 4 },
    rightText: { textAlign: "right", fontSize: is58 ? 4 : is80 ? 5.5 : 6.5 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: is58 ? 1 : 2 },
    sep: { borderTop: "1pt dashed #000", marginVertical: is58 ? 2 : 4 },
    head: { fontWeight: "bold", fontSize: is58 ? 6 : is80 ? 8 : 10, textAlign: "center", marginBottom: is58 ? 1 : 2 },
    title: { fontWeight: "bold", textAlign: "center", marginBottom: is58 ? 1 : 3 },
    tiny: { fontSize: is58 ? 4 : is80 ? 6 : 7 },
    bold: { fontWeight: "bold" },
    itemHead: { flexDirection: "row", marginBottom: is58 ? 1 : 2, fontWeight: "bold" },
    cItem: { width: is58 ? "38%" : "40%" },
    cQty: { width: is58 ? "14%" : "12%", textAlign: "right" },
    cMrp: { width: is58 ? "16%" : "16%", textAlign: "right" },
    cNet: { width: is58 ? "16%" : "16%", textAlign: "right" },
    cAmt: { width: is58 ? "16%" : "16%", textAlign: "right" },
    itemRow: { flexDirection: "row", marginBottom: is58 ? 1 : 2 },
    footer: { marginTop: is58 ? 3 : 6, textAlign: "center" },
  });
};

const ReceiptPDF = ({ order, profile, taxConfig, paperSize = "80mm" }) => {
  const pdfStyles = getPdfStyles(paperSize);
  const paperConfig = PAPER_SIZES[paperSize];
  const bill = computeBillSummary(order, taxConfig);
  const invoiceDate = new Date(order.date).toLocaleString();
  const billProfile = getBillProfileMeta(profile);
  const customerMobile = order?.customerPhone || order?.customerMobile || "-";
  
  // Calculate dynamic page height for thermal printers
  const pageHeight = calculatePageHeight(bill.items, paperSize, profile);
  
  // Generate UPI QR code URL if UPI ID exists
  const upiQrCodeUrl = billProfile.upiId && bill.grandTotal > 0 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${paperSize === '58mm' ? 80 : 120}x${paperSize === '58mm' ? 80 : 120}&data=${encodeURIComponent(generateUpiLink(billProfile.upiId, bill.grandTotal, billProfile.shopName, order.id))}`
    : null;

  return (
    <Document>
      <Page size={{ width: paperConfig.width, height: pageHeight }} style={pdfStyles.page}>
        <View style={pdfStyles.topHeader}>
          <View style={pdfStyles.logoWrap}>
            {billProfile.logoUrl ? (
              <Image src={billProfile.logoUrl} style={pdfStyles.logo} />
            ) : null}
          </View>
          <View style={pdfStyles.topText}>
            {billProfile.phone !== "-" && <Text style={pdfStyles.rightText}>Contact: {billProfile.phone}</Text>}
            {billProfile.whatsapp && <Text style={pdfStyles.rightText}>WhatsApp: {billProfile.whatsapp}</Text>}
            {billProfile.gstNumber !== "-" && <Text style={pdfStyles.rightText}>GST No: {billProfile.gstNumber}</Text>}
          </View>
        </View>
        <Text style={pdfStyles.head}>{billProfile.shopName}</Text>
        {billProfile.addressLines.map((line, idx) => (
          <Text key={`addr-${idx}`} style={[pdfStyles.center, pdfStyles.tiny]}>{line}</Text>
        ))}
        <View style={pdfStyles.sep} />
        <Text style={pdfStyles.title}>BILL OF SUPPLY</Text>
        <View style={pdfStyles.sep} />

        <View style={pdfStyles.row}><Text>Invoice No:</Text><Text>{order.id}</Text></View>
        <View style={pdfStyles.row}><Text>Invoice Date:</Text><Text>{invoiceDate}</Text></View>
        <View style={pdfStyles.row}><Text>Name:</Text><Text>{order.customerName || "-"}</Text></View>
        <View style={pdfStyles.row}><Text>Mobile No:</Text><Text>{customerMobile}</Text></View>

        <View style={pdfStyles.sep} />
        <View style={pdfStyles.itemHead}>
          <Text style={pdfStyles.cItem}>Item Particulars</Text>
          <Text style={pdfStyles.cQty}>Qty</Text>
          <Text style={pdfStyles.cMrp}>MRP</Text>
          <Text style={pdfStyles.cNet}>NetRate</Text>
          <Text style={pdfStyles.cAmt}>Amount</Text>
        </View>
        {bill.items.map((item, idx) => (
          <View key={`${item.id || item.name}-${idx}`} style={pdfStyles.itemRow}>
            <Text style={pdfStyles.cItem}>{item.name}</Text>
            <Text style={pdfStyles.cQty}>{formatMoney(item.qty)}</Text>
            <Text style={pdfStyles.cMrp}>{formatMoney(item.mrp)}</Text>
            <Text style={pdfStyles.cNet}>{formatMoney(item.netRate)}</Text>
            <Text style={pdfStyles.cAmt}>{formatMoney(item.amount)}</Text>
          </View>
        ))}
        <View style={pdfStyles.sep} />

        <View style={pdfStyles.row}><Text style={pdfStyles.bold}>Gross Total (MRP):</Text><Text style={pdfStyles.bold}>{formatMoney(bill.grossTotal)}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.bold}>Discount Amount:</Text><Text style={pdfStyles.bold}>{formatMoney(bill.discountTotal)}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.bold}>NET TOTAL:</Text><Text style={pdfStyles.bold}>{formatMoney(bill.netTotal)}</Text></View>
        {taxConfig?.gstEnabled && <View style={pdfStyles.row}><Text style={pdfStyles.bold}>GST:</Text><Text style={pdfStyles.bold}>{formatMoney(bill.gstAmount)}</Text></View>}
        <View style={pdfStyles.row}><Text style={pdfStyles.bold}>FINAL TOTAL:</Text><Text style={pdfStyles.bold}>{formatMoney(bill.grandTotal)}</Text></View>
        <Text style={[pdfStyles.center, pdfStyles.bold, { marginTop: 4 }]}>{bill.totalInWords}</Text>

        <View style={pdfStyles.sep} />
        <View style={pdfStyles.row}><Text style={pdfStyles.bold}>You Saved:</Text><Text style={pdfStyles.bold}>Rs. {formatMoney(bill.discountTotal)}</Text></View>

        <View style={pdfStyles.sep} />
        <Text style={pdfStyles.bold}>TERMS & CONDITIONS</Text>
        <Text>Goods once Sold, NO REFUND</Text>
        
        {/* UPI QR Code Section */}
        {upiQrCodeUrl && (
          <View style={{ marginTop: 10, marginBottom: 10, alignItems: "center" }}>
            <View style={pdfStyles.sep} />
            <Text style={[pdfStyles.bold, { marginTop: 6, marginBottom: 6, fontSize: paperSize === '58mm' ? 6 : 8, textAlign: "center" }]}>Scan to Pay via UPI</Text>
            <View style={{ flexDirection: "row", justifyContent: "center", width: "100%" }}>
              <Image src={upiQrCodeUrl} style={{ width: paperSize === '58mm' ? 60 : 80, height: paperSize === '58mm' ? 60 : 80 }} />
            </View>
            <Text style={[pdfStyles.tiny, { marginTop: 4, textAlign: "center" }]}>UPI: {billProfile.upiId}</Text>
            <Text style={[pdfStyles.bold, { marginTop: 4, fontSize: paperSize === '58mm' ? 6 : 8, textAlign: "center" }]}>Amount: ₹{formatMoney(bill.grandTotal)}</Text>
          </View>
        )}
        
        <View style={pdfStyles.sep} />
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.bold}>** THANKS FOR SHOPPING **</Text>
          <Text style={pdfStyles.bold}>** VISIT AGAIN **</Text>
        </View>
      </Page>
    </Document>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => getUser() || getAdmin(), []);

  const getInitialCart = () => {
    if (location.state?.cart && location.state.cart.length > 0) {
      return location.state.cart;
    }
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  };

  const [cart, setCart] = useState(getInitialCart());
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Tax configuration
  const [taxRate, setTaxRate] = useState(0.10);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isTaxEditable, setIsTaxEditable] = useState(false);
  const [customTaxRate, setCustomTaxRate] = useState(null);

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfPreparing, setIsPdfPreparing] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  
  // Editable price state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editMrpValue, setEditMrpValue] = useState("");
  const [editNetPriceValue, setEditNetPriceValue] = useState("");
  
  const [currentOrder, setCurrentOrder] = useState(null);
  const pdfCacheRef = useRef({ orderId: null, url: null });
  
  const [paperSize, setPaperSize] = useState('80mm');
  const [backgroundPattern, setBackgroundPattern] = useState('none');
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);

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
            setTaxRate(resp.data.tax_rate !== undefined ? resp.data.tax_rate / 100 : 0.10);
            setGstEnabled(resp.data.gst_enabled !== undefined ? resp.data.gst_enabled : true);
            if (resp.data.paper_size) {
              setPaperSize(resp.data.paper_size);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load tax configuration", error);
      }
    };

    fetchTaxConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart && cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else if (cart && cart.length === 0) {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const getUnitMrp = useCallback((item) => {
    const value = Number(item?.price);
    return Number.isFinite(value) ? value : 0;
  }, []);

  const getUnitNet = useCallback(
    (item) => {
      const rawNet = item?.netPrice;
      if (rawNet === "" || rawNet === null || rawNet === undefined) {
        return getUnitMrp(item);
      }
      const value = Number(rawNet);
      return Number.isFinite(value) ? value : getUnitMrp(item);
    },
    [getUnitMrp],
  );

  const getUnitDiscount = useCallback(
    (item) => Math.max(getUnitMrp(item) - getUnitNet(item), 0),
    [getUnitMrp, getUnitNet],
  );

  const getLineNetTotal = useCallback(
    (item) => getUnitNet(item) * item.quantity,
    [getUnitNet],
  );

  // Calculate totals
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + getLineNetTotal(item), 0),
    [cart, getLineNetTotal],
  );
  
  // Calculate total MRP (Gross Total)
  const cartMrpTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (getUnitMrp(item) * item.quantity), 0),
    [cart, getUnitMrp]
  );

  // Calculate total discount
  const cartTotalDiscount = useMemo(
    () => cart.reduce((sum, item) => sum + (getUnitDiscount(item) * item.quantity), 0),
    [cart, getUnitDiscount]
  );
  
  const taxAmount = useMemo(() => gstEnabled ? (
    customTaxRate !== null 
      ? cartTotal * (customTaxRate / 100)
      : cart.reduce((sum, item) => {
          const itemTotal = getLineNetTotal(item);
          const itemTaxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate / 100 : taxRate;
          return sum + (itemTotal * itemTaxRate);
        }, 0)
  ) : 0, [cart, customTaxRate, gstEnabled, taxRate, getLineNetTotal]);
  
  const finalTotal = useMemo(() => cartTotal + taxAmount, [cartTotal, taxAmount]);
  
  const effectiveTaxRate = useMemo(() => customTaxRate !== null 
    ? customTaxRate / 100
    : (taxAmount / cartTotal) || taxRate, [customTaxRate, taxAmount, cartTotal, taxRate]);

  const clearPdfCache = useCallback(() => {
    if (pdfCacheRef.current.url) {
      URL.revokeObjectURL(pdfCacheRef.current.url);
    }
    pdfCacheRef.current = { orderId: null, url: null };
  }, []);

  useEffect(() => {
    return () => clearPdfCache();
  }, [clearPdfCache]);

  // Cart operations
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

  // Edit price functions
  const startEditingPrice = useCallback((item) => {
    setEditingPriceId(item.id);
    setEditMrpValue(getUnitMrp(item).toString());
    setEditNetPriceValue(getUnitNet(item).toString());
  }, [getUnitMrp, getUnitNet]);

  const savePriceEdit = useCallback(() => {
    if (editingPriceId === null) return;
    
    const newMrp = Math.max(0, parseFloat(editMrpValue) || 0);
    const newNetPrice = Math.min(Math.max(0, parseFloat(editNetPriceValue) || 0), newMrp);
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === editingPriceId) {
          return { ...item, price: newMrp, netPrice: newNetPrice };
        }
        return item;
      })
    );
    
    setEditingPriceId(null);
    setEditMrpValue("");
    setEditNetPriceValue("");
    toast.success("Price updated!");
  }, [editingPriceId, editMrpValue, editNetPriceValue]);

  const cancelPriceEdit = useCallback(() => {
    setEditingPriceId(null);
    setEditMrpValue("");
    setEditNetPriceValue("");
  }, []);

  // Generate Bill function - OPTIMIZED FOR 60MS TARGET
  const generateBill = useCallback(async () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      // Pre-build order data while checking user
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const userId = currentUser?.id;

      // Build order request once
      const orderRequest = {
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        totalAmount: finalTotal,
        taxAmount: taxAmount,
        paymentMethod: "N/A",
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          mrp: getUnitMrp(item),
          netPrice: getUnitNet(item),
        })),
      };

      let savedOrder = null;

      if (userId) {
        // Use Promise.race for timeout protection
        const apiPromise = api.post("/orders", orderRequest, {
          params: { userId: userId },
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        try {
          const response = await Promise.race([apiPromise, timeoutPromise]);
          savedOrder = response.data;
        } catch (orderErr) {
          console.error("Failed to save order to backend:", orderErr);
          toast.error("Failed to save order. Please try again.");
          return;
        }
      }

      // Build order data
      const orderData = {
        id: savedOrder?.id || Date.now(),
        date: new Date().toISOString(),
        customerName: customerName,
        customerPhone: customerPhone,
        paymentMethod: "N/A",
        items: cart,
        subtotal: cartTotal,
        taxAmount: taxAmount,
        total: finalTotal,
        status: "completed",
      };

      setCurrentOrder(orderData);
      setBillGenerated(true);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      toast.success(`Bill generated in ${duration}ms!`, { duration: 1500 });
      
      // Dispatch event for other components
      window.dispatchEvent(new Event("productsUpdated"));

    } catch (error) {
      console.error("Bill generation error:", error);
      toast.error("Failed to generate bill. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [customerName, cart, cartTotal, taxAmount, finalTotal, customerPhone, getUnitMrp, getUnitNet]);

  // PDF/Print bill generation
  const buildBillHtml = useCallback((orderData, autoPrint = false) => {
    const isThermal = paperSize === "58mm" || paperSize === "80mm";
    const is58 = paperSize === "58mm";
    const bill = computeBillSummary(orderData, { gstEnabled, effectiveTaxRate });
    const billProfile = getBillProfileMeta(profile);
    
    // Calculate page dimensions - use exact mm values for thermal printers
    const paperConfig = PAPER_SIZES[paperSize];
    const paperWidthMm = paperConfig?.mmWidth || 80;
    const billWidth = `${paperWidthMm}mm`;
    
    const invoiceDate = new Date(orderData.date).toLocaleString();
    const customerMobile = orderData?.customerPhone || orderData?.customerMobile || "-";
    const addressHtml = billProfile.addressLines.map((line) => `<div class="c">${escapeHtml(line)}</div>`).join("");
    const logoHtml = billProfile.logoUrl
      ? `<img class="logo" src="${escapeHtml(billProfile.logoUrl)}" alt="Shop Logo" />`
      : `<div class="logo-placeholder"></div>`;
    const rootClass = is58 ? "thermal thermal58" : (paperSize === "80mm" ? "thermal thermal80" : "sheet");

    return `<!DOCTYPE html>
<html>
<head>
  <title>Receipt #${orderData.id}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{width:${billWidth};max-width:${billWidth};overflow-x:hidden;overflow-y:visible}
    body{font-family:'Courier New',monospace;font-size:${is58 ? "10px" : "12px"};line-height:${is58 ? "1.2" : "1.3"};font-weight:${is58 ? "600" : "500"};color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
    .bill{width:${billWidth};max-width:${billWidth};margin:0 auto;background:#fff;padding:${isThermal ? "2mm" : "12px"};min-height:auto;page-break-inside:avoid;break-inside:avoid}
    .head-top{display:flex;justify-content:space-between;align-items:flex-start;gap:4px;margin-bottom:2px}
    .logo{width:${is58 ? "18mm" : "22mm"};height:${is58 ? "18mm" : "22mm"};object-fit:contain;object-position:left top}
    .logo-placeholder{width:${is58 ? "18mm" : "22mm"};height:${is58 ? "18mm" : "22mm"}}
    .top-right{flex:1;text-align:right;font-size:${is58 ? "9px" : "11px"};line-height:1.2}
    .shop-name{font-size:${is58 ? "14px" : "20px"};font-weight:800;letter-spacing:${is58 ? "0.5px" : "1px"};text-align:center}
    .bill-title{font-size:${is58 ? "13px" : "18px"};font-weight:800;text-align:center}
    .c{text-align:center}.r{text-align:right}.b{font-weight:700}
    .sep{border-top:1px dashed #000;margin:${is58 ? "3px" : "5px"} 0}
    .row{display:flex;justify-content:space-between;gap:4px;margin:2px 0}
    .items-head,.item{display:grid;grid-template-columns:42% 12% 15% 15% 16%;gap:2px;align-items:start}
    .items-head{font-weight:700;margin-bottom:2px;font-size:${is58 ? "9px" : "11px"}}
    .item{margin:1px 0;font-size:${is58 ? "9px" : "11px"}}
    .totals .row{font-size:${is58 ? "10px" : "13px"}}
    .terms{font-size:${is58 ? "8px" : "10px"}}
    .footer{font-size:${is58 ? "9px" : "11px"}}
    .thermal{width:${billWidth};max-width:${billWidth}}
    .sheet{width:${billWidth};max-width:${billWidth}}
    .qr-section{text-align:center;margin:8px 0}
    .qr-section img{display:block;margin:0 auto}
    @page{size:${paperSize === 'A4' ? '210mm 297mm' : paperSize === 'A5' ? '148mm 210mm' : paperSize === 'Letter' ? '8.5in 11in' : `${paperWidthMm}mm auto`};margin:0}
    @media print{
      @page{size:${paperSize === 'A4' ? '210mm 297mm' : paperSize === 'A5' ? '148mm 210mm' : paperSize === 'Letter' ? '8.5in 11in' : `${paperWidthMm}mm auto`};margin:0}
      html,body{width:${billWidth} !important;max-width:${billWidth} !important;height:auto !important;min-height:100%;margin:0 !important;padding:0 !important;background:#fff !important;overflow:visible !important}
      .bill{width:${billWidth} !important;max-width:${billWidth} !important;margin:0 !important;padding:${isThermal ? "2mm" : "8mm"} !important;box-shadow:none;page-break-inside:avoid;break-inside:avoid}
      .item{page-break-inside:avoid;break-inside:avoid}
      .totals{page-break-inside:avoid;break-inside:avoid}
      .qr-section{page-break-inside:avoid;break-inside:avoid}
      .footer{page-break-inside:avoid;break-inside:avoid}
    }
  </style>
</head>
<body${autoPrint ? ' onload="setTimeout(function(){window.print();setTimeout(function(){window.close();},100);},200);"' : ''}>
  <div class="bill ${rootClass}">
    <div class="head-top">
      ${logoHtml}
      <div class="top-right">
        ${billProfile.phone !== "-" ? `<div>Contact: ${escapeHtml(billProfile.phone)}</div>` : ""}
        ${billProfile.whatsapp ? `<div>WhatsApp: ${escapeHtml(billProfile.whatsapp)}</div>` : ""}
        ${billProfile.gstNumber !== "-" ? `<div>GST NO: ${escapeHtml(billProfile.gstNumber)}</div>` : ""}
      </div>
    </div>
    <div class="shop-name">${escapeHtml(billProfile.shopName)}</div>
    ${addressHtml}

    <div class="sep"></div>
    <div class="bill-title">BILL OF SUPPLY</div>
    <div class="sep"></div>

    <div class="row"><span>Invoice No.</span><span>${escapeHtml(orderData.id)}</span></div>
    <div class="row"><span>Invoice Date</span><span>${escapeHtml(invoiceDate)}</span></div>
    <div class="row"><span>Name</span><span>${escapeHtml(orderData.customerName || "-")}</span></div>
    <div class="row"><span>Mobile No.</span><span>${escapeHtml(customerMobile)}</span></div>

    <div class="sep"></div>
    <div class="items-head">
      <div>Item Particulars</div><div class="r">Qty</div><div class="r">MRP</div><div class="r">NetRate</div><div class="r">Amount</div>
    </div>
    ${bill.items.map((item) => `<div class="item"><div>${escapeHtml(item.name)}</div><div class="r">${formatMoney(item.qty)}</div><div class="r">${formatMoney(item.mrp)}</div><div class="r">${formatMoney(item.netRate)}</div><div class="r">${formatMoney(item.amount)}</div></div>`).join("")}

    <div class="sep"></div>
    <div class="totals">
      <div class="row"><span class="b">Gross Total (MRP):</span><span class="b">${formatMoney(bill.grossTotal)}</span></div>
      <div class="row"><span class="b">Discount Amount:</span><span class="b">${formatMoney(bill.discountTotal)}</span></div>
      <div class="row"><span class="b">NET TOTAL:</span><span class="b">${formatMoney(bill.netTotal)}</span></div>
      ${gstEnabled ? `<div class="row"><span class="b">GST:</span><span class="b">${formatMoney(bill.gstAmount)}</span></div>` : ""}
      <div class="row"><span class="b">FINAL TOTAL:</span><span class="b">${formatMoney(bill.grandTotal)}</span></div>
    </div>

    <div class="sep"></div>
    <div class="c b">${escapeHtml(bill.totalInWords)}</div>
    <div class="sep"></div>

    <div class="row"><span class="b">You Saved:</span><span class="b">Rs. ${formatMoney(bill.discountTotal)}</span></div>

    <div class="sep"></div>
    <div class="b terms">TERMS & CONDITIONS</div>
    <div class="terms">Goods once Sold, NO REFUND</div>
    ${billProfile.upiId && bill.grandTotal > 0 ? `
    <div class="sep"></div>
    <div class="c" style="margin:8px 0;">
      <div class="b" style="margin-bottom:4px;font-size:${is58 ? "9px" : "11px"};">Scan to Pay via UPI</div>
      <div style="display:flex;justify-content:center;margin-bottom:8px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=${is58 ? 80 : 120}x${is58 ? 80 : 120}&data=${encodeURIComponent(generateUpiLink(billProfile.upiId, bill.grandTotal, billProfile.shopName, orderData.id))}" alt="UPI QR Code" style="width:${is58 ? 80 : 120}px;height:${is58 ? 80 : 120}px;" />
      </div>
      <div style="font-size:${is58 ? "8px" : "10px"};color:#666;">UPI: ${escapeHtml(billProfile.upiId)}</div>
      <div style="font-size:${is58 ? "10px" : "12px"};font-weight:700;margin-top:4px;">Amount: ₹${formatMoney(bill.grandTotal)}</div>
    </div>
    ` : ""}
    <div class="sep"></div>
    <div class="c b footer">** THANKS FOR SHOPPING **</div>
    <div class="c b footer">** VISIT AGAIN **</div>
  </div>
</body>
</html>`;
  }, [paperSize, profile, gstEnabled, effectiveTaxRate]);

  // Ultra-fast print - opens print dialog immediately
  const printReceipt = useCallback(() => {
    if (!currentOrder) {
      toast.error("No order found to print");
      return;
    }
    try {
      const startTime = performance.now();
      const win = window.open("", "_blank", "width=820,height=700");
      if (!win) {
        toast.error("Popup blocked. Please allow popups for printing.");
        return;
      }
      win.document.write(buildBillHtml(currentOrder, true));
      win.document.close();
      const duration = Math.round(performance.now() - startTime);
      toast.success(`Print ready in ${duration}ms!`);
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Print failed: " + (error.message || "Unknown error"));
    }
  }, [currentOrder, buildBillHtml]);

  // Ultra-fast HTML download
  const downloadHTML = useCallback(() => {
    if (!currentOrder) {
      toast.error("No order found to download");
      return;
    }

    try {
      const startTime = performance.now();
      const htmlContent = buildBillHtml(currentOrder, false);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${currentOrder.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const duration = Math.round(performance.now() - startTime);
      toast.success(`Downloaded in ${duration}ms!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    }
  }, [currentOrder, buildBillHtml]);

  const buildReceiptPdfBlob = useCallback(
    async (orderData) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PDF generation timeout")), 5000),
      );
      const taxConfig = { taxRate, gstEnabled, effectiveTaxRate };
      const pdfPromise = pdf(
        <ReceiptPDF
          order={orderData}
          profile={profile}
          taxConfig={taxConfig}
          paperSize={paperSize}
        />,
      ).toBlob();
      return Promise.race([pdfPromise, timeoutPromise]);
    },
    [profile, taxRate, gstEnabled, effectiveTaxRate, paperSize],
  );

  const generatePDF = useCallback(async () => {
    if (!currentOrder) {
      toast.error("No order found to download");
      return;
    }

    try {
      if (
        pdfCacheRef.current.orderId === currentOrder.id &&
        pdfCacheRef.current.url
      ) {
        const link = document.createElement("a");
        link.href = pdfCacheRef.current.url;
        link.download = `receipt-${currentOrder.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("PDF downloaded!");
        return;
      }

      setIsPdfPreparing(true);
      toast.loading("Preparing PDF...", { duration: 2500 });
      const blob = await buildReceiptPdfBlob(currentOrder);
      clearPdfCache();
      const url = URL.createObjectURL(blob);
      pdfCacheRef.current = { orderId: currentOrder.id, url };

      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${currentOrder.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF fallback: downloading HTML");
      setTimeout(() => downloadHTML(), 250);
    } finally {
      setIsPdfPreparing(false);
    }
  }, [currentOrder, buildReceiptPdfBlob, clearPdfCache, downloadHTML]);

  useEffect(() => {
    if (!(billGenerated && currentOrder)) return;
    if (
      pdfCacheRef.current.orderId === currentOrder.id &&
      pdfCacheRef.current.url
    ) {
      return;
    }

    let cancelled = false;
    const preGenerate = async () => {
      try {
        setIsPdfPreparing(true);
        const blob = await buildReceiptPdfBlob(currentOrder);
        if (cancelled) return;
        clearPdfCache();
        const url = URL.createObjectURL(blob);
        pdfCacheRef.current = { orderId: currentOrder.id, url };
      } catch (err) {
        console.error("Background PDF pre-generation failed", err);
      } finally {
        if (!cancelled) setIsPdfPreparing(false);
      }
    };

    preGenerate();
    return () => {
      cancelled = true;
    };
  }, [billGenerated, currentOrder, buildReceiptPdfBlob, clearPdfCache]);

  // Render Bill Generated View (Full Page Bill Preview)
  if (billGenerated && currentOrder) {
    const isThermal = paperSize === "58mm" || paperSize === "80mm";
    const is58 = paperSize === "58mm";
    const bill = computeBillSummary(currentOrder, { gstEnabled, effectiveTaxRate });
    const billProfile = getBillProfileMeta(profile);
    const invoiceDate = new Date(currentOrder.date).toLocaleString();
    const customerMobile = currentOrder?.customerPhone || currentOrder?.customerMobile || "-";
    const billWidth = paperSize === "58mm" ? "58mm" : paperSize === "80mm" ? "80mm" : paperSize === "A5" ? "148mm" : paperSize === "Letter" ? "216mm" : "210mm";

    return (
      <>
        <Navbar />
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gray-100 py-6">
          <div className="container mx-auto px-4">
            {/* Action Buttons */}
            <div className="max-w-4xl mx-auto mb-4 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setBillGenerated(false);
                    setCurrentOrder(null);
                    clearCart();
                    setCustomerName("Walk-in Customer");
                    setCustomerPhone("");
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  New Sale
                </button>
                <button
                  onClick={() => navigate("/shop")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setBillGenerated(false);
                    setCurrentOrder(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Bill
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={generatePDF}
                  disabled={isPdfPreparing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isPdfPreparing ? "Preparing..." : "Download PDF"}
                </button>
                <button
                  onClick={printReceipt}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
              </div>
            </div>

            {/* Success Message */}
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-semibold text-lg">✓ Bill Generated Successfully!</p>
                <p className="text-green-600 text-sm mt-1">You can print/download the bill or continue with other operations.</p>
              </div>
            </div>

            {/* Full Page Bill Preview */}
            <div className="max-w-4xl mx-auto">
              <div 
                className="bg-white shadow-2xl mx-auto overflow-auto"
                style={{ 
                  width: billWidth, 
                  minHeight: "80vh",
                  fontFamily: "'Courier New', monospace",
                  fontSize: is58 ? "10px" : "12px",
                  lineHeight: is58 ? "1.2" : "1.3",
                  padding: isThermal ? "8px" : "20px",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ width: is58 ? "60px" : "90px", height: is58 ? "60px" : "90px" }}>
                    {billProfile.logoUrl && (
                      <img 
                        src={billProfile.logoUrl} 
                        alt="Shop Logo" 
                        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left top" }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, textAlign: "right", fontSize: is58 ? "9px" : "11px" }}>
                    {billProfile.phone !== "-" && <div>Contact: {billProfile.phone}</div>}
                    {billProfile.whatsapp && <div>WhatsApp: {billProfile.whatsapp}</div>}
                    {billProfile.gstNumber !== "-" && <div>GST NO: {billProfile.gstNumber}</div>}
                  </div>
                </div>

                {/* Shop Name */}
                <div style={{ fontSize: is58 ? "16px" : "24px", fontWeight: 800, textAlign: "center", letterSpacing: "1px" }}>
                  {billProfile.shopName}
                </div>
                {billProfile.addressLines.map((line, idx) => (
                  <div key={idx} style={{ textAlign: "center", fontSize: is58 ? "9px" : "11px" }}>{line}</div>
                ))}

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Bill Title */}
                <div style={{ fontSize: is58 ? "15px" : "21px", fontWeight: 800, textAlign: "center" }}>
                  BILL OF SUPPLY
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Invoice Details */}
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span>Invoice No.</span>
                  <span>{currentOrder.id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span>Invoice Date</span>
                  <span>{invoiceDate}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span>Name</span>
                  <span>{currentOrder.customerName || "-"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span>Mobile No.</span>
                  <span>{customerMobile}</span>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Items Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "42% 12% 15% 15% 16%", gap: "4px", fontWeight: 700, marginBottom: "4px", fontSize: is58 ? "9px" : "12px" }}>
                  <div>Item Particulars</div>
                  <div style={{ textAlign: "right" }}>Qty</div>
                  <div style={{ textAlign: "right" }}>MRP</div>
                  <div style={{ textAlign: "right" }}>NetRate</div>
                  <div style={{ textAlign: "right" }}>Amount</div>
                </div>

                {/* Items */}
                {bill.items.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "42% 12% 15% 15% 16%", gap: "4px", margin: "4px 0", fontSize: is58 ? "9px" : "12px" }}>
                    <div>{item.name}</div>
                    <div style={{ textAlign: "right" }}>{formatMoney(item.qty)}</div>
                    <div style={{ textAlign: "right" }}>{formatMoney(item.mrp)}</div>
                    <div style={{ textAlign: "right" }}>{formatMoney(item.netRate)}</div>
                    <div style={{ textAlign: "right" }}>{formatMoney(item.amount)}</div>
                  </div>
                ))}

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Totals */}
                <div style={{ fontSize: is58 ? "12px" : "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontWeight: 700 }}>
                    <span>Gross Total (MRP):</span>
                    <span>{formatMoney(bill.grossTotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontWeight: 700, color: "green" }}>
                    <span>Discount Amount:</span>
                    <span>{formatMoney(bill.discountTotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontWeight: 700 }}>
                    <span>NET TOTAL:</span>
                    <span>{formatMoney(bill.netTotal)}</span>
                  </div>
                  {gstEnabled && (
                    <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontWeight: 700 }}>
                      <span>GST:</span>
                      <span>{formatMoney(bill.gstAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontWeight: 700, fontSize: is58 ? "14px" : "18px" }}>
                    <span>FINAL TOTAL:</span>
                    <span>{formatMoney(bill.grandTotal)}</span>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Amount in Words */}
                <div style={{ textAlign: "center", fontWeight: 700, marginBottom: "8px" }}>
                  {bill.totalInWords}
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* You Saved */}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "green" }}>
                  <span>You Saved:</span>
                  <span>Rs. {formatMoney(bill.discountTotal)}</span>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Payment Info */}
                <div style={{ marginBottom: "8px" }}>
                  <div><strong>Payment Method:</strong> {currentOrder.paymentMethod?.toUpperCase() || 'N/A'}</div>
                </div>

                {/* QR Code for UPI Payment - Using external QR code service */}
                {billProfile.upiId && bill.grandTotal > 0 && (
                  <>
                    <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
                    <div style={{ textAlign: "center", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: is58 ? "9px" : "11px" }}>
                        Scan to Pay via UPI
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=${is58 ? 80 : 120}x${is58 ? 80 : 120}&data=${encodeURIComponent(generateUpiLink(billProfile.upiId, bill.grandTotal, billProfile.shopName, currentOrder.id))}`}
                          alt="UPI QR Code"
                          style={{ width: is58 ? 80 : 120, height: is58 ? 80 : 120 }}
                        />
                      </div>
                      <div style={{ fontSize: is58 ? "8px" : "10px", color: "#666" }}>
                        UPI: {billProfile.upiId}
                      </div>
                      <div style={{ fontSize: is58 ? "10px" : "12px", fontWeight: 700, marginTop: "4px" }}>
                        Amount: ₹{formatMoney(bill.grandTotal)}
                      </div>
                    </div>
                  </>
                )}

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Terms */}
                <div style={{ fontWeight: 700, fontSize: is58 ? "9px" : "11px" }}>TERMS & CONDITIONS</div>
                <div style={{ fontSize: is58 ? "9px" : "11px" }}>Goods once Sold, NO REFUND</div>

                <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

                {/* Footer */}
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: is58 ? "10px" : "12px" }}>
                  <div>** THANKS FOR SHOPPING **</div>
                  <div>** VISIT AGAIN **</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render Cart View (with Payment Details integrated)
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="card p-4 fade-up">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Editable Price Section */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Price Details (Editable)</span>
                          {editingPriceId !== item.id && (
                            <button
                              onClick={() => startEditingPrice(item)}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit Price
                            </button>
                          )}
                        </div>
                        
                        {editingPriceId === item.id ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">MRP (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editMrpValue}
                                onChange={(e) => setEditMrpValue(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Net Price (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editNetPriceValue}
                                onChange={(e) => setEditNetPriceValue(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="col-span-2 flex gap-2">
                              <button
                                onClick={savePriceEdit}
                                className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelPriceEdit}
                                className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">MRP:</span>
                              <span className="font-semibold ml-1">₹{getUnitMrp(item).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Net:</span>
                              <span className="font-semibold ml-1 text-green-600">₹{getUnitNet(item).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Disc:</span>
                              <span className="font-semibold ml-1 text-red-600">₹{getUnitDiscount(item).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
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
                            ₹{getLineNetTotal(item).toFixed(2)}
                          </p>
                          {getUnitDiscount(item) > 0 && (
                            <p className="text-xs text-gray-500 line-through">
                              MRP: ₹{(getUnitMrp(item) * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary & Payment Details */}
              <div className="lg:col-span-1">
                <div className="card-lg sticky top-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Order Summary
                  </h3>

                  {/* Customer Details */}
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
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Phone
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Tax Info */}
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
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-4 pb-4 border-b">
                    <div className="flex justify-between text-gray-600">
                      <span>Total MRP (Gross):</span>
                      <span className="font-semibold">₹{cartMrpTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Total Discount:</span>
                      <span className="font-semibold">-₹{cartTotalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Net Subtotal ({cart.length} items):</span>
                      <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    
                    {gstEnabled && (
                      <div className="flex justify-between text-gray-600">
                        <span>Tax/GST ({(effectiveTaxRate * 100).toFixed(1)}%):</span>
                        <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t">
                      <span>Final Total:</span>
                      <span className="text-blue-600">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Paper Size Selection */}
                  <div className="mb-4 pb-4 border-b">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size:</label>
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

                  {/* Background Pattern Selection */}
                  <div className="mb-4 pb-4 border-b">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setShowBackgroundSettings(!showBackgroundSettings)}
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Background Paper
                      </label>
                      <Settings className={`w-4 h-4 text-gray-500 transition-transform ${showBackgroundSettings ? 'rotate-90' : ''}`} />
                    </div>
                    {showBackgroundSettings && (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(BACKGROUND_PATTERNS).map(([key, pattern]) => (
                            <button
                              key={key}
                              onClick={() => setBackgroundPattern(key)}
                              className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                                backgroundPattern === key
                                  ? "border-purple-500 bg-purple-50 text-purple-700 font-bold"
                                  : "border-gray-300 hover:border-purple-300"
                              }`}
                            >
                              {pattern.name}
                            </button>
                          ))}
                        </div>
                        {backgroundPattern !== 'none' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Background will be applied to printed bill
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Generate Bill Button */}
                  <button
                    onClick={generateBill}
                    disabled={isProcessing}
                    className="btn-primary w-full text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Generate Bill
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;