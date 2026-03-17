"use client";

import * as React from "react";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface DigitalIdButtonProps extends React.ComponentProps<typeof Link> {
  frontText?: string;
  className?: string;
}

const DigitalIdButton: React.FC<DigitalIdButtonProps> = ({
  frontText = "Tourist Dashboard",
  className,
  ...props
}) => {
  return (
    <Link
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:brightness-110 whitespace-nowrap",
        className
      )}
    >
      <Smartphone className="h-5 w-5 mr-2" />
      {frontText}
    </Link>
  );
};

export default DigitalIdButton;
