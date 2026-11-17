"use client";

import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";

interface MenuImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackBg?: string;
}

export function MenuImage({
  src,
  alt,
  className = "",
  fallbackBg = "bg-slate-200 dark:bg-slate-800",
}: MenuImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center ${fallbackBg} text-slate-400 ${className}`}
        aria-label={alt}
      >
        <UtensilsCrossed className="w-6 h-6 opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
