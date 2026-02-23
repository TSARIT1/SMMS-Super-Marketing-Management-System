import React from "react";
import { render } from "@testing-library/react";
import SubscriptionPie from "../SubscriptionPie";

const sample = [
  { name: "Basic", value: 40, fill: "#3B82F6" },
  { name: "Pro", value: 60, fill: "#10B981" },
];

test("renders SubscriptionPie svg", () => {
  render(<SubscriptionPie data={sample} />);
  const svg = document.querySelector("svg");
  expect(svg).toBeInTheDocument();
});
