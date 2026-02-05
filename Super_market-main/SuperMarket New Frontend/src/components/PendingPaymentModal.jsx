import React, { useEffect, useState } from "react";
import { X, RefreshCcw } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { trackEvent } from "../utils/analytics";

export default function PendingPaymentModal({ open, onClose }) {
  const [pending, setPending] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pendingPayment");
      if (raw) setPending(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to parse pending payment", err);
    }

    const handler = (e) => {
      if (e.key === "pendingPayment") {
        try {
          setPending(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setPending(null);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [open]);

  if (!pending || !open) return null;

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
        prefill: pending.prefill || {},
        theme: { color: "#3B82F6" },
      };
      const rzp = new window.Razorpay(opts);
      rzp.open();
      await trackEvent("payment_resumed", {
        orderId: pending.orderId,
        planId: pending.planId,
      });
      onClose();
    } catch (err) {
      console.error("Resume failed:", err);
      toast.error("Unable to resume payment. Please try again.");
    }
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
      localStorage.removeItem("pendingPayment");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "pendingPayment", newValue: null }),
      );
      await trackEvent("payment_cancelled", {
        orderId: pending.orderId,
        planId: pending.planId,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/30"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pending Payment</h3>
            <p className="text-sm text-gray-600 mt-1">
              Order <span className="font-medium">{pending.orderId}</span>
            </p>
          </div>
          <div className="ml-4">
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-700">
            Plan: <span className="font-medium">{pending.planName}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1">
            Amount: <span className="font-medium">{pending.amount}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 justify-end">
          <button
            onClick={handleResume}
            className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"
          >
            <RefreshCcw size={14} /> Resume
          </button>
          <button onClick={handleCancel} className="px-4 py-2 border rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
