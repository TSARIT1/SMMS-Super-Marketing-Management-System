import React from "react";

export default function PricingCard({
  title,
  price,
  frequencyLabel,
  features = [],
  recommended = false,
  onSelect,
  loading = false,
  disabled = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="mt-6">
          <div className="h-8 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 flex flex-col ${recommended ? "border-2 border-teal-400 transform -translate-y-2" : ""}`}
    >
      {recommended && (
        <div className="self-start bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          Recommended
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-gray-900">{price}</span>
        <span className="text-sm text-gray-500">{frequencyLabel}</span>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="text-sm text-gray-600">
            • {f}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          onClick={onSelect}
          disabled={disabled}
          className={`w-full py-2 rounded-md font-semibold ${disabled ? "opacity-70 cursor-not-allowed bg-gray-300 text-gray-700" : recommended ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {disabled ? "Processing…" : "Choose"}
        </button>
      </div>
    </div>
  );
}
