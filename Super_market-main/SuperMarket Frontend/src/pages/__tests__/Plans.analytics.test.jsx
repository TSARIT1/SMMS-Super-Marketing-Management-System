import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Plans from "../Plans";
import api from "../../utils/api";
import * as analytics from "../../utils/analytics";
import { vi } from "vitest";

vi.mock("../../utils/api", () => ({ get: vi.fn(), post: vi.fn() }));
vi.spyOn(analytics, "trackEvent").mockImplementation(() => Promise.resolve());

test("billing choice persisted and plans_view tracked", async () => {
  api.get.mockResolvedValue({ data: [] });
  localStorage.removeItem("billing");

  render(
    <MemoryRouter>
      <Plans />
    </MemoryRouter>,
  );

  // default monthly
  await waitFor(() => expect(localStorage.getItem("billing")).toBeNull());

  const yearlyBtn = screen.getByText(/Yearly/i);
  fireEvent.click(yearlyBtn);
  expect(localStorage.getItem("billing")).toBe("yearly");
  expect(analytics.trackEvent).toHaveBeenCalledWith(
    "plans_view",
    expect.any(Object),
  );
});
