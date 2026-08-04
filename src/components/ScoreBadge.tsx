import React from "react";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = "md", showLabel = false }: ScoreBadgeProps) {
  let colorClasses = "";
  let label = "";

  if (score >= 80) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Strong High Potential";
  } else if (score >= 60) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Moderate Opportunity";
  } else {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
    label = "High Risk / Pivot Needed";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded-full border",
    md: "px-3 py-1 text-sm font-semibold rounded-full border",
    lg: "px-4 py-1.5 text-base font-bold rounded-full border shadow-sm",
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} ${colorClasses}`}>
      <span className={`w-2 h-2 rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"}`} />
      <span>{score}/100</span>
      {showLabel && <span className="opacity-85 font-normal">({label})</span>}
    </span>
  );
}
