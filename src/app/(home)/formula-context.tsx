"use client";

import { generateExcelFormula } from "@/actions/ai";
import { Usage, getRemainingSecondsToday, getUsage } from "@/actions/usage";
import { ExcelData } from "@/app/(home)/excel-parser";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface FormulaRecord {
  input: string;
  result: string;
  timestamp: number;
  data: ExcelData | null;
}

export interface FormulaPrompt {
  input: string;
  data: ExcelData | null;
}

interface FormulaContextType extends FormulaPrompt {
  records: FormulaRecord[];
  setInput: (input: string) => void;
  isLoading: boolean;
  setData: (data: ExcelData | null) => void;
  generate: () => Promise<string>;
  usage: Usage | null;
}

const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

interface StorageItem<T> {
  value: T;
  expiry: number;
}

function setWithExpiry<T>(key: string, value: T, ttl: number) {
  const item: StorageItem<T> = {
    value: value,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item: StorageItem<T> = JSON.parse(itemStr);
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

export function FormulaProvider({
  children,
  maxRecords = 5,
}: {
  children: React.ReactNode;
  maxRecords?: number;
}) {
  const searchParams = useSearchParams();
  const shouldRefreshUsage = !!searchParams.get("refresh-usage");
  const [records, setRecords] = useState<FormulaRecord[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ExcelData | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    const saved = getWithExpiry<FormulaRecord[]>("formula-records");
    const savedInput = getWithExpiry<string>("formula-input");
    const savedUsage = getWithExpiry<Usage>("formula-usage");

    if (saved) {
      setRecords(saved);
    }
    if (savedInput) {
      setInput(savedInput);
    }
    if (savedUsage && !shouldRefreshUsage) {
      setUsage(savedUsage);
    } else {
      getUsage().then(async (newUsage) => {
        setUsage(newUsage);
        setWithExpiry(
          "formula-usage",
          newUsage,
          await getRemainingSecondsToday(),
        );
      });
    }
  }, [shouldRefreshUsage]);

  function addRecord(
    promptInput: string,
    formulaResult: string,
    excelData: ExcelData | null,
  ) {
    const newRecord = {
      input: promptInput,
      result: formulaResult,
      timestamp: Date.now(),
      data: excelData,
    };
    const updatedRecords = [newRecord, ...records].slice(0, maxRecords);
    setRecords(updatedRecords);
    setWithExpiry("formula-records", updatedRecords, 7 * 24 * 60 * 60 * 1000);
  }

  async function generate() {
    try {
      setIsLoading(true);
      const { formula, error } = await generateExcelFormula({
        input,
        data,
      });

      if (error || !formula) {
        throw new Error(error);
      }

      addRecord(input, formula, data);
      setInput("");

      const newUsage = await getUsage();
      setUsage(newUsage);
      setWithExpiry("formula-usage", newUsage, 24 * 60 * 60 * 1000);

      return formula;
    } finally {
      setIsLoading(false);
    }
  }

  const setInputWithStorage = (newInput: string) => {
    setInput(newInput);
    setWithExpiry("formula-input", newInput, 24 * 60 * 60 * 1000);
  };

  if (!usage) {
    return (
      <FormulaContext.Provider
        value={{
          records,
          input,
          setInput: setInputWithStorage,
          isLoading,
          data,
          setData,
          generate,
          usage: usage,
        }}
      >
        {children}
      </FormulaContext.Provider>
    );
  }

  return (
    <FormulaContext.Provider
      value={{
        records,
        input,
        setInput: setInputWithStorage,
        isLoading,
        data,
        setData,
        generate,
        usage,
      }}
    >
      {children}
    </FormulaContext.Provider>
  );
}

export const useFormula = () => {
  const context = useContext(FormulaContext);
  if (!context)
    throw new Error("useFormula must be used within FormulaProvider");
  return context;
};
