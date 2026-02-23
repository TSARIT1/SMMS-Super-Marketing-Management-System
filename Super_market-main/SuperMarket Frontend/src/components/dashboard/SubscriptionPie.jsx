import React from "react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function SubscriptionPie({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.fill || "#8884d8"} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, "Distribution"]} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
