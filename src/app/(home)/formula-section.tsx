"use client";

import { FormulaProvider, useFormula } from "@/app/(home)/formula-context";
import { FormulaPrompt } from "@/app/(home)/formula-prompt";
import {
  FormulaResult,
  FormulaResultSkeleton,
} from "@/app/(home)/formula-result";

function FormulaResultList() {
  const { records, isLoading, prompt } = useFormula();

  return (
    <>
      {isLoading && <FormulaResultSkeleton prompt={prompt} />}
      {records.map((record) => (
        <FormulaResult record={record} key={record.timestamp} />
      ))}
    </>
  );
}

export function FormulaSection() {
  return (
    <FormulaProvider>
      <div className="mx-auto my-10 w-full max-w-xl">
        <div className="rounded-xl border border-gray-100 bg-white/95 p-2 shadow-lg">
          <FormulaPrompt />
          <FormulaResultList />
        </div>
      </div>
    </FormulaProvider>
  );
}
