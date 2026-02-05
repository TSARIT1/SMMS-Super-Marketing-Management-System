import React, { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { trackEvent } from "../utils/analytics";

export default function PendingPaymentStatus() {
  const [pending, setPending] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pendingPayment");
      setPending(raw ? JSON.parse(raw) : null);
    } catch {
      setPending(null);
    }

    const handler = (e) => {
      if (e.key === "pendingPayment")
        setPending(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!pending)
    return (
      <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-600">
        No pending payments.
      </div>
    );

  const formatAmt = (a) => {
    const n = Number(a);
    if (isNaN(n)) return a;
    if (n > 1000) return `₹${(n / 100).toFixed(2)}`;
    return `₹${n}`;
  };

  const handleResume = async () => {
    try {
      const opts = {
        key: pending.keyId,
        amount: pending.amount,
        currency: pending.currency || "INR",
        order_id: pending.orderId,
        name: pending.name || "TSAR IT SMMS",
        description: pending.description || pending.planName || "Subscription",
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
      toast.error("Unable to resume payment.");
    }
  };

  const handleCancel = async () => {
    try {
      await api.post("/subscription/cancel-order", {
        orderId: pending.orderId,
      });
      toast.success("Payment cancelled.");
    } catch (err) {
      console.error("Cancel failed:", err);
      toast.error("Cancelled locally.");
    } finally {
      localStorage.removeItem("pendingPayment");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "pendingPayment", newValue: null }),
      );
      await trackEvent("payment_cancelled", { orderId: pending.orderId });
    }
  };

  return (
    <div className="p-3 bg-yellow-50 rounded border border-yellow-100 text-sm text-yellow-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm">
            Pending payment:{" "}
            <span className="font-medium">{pending.orderId}</span>
          </div>
          <div className="text-xs text-yellow-700">
            Amount: {formatAmt(pending.amount)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResume}
            className="px-3 py-1 rounded bg-yellow-600 text-white text-sm"
          >
            Resume
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 rounded border text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
