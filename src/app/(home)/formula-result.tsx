"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface FormulaResultProps {
  result?: string;
  onClear?: () => void;
  onCopy?: () => void;
}

export function FormulaResult({ result, onClear, onCopy }: FormulaResultProps) {
  return (
    <div className="space-y-4">
      <div className="min-h-[200px] rounded-lg border bg-white p-4">
        {result}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={onClear}>
          <Icons.refreshCw className="mr-2 h-4 w-4" />
          CLEAR
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCopy}>
          <Icons.copy className="mr-2 h-4 w-4" />
          COPY
        </Button>
      </div>
    </div>
  );
}
