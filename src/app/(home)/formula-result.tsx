"use client";

import { FormulaRecord, useFormula } from "@/app/(home)/formula-context";
import { CopyButton } from "@/components/copy-button";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TimeAgo from "react-timeago";

interface FormulaCardProps {
  prompt: string;
  timestamp?: React.ReactNode;
  actions?: React.ReactNode;
  result: React.ReactNode;
}

function FormulaResultCard({
  prompt,
  timestamp,
  actions,
  result,
}: FormulaCardProps) {
  return (
    <div className="mt-2">
      <div className="rounded-lg border bg-white p-3 shadow-md">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Excel Formula</div>
              <span className="text-xs text-gray-500">{timestamp}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default text-xs text-gray-500">
                    {prompt?.length > 40 ? `${prompt.slice(0, 40)}...` : prompt}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{prompt}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-0.5">{actions}</div>
        </div>
        <div className="mt-2 rounded border bg-gray-50/50 p-2 font-mono text-sm">
          {result}
        </div>
      </div>
    </div>
  );
}

export function FormulaResultSkeleton({ prompt }: { prompt: string }) {
  const actions = (
    <>
      <div className="mr-2 h-6 w-6 animate-pulse rounded bg-gray-200" />
      <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
    </>
  );

  return (
    <FormulaResultCard
      prompt={prompt}
      timestamp={<div className="h-3 w-16 animate-pulse rounded bg-gray-200" />}
      actions={actions}
      result={<div className="h-5 animate-pulse rounded bg-gray-200" />}
    />
  );
}

interface FormulaResultProps {
  record: FormulaRecord;
}

export function FormulaResult({ record }: FormulaResultProps) {
  const { setPrompt } = useFormula();

  const actions = (
    <>
      <CopyButton
        value={record.result}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-secondary-foreground"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-secondary-foreground"
        onClick={() => setPrompt(record.prompt)}
      >
        <Icons.refreshCw className="h-3.5 w-3.5" />
      </Button>
    </>
  );

  return (
    <FormulaResultCard
      prompt={record.prompt}
      timestamp={<TimeAgo date={record.timestamp} live={false} />}
      actions={actions}
      result={record.result}
    />
  );
}
