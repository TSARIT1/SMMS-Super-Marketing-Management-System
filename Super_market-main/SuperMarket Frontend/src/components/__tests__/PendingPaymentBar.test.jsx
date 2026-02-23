import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PendingPaymentBar from "../PendingPaymentBar";
import api from "../../utils/api";
import { vi } from "vitest";

vi.mock("../../utils/api", () => ({ post: vi.fn() }));

const example = {
  planId: "p1",
  orderId: "order_123",
  amount: 5000,
  currency: "INR",
  keyId: "testkey",
  name: "SuperMarket SaaS",
  description: "Subscription payment",
  prefill: { name: "Test Admin", email: "admin@test.com" },
  planName: "Pro",
};

describe("PendingPaymentBar", () => {
  afterEach(() => {
    localStorage.removeItem("pendingPayment");
    vi.clearAllMocks();
  });

  test("renders and resume opens Razorpay", async () => {
    localStorage.setItem("pendingPayment", JSON.stringify(example));

    const openObj = { open: vi.fn() };
    const RzpMock = vi.fn(() => openObj);
    window.Razorpay = RzpMock;

    render(<PendingPaymentBar />);

    expect(screen.getByText(/Pending payment/i)).toBeInTheDocument();
    expect(screen.getByText(/order_123/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Resume/i));

    await waitFor(() => expect(RzpMock).toHaveBeenCalled());
  });

  test("cancel calls API and clears storage", async () => {
    localStorage.setItem("pendingPayment", JSON.stringify(example));

    api.post.mockResolvedValue({ data: {} });

    render(<PendingPaymentBar />);
    fireEvent.click(screen.getByText(/Cancel/i));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/subscription/cancel-order", {
        orderId: "order_123",
      }),
    );
    expect(localStorage.getItem("pendingPayment")).toBeNull();
  });
});
