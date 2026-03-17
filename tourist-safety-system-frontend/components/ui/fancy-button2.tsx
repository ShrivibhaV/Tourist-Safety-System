"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function FancyButtonType2({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "relative px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:brightness-110",
        className
      )}
    >
      {children}
    </button>
  );
}
