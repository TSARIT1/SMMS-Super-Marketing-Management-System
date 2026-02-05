import React from "react";
import { render, screen } from "@testing-library/react";
import PricingCard from "../PricingCard";

test("renders title and price and features", () => {
  render(
    <PricingCard
      title="Pro"
      price="$29"
      frequencyLabel="/mo"
      features={["A", "B"]}
      recommended={true}
      onSelect={() => {}}
    />,
  );
  expect(screen.getByText(/Pro/i)).toBeInTheDocument();
  expect(screen.getByText(/\$29/i)).toBeInTheDocument();
  expect(screen.getByText(/A/i)).toBeInTheDocument();
});
