import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function RevenueChart({ data = [], formatCurrency = (v) => v }) {
  return (
    <div style={{ minWidth: 0, minHeight: 260 }} className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
        />
        <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          animationDuration={800}
        />
      </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
