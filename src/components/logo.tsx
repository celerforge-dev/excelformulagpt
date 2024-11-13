"use client";

import { VariantProps, cva } from "class-variance-authority";
import { Outfit } from "next/font/google";
import React from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"] });

const logoVariants = cva("font-medium", {
  variants: {
    size: {
      sm: ["text-xl"],
      default: ["text-xl"],
      lg: ["text-3xl"],
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface logoProps extends VariantProps<typeof logoVariants> {
  className?: string;
}

const Logo = React.forwardRef<HTMLButtonElement, logoProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <span
        className={cn(outfit.className, logoVariants({ size, className }))}
        {...props}
        ref={ref}
      >
        {siteConfig.name}
      </span>
    );
  },
);
Logo.displayName = "Logo";

export { Logo, logoVariants };
