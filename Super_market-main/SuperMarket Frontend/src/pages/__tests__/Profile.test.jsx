import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../Profile";
import api from "../../utils/api";
import { vi } from "vitest";

vi.mock("../../utils/api", () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

describe("Profile subscription UI", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("shows countdown when subscription active", async () => {
    const oneHourFromNow = new Date(Date.now() + 3600 * 1000).toISOString();
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();

    api.get.mockImplementation((url) => {
      if (url === "/subscription")
        return Promise.resolve({
          data: {
            planName: "Pro",
            endDate: oneHourFromNow,
            startDate: oneHourAgo,
            status: "ACTIVE",
            maxProducts: -1,
            maxUsers: -1,
            description: "Pro plan",
          },
        });
      if (url === "/subscription-plans/active")
        return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/Time left:/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/used/i)).toBeInTheDocument();
  });

  test("opens plans modal and subscribe calls api.post", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/subscription") return Promise.resolve({ data: null });
      if (url === "/subscription-plans/active")
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: "Basic",
              planType: "MONTHLY",
              price: 100,
              description: "Basic plan",
            },
          ],
        });
      return Promise.resolve({ data: {} });
    });

    api.post.mockResolvedValue({
      data: {
        order: {
          keyId: "test",
          amount: 100,
          currency: "INR",
          orderId: "order_1",
        },
        plan: { name: "Basic" },
      },
    });
    // mock Razorpay so the code does not throw
    window.Razorpay = vi.fn(() => ({ open: vi.fn() }));

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/Enroll Now|View Plans/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText(/Enroll Now|View Plans/i));

    await waitFor(() =>
      expect(screen.getByText(/Available Plans/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/Basic plan/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Subscribe/i));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining("/subscription/subscribe/1"),
      ),
    );
  });

  test("save calls api.put and closes modal", async () => {
    const prof = {
      email: "owner@example.com",
      shop_name: "X",
      phone_number: "+911234567890",
      accepted_payment_methods: [],
      product_categories: [],
    };

    api.get.mockImplementation((url) => {
      if (url === "/subscription") return Promise.resolve({ data: null });
      if (url === "/subscription-plans/active")
        return Promise.resolve({ data: [] });
      if (url === "/profile") return Promise.resolve({ data: prof });
      return Promise.resolve({ data: {} });
    });

    api.put.mockResolvedValue({ data: prof });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    // Wait for profile fetch to populate (shop name present)
    await waitFor(() => expect(screen.getByText("X")).toBeInTheDocument());

    // Open edit modal
    fireEvent.click(screen.getByText(/Edit/i));

    await waitFor(() =>
      expect(screen.getByText(/Edit Store Profile/i)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => expect(api.put).toHaveBeenCalled());
    // modal should be closed
    await waitFor(() =>
      expect(screen.queryByText(/Edit Store Profile/i)).not.toBeInTheDocument(),
    );
  });

  test("validation prevents save on bad phone", async () => {
    const prof = {
      email: "owner@example.com",
      shop_name: "X",
      phone_number: "+911234",
      accepted_payment_methods: [],
      product_categories: [],
    };

    api.get.mockImplementation((url) => {
      if (url === "/subscription") return Promise.resolve({ data: null });
      if (url === "/subscription-plans/active")
        return Promise.resolve({ data: [] });
      if (url === "/profile") return Promise.resolve({ data: prof });
      return Promise.resolve({ data: {} });
    });

    api.put.mockResolvedValue({ data: prof });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    // Open edit modal
    fireEvent.click(await screen.findByText(/Edit/i));
    await waitFor(() =>
      expect(screen.getByText(/Edit Store Profile/i)).toBeInTheDocument(),
    );

    // Click save - should show validation error and not call api.put
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => expect(api.put).not.toHaveBeenCalled());
    expect(screen.getByText(/Enter a valid phone number/i)).toBeInTheDocument();
  });
});
