import React from "react";

export default function StatCard({ title, value, subtitle, icon, color = "blue" }) {
  const gradientClasses = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${gradientClasses[color]}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-xs mt-1 opacity-85">{subtitle}</p>}
          </div>
          {icon && <div className="w-12 h-12 text-white opacity-80">{icon}</div>}
        </div>
      </div>
    </div>
  );
}
