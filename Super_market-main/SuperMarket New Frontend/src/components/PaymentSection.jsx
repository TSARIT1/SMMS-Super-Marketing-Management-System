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
  CreditCard,
  Smartphone,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

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
          // In a real app, you'd collect this from the user
          name: "Customer",
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

      // Simulate API call to payment gateway
      const _response = await axios.post(
        "https://jsonplaceholder.typicode.com/posts",
        paymentData,
      );

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 85% success rate simulation
      const isSuccess = Math.random() > 0.15;

      if (isSuccess) {
        setPaymentStatus("success");
        onPaymentSuccess();
      } else {
        setPaymentStatus("failed");
      }
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
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-gray-600 mb-1"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-3 pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer name input (optional) */}
              {typeof setCustomerName === "function" && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    value={customerName || ""}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="input w-full"
                  />
                </div>
              )}

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
              {isProcessing ? "Processing..." : `Pay ₹${finalTotal.toFixed(2)}`}
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
            Payment Method: {paymentMethod}
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

export default PaymentSection;
