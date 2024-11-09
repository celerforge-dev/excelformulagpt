"use client";

import { Icons } from "@/components/icons";
import { Button, ButtonProps } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

interface FormButtonProps extends ButtonProps {
  pendingText?: string;
}

export function FormButton({
  children,
  pendingText,
  className,
  ...props
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending} {...props}>
      {pending ? (
        <>
          <Icons.refreshCw className="mr-2 h-4 w-4 animate-spin" />
          {pendingText || "Processing..."}
        </>
      ) : (
        <>{children}</>
      )}
    </Button>
  );
}
