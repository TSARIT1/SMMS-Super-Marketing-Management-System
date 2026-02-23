import React from "react";
import { render } from "@testing-library/react";
import RevenueChart from "../RevenueChart";

const sample = [
  { month: "Jan", revenue: 1000 },
  { month: "Feb", revenue: 2000 },
];

test("renders RevenueChart and shows svg", () => {
  render(<RevenueChart data={sample} formatCurrency={(v) => `₹${v}`} />);
  // Recharts renders svg elements - ensure tooltip group exists by checking for svg
  const svg = document.querySelector("svg");
  expect(svg).toBeInTheDocument();
});
