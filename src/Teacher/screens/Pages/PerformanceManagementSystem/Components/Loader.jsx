// Loader.jsx
import React from "react";
import clsx from "clsx";

export default function Loader({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div
        className={clsx(
          "border-4 border-blue-300 border-t-blue-700 rounded-full animate-spin",
          sizes[size]
        )}
      />
    </div>
  );
}
