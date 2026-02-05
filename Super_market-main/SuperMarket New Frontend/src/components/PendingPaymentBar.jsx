import React, { useEffect, useState } from "react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { X, RefreshCcw } from "lucide-react";
import { trackEvent } from "../utils/analytics";

export default function PendingPaymentBar() {
  const [pending, setPending] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pendingPayment");
      if (raw) setPending(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to read pending payment from storage", err);
    }

    const storageHandler = (e) => {
      if (e.key === "pendingPayment") {
        try {
          setPending(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setPending(null);
        }
      }
    };
    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
  }, []);

  if (!pending) return null;

  const formatAmount = (amt, currency = "INR") => {
    if (amt == null) return "";
    const n = Number(amt);
    if (isNaN(n)) return amt;
    // assume paise/cents if large number
    if (n > 1000) return `${currency} ${(n / 100).toFixed(2)}`;
    return `${currency} ${n}`;
  };

  const clearPending = () => {
    localStorage.removeItem("pendingPayment");
    setPending(null);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "pendingPayment", newValue: null }),
    );
  };

  const handleCancel = async () => {
    try {
      await api.post("/subscription/cancel-order", {
        orderId: pending.orderId,
      });
      toast.success("Payment cancelled successfully.");
    } catch (err) {
      console.error("Cancel failed (backend may not implement):", err);
      toast.error(
        "Cancelled locally. If payment already processed, contact support.",
      );
    } finally {
      await trackEvent("payment_cancelled", {
        orderId: pending.orderId,
        planId: pending.planId,
      });
      clearPending();
    }
  };

  const handleResume = async () => {
    try {
      const opts = {
        key: pending.keyId,
        amount: pending.amount,
        currency: pending.currency || "INR",
        order_id: pending.orderId,
        name: pending.name || "TSAR IT SMMS",
        description:
          pending.description || pending.planName || "Subscription payment",
        handler: async function (response) {
          try {
            await api.post("/payment/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: pending.planId,
              amount: pending.amount,
            });
            toast.success(
              "Payment successful! Your subscription has been activated.",
            );
            clearPending();
            await trackEvent("subscription_success", {
              planId: pending.planId,
              orderId: pending.orderId,
            });
          } catch (err) {
            console.error("Verification failed on resume:", err);
            toast.error(
              "Payment verification failed after resume. Please contact support.",
            );
            clearPending();
          }
        },
        prefill: pending.prefill || {},
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(opts);
      rzp.open();
      await trackEvent("payment_resumed", {
        orderId: pending.orderId,
        planId: pending.planId,
      });
    } catch (err) {
      console.error("Resume failed:", err);
      toast.error("Unable to resume payment. Please try again.");
    }
  };

  return (
    <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-yellow-800 font-medium">Pending payment</div>
          <div className="text-sm text-yellow-700">
            Order <span className="font-semibold">{pending.orderId}</span> •{" "}
            {formatAmount(pending.amount, pending.currency)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResume}
            className="px-3 py-1 rounded bg-yellow-600 text-white text-sm flex items-center gap-2"
          >
            <RefreshCcw size={14} /> Resume
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 rounded bg-white border text-sm"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
