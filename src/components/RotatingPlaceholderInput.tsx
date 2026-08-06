"use client";

import React, { useState, useEffect } from "react";

const PLACEHOLDERS = [
  "Describe your startup idea...",
  "Describe your business idea...",
  "Describe your venture...",
  "What are you building?",
  "Tell us about your idea...",
  "Launch your next venture...",
];

export function RotatingPlaceholderInput({
  name,
  required = true,
  className,
}: {
  name: string;
  required?: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <input
      type="text"
      name={name}
      required={required}
      placeholder={PLACEHOLDERS[index]}
      className={className}
    />
  );
}
