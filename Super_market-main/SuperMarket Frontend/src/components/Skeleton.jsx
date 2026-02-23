import React from "react";

export default function Skeleton({ rows = 4, cols = 6 }) {
  const rowsArr = Array.from({ length: rows });
  return (
    <div>
      {rowsArr.map((_, r) => (
        <div
          key={r}
          className="animate-pulse flex gap-4 items-center p-3 bg-white rounded-lg mb-3"
        >
          {Array.from({ length: cols }).map((__, c) => (
            <div
              key={c}
              className="h-4 bg-gray-200 rounded flex-1"
              style={{ minWidth: 40 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
