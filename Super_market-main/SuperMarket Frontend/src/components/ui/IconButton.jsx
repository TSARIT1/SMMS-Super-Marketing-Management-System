import React from "react";

export default function IconButton({ children, title = "", onClick, className = "" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-opacity-10 hover:shadow-sm transition ${className}`}
    >
      {children}
    </button>
  );
}
