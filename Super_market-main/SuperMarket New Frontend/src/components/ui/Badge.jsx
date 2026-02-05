import React from "react";

const Badge = ({ children, color = "blue", className = "", variant = "default" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    gray: "bg-gray-100 text-gray-700",
  };

  const variants = {
    default: colors[color],
    outline: "border border-gray-300 bg-white text-gray-700",
    secondary: "bg-gray-100 text-gray-900",
  };

  return (
    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
