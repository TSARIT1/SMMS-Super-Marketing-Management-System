import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function UserGrowthChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [value, "New Users"]} />
        <defs>
          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="users"
          stroke="#10B981"
          fill="url(#userGradient)"
          fillOpacity={0.3}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
