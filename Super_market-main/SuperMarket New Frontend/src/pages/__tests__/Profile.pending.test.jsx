import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../Profile";

import { vi } from "vitest";

vi.mock("../../utils/api", () => ({ get: vi.fn(), post: vi.fn() }));

describe("Profile pending payment integration", () => {
  afterEach(() => {
    localStorage.removeItem("pendingPayment");
    vi.clearAllMocks();
  });

  test("shows pending payment status and resume opens Razorpay", async () => {
    const pending = {
      planId: "p1",
      orderId: "order_abc",
      amount: 5000,
      currency: "INR",
      keyId: "testkey",
      prefill: { name: "Admin" },
      planName: "Pro",
    };
    localStorage.setItem("pendingPayment", JSON.stringify(pending));

    const openObj = { open: vi.fn() };
    const RzpMock = vi.fn(() => openObj);
    window.Razorpay = RzpMock;

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/Pending payment/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText(/Resume/i));
    await waitFor(() => expect(RzpMock).toHaveBeenCalled());
  });
});
