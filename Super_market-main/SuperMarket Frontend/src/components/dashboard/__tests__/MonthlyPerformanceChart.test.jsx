import React from "react";
import { render } from "@testing-library/react";
import MonthlyPerformanceChart from "../MonthlyPerformanceChart";

const sample = [
  { month: "Jan", revenue: 1000, users: 10 },
  { month: "Feb", revenue: 2000, users: 20 },
];

test("renders MonthlyPerformanceChart svg", () => {
  render(
    <MonthlyPerformanceChart data={sample} formatCurrency={(v) => `₹${v}`} />,
  );
  const svg = document.querySelector("svg");
  expect(svg).toBeInTheDocument();
});
