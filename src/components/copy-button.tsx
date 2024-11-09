"use client";

import { Icons } from "@/components/icons";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export function CopyButton({ value, className, ...props }: ButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  return (
    <Button
      size="sm"
      className={cn("h-6 w-6 px-0", className)}
      onClick={() => {
        if (typeof window === "undefined") return;
        setIsCopied(true);
        void window.navigator.clipboard.writeText(value?.toString() ?? "");
        setTimeout(() => setIsCopied(false), 2000);
      }}
      variant={"outline"}
      {...props}
    >
      {isCopied ? (
        <Icons.check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Icons.copy className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        {isCopied ? "Copied" : "Copy to clipboard"}
      </span>
    </Button>
  );
}
