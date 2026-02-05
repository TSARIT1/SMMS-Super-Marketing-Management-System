import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function MonthlyPerformanceChart({
  data = [],
  formatCurrency = (v) => v,
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          yAxisId="left"
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
        />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          formatter={(value, name) =>
            name === "revenue"
              ? [formatCurrency(value), "Revenue"]
              : [value, "Users"]
          }
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="revenue"
          name="Revenue"
          fill="#7C3AED"
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
        <Bar
          yAxisId="right"
          dataKey="users"
          name="New Users"
          fill="#06B6D4"
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
