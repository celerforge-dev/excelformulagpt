"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
      <p className="mb-6 max-w-md text-xl text-muted-foreground">
        {t("description")}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => reset()} size="lg" className="min-w-[150px]">
          {t("tryAgain")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="min-w-[150px]"
          onClick={() => (window.location.href = "/")}
        >
          {t("goHome")}
        </Button>
      </div>
      {error.digest && (
        <p className="mt-8 text-sm text-muted-foreground">
          {t("errorId")}: {error.digest}
        </p>
      )}
    </div>
  );
}
