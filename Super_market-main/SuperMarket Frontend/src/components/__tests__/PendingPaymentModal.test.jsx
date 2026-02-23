import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PendingPaymentModal from "../PendingPaymentModal";
import api from "../../utils/api";
import { vi } from "vitest";

vi.mock("../../utils/api", () => ({ post: vi.fn() }));

describe("PendingPaymentModal", () => {
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

  afterEach(() => {
    localStorage.removeItem("pendingPayment");
    vi.clearAllMocks();
  });

  test("renders details when pending exists and cancel calls API", async () => {
    localStorage.setItem("pendingPayment", JSON.stringify(example));
    const onClose = vi.fn();
    render(<PendingPaymentModal open={true} onClose={onClose} />);
    expect(screen.getByText(/Pending Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/order_123/i)).toBeInTheDocument();

    api.post.mockResolvedValue({ data: {} });
    fireEvent.click(screen.getByText(/Cancel/i));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/subscription/cancel-order", {
        orderId: "order_123",
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
