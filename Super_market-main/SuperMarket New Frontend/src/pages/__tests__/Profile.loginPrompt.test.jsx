import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../Profile";
import api from "../../utils/api";
import { vi } from "vitest";

vi.mock("../../utils/api", () => ({ get: vi.fn(), post: vi.fn() }));

test("shows login prompt when subscription subscribe returns 401", async () => {
  // Mock available plans
  api.get.mockImplementation((url) => {
    if (url === "/subscription") return Promise.resolve({ data: null });
    if (url === "/subscription-plans/active")
      return Promise.resolve({
        data: [
          {
            id: 1,
            name: "Basic",
            planType: "MONTHLY",
            price: 0,
            description: "Basic plan",
          },
        ],
      });
    return Promise.resolve({ data: {} });
  });

  const error = new Error("Unauthorized");
  error.response = {
    status: 401,
    data: { message: "Authentication required" },
  };
  api.post.mockRejectedValueOnce(error);

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );

  await waitFor(() =>
    expect(screen.getByText(/Available Plans/i)).toBeInTheDocument(),
  );
  fireEvent.click(screen.getByText(/Subscribe/i));

  await waitFor(() =>
    expect(screen.getByText(/Login required/i)).toBeInTheDocument(),
  );
});
