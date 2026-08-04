import React from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 120, strokeWidth = 10 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10b981"; // Green (80-100)
  let bgFillClass = "text-emerald-600";

  if (score < 60) {
    strokeColor = "#f43f5e"; // Red (<60)
    bgFillClass = "text-rose-600";
  } else if (score < 80) {
    strokeColor = "#f59e0b"; // Yellow (60-79)
    bgFillClass = "text-amber-600";
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-extrabold tracking-tight ${bgFillClass}`}>
          {score}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Score
        </span>
      </div>
    </div>
  );
}
