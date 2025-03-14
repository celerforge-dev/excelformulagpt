"use client";

import {
  FormulaProvider,
  useFormula,
} from "@/app/[locale]/(home)/formula-context";
import { FormulaForm } from "@/app/[locale]/(home)/formula-form";
import {
  FormulaResult,
  FormulaResultSkeleton,
} from "@/app/[locale]/(home)/formula-result";

function FormulaResultList() {
  const { records, isLoading, input } = useFormula();

  return (
    <>
      {isLoading && <FormulaResultSkeleton input={input} />}
      {records.map((record) => (
        <FormulaResult record={record} key={record.timestamp} />
      ))}
    </>
  );
}

export function FormulaSection() {
  return (
    <FormulaProvider>
      <div className="mx-auto my-10 mb-20 w-full max-w-xl">
        <div className="rounded-xl border border-black/10 p-2 -outline-offset-2">
          <FormulaForm />
          <FormulaResultList />
        </div>
      </div>
    </FormulaProvider>
  );
}
