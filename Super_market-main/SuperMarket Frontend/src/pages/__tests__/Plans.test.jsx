import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Plans from "../Plans";
import api from "../../utils/api";
import { vi } from "vitest";

vi.mock("../../utils/api", () => ({ get: vi.fn(), post: vi.fn() }));

test("fetches and renders plans and calls subscribe API", async () => {
  api.get.mockResolvedValue({
    data: [{ id: 1, name: "Basic", price: 0, description: "Free plan" }],
  });
  api.post.mockResolvedValue({ data: { order: null, plan: { price: 0 } } });

  // Set admin in localStorage to test prefill usage
  localStorage.setItem(
    "admin",
    JSON.stringify({ fullName: "Test Admin", email: "admin@test.com" }),
  );

  // mock Razorpay constructor to capture options
  const opened = { open: vi.fn() };
  const RazorpayMock = vi.fn((opts) => {
    RazorpayMock.lastOpts = opts;
    return opened;
  });
  window.Razorpay = RazorpayMock;

  render(
    <MemoryRouter>
      <Plans />
    </MemoryRouter>,
  );

  await waitFor(() =>
    expect(screen.getByText(/Simple plans that scale/i)).toBeInTheDocument(),
  );
  expect(screen.getByText(/Basic/i)).toBeInTheDocument();

  // Choose plan - since plan is free, it will call api.post and not open Razorpay, then we simulate a paid plan
  fireEvent.click(screen.getByText(/Choose/i));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining("/subscription/subscribe/1"),
    ),
  );

  // Now simulate a paid plan order response and verify Razorpay is initialized with prefill
  api.post.mockResolvedValueOnce({
    data: {
      order: { id: "order_1", keyId: "testkey", amount: 5000, currency: "INR" },
      plan: { price: 50, name: "Paid Basic" },
    },
  });
  // Re-render with paid plan
  api.get.mockResolvedValue({
    data: [{ id: 2, name: "Paid", price: 50, description: "Paid plan" }],
  });
  render(
    <MemoryRouter>
      <Plans />
    </MemoryRouter>,
  );

  await waitFor(() => expect(screen.getByText(/Paid/i)).toBeInTheDocument());
  fireEvent.click(screen.getAllByText(/Choose/i)[0]);

  await waitFor(() => expect(RazorpayMock).toHaveBeenCalled());
  expect(RazorpayMock.lastOpts.prefill.name).toBe("Test Admin");
  expect(RazorpayMock.lastOpts.prefill.email).toBe("admin@test.com");
});
