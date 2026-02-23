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
  formatCurrency = (v) => `₹${v.toLocaleString()}`,
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
        />
        <Tooltip
          formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
        />
        <Legend />
        <Bar
          dataKey="revenue"
          name="Revenue"
          fill="#7C3AED"
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
        <Bar
          dataKey="profit"
          name="Profit (Est.)"
          fill="#10B981"
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
