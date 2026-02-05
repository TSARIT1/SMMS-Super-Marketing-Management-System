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

export default function InventoryStatusChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="inStock" fill="#10B981" name="In Stock" />
        <Bar dataKey="lowStock" fill="#F59E0B" name="Low Stock" />
        <Bar dataKey="outOfStock" fill="#EF4444" name="Out of Stock" />
      </BarChart>
    </ResponsiveContainer>
  );
}
