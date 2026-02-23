import React from "react";
import { render } from "@testing-library/react";
import UserGrowthChart from "../UserGrowthChart";

const sample = [
  { month: "Jan", users: 10 },
  { month: "Feb", users: 20 },
];

test("renders UserGrowthChart svg", () => {
  render(<UserGrowthChart data={sample} />);
  const svg = document.querySelector("svg");
  expect(svg).toBeInTheDocument();
});
