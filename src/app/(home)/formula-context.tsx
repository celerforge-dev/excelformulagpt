"use client";

import { generateExcelFormula } from "@/actions/ai";
import { getUserPlan } from "@/actions/subscription";
import { Usage, getRemainingSecondsToday, getUsage } from "@/actions/usage";
import { ExcelData } from "@/app/(home)/excel-parser";
import { PlanTier } from "@/db/schema";
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
  usage: Usage | null;
  tier: PlanTier | null;
  isLoading: boolean;
  setInput: (input: string) => void;
  setData: (data: ExcelData | null) => void;
  generate: () => Promise<string>;
}

const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

interface StorageItem<T> {
  value: T;
  expiry: number;
}

const STORAGE_KEYS = {
  RECORDS: "formula-records",
  INPUT: "formula-input",
  USAGE: "formula-usage",
  DATA: "formula-data",
  TIER: "formula-tier",
} as const;
const TTL = 24 * 60 * 60 * 1000;

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
  const [records, setRecords] = useState<FormulaRecord[]>([]);
  const [input, setInput] = useState("");
  const [data, setData] = useState<ExcelData | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [tier, setTier] = useState<PlanTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadFromStorage() {
      const plan = await getUserPlan();
      const planTier = plan?.tier;
      const savedRecords = getWithExpiry<FormulaRecord[]>(STORAGE_KEYS.RECORDS);
      const savedInput = getWithExpiry<string>(STORAGE_KEYS.INPUT);
      const savedData = getWithExpiry<ExcelData>(STORAGE_KEYS.DATA);
      const savedUsage = getWithExpiry<Usage>(STORAGE_KEYS.USAGE);
      const savedTier = getWithExpiry<PlanTier>(STORAGE_KEYS.TIER);
      const shouldRefreshUsage = planTier !== savedTier;

      if (savedRecords) {
        setRecords(savedRecords);
      }
      if (savedInput) {
        setInput(savedInput);
      }
      if (savedData) {
        setData(savedData);
      }
      if (savedUsage && !shouldRefreshUsage) {
        setUsage(savedUsage);
      } else {
        getUsage().then(async (newUsage) => {
          setTier(planTier);
          setWithExpiry(STORAGE_KEYS.TIER, planTier, TTL);
          setUsage(newUsage);
          setWithExpiry(
            STORAGE_KEYS.USAGE,
            newUsage,
            await getRemainingSecondsToday(),
          );
        });
      }
    }
    loadFromStorage();
  }, []);

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
    setWithExpiry(STORAGE_KEYS.RECORDS, updatedRecords, TTL);
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
      setWithExpiry(
        STORAGE_KEYS.USAGE,
        newUsage,
        await getRemainingSecondsToday(),
      );

      return formula;
    } finally {
      setIsLoading(false);
    }
  }

  const setInputWithStorage = (newInput: string) => {
    setInput(newInput);
    setWithExpiry(STORAGE_KEYS.INPUT, newInput, TTL);
  };

  const setDataWithStorage = (newData: ExcelData | null) => {
    setData(newData);
    setWithExpiry(STORAGE_KEYS.DATA, newData, TTL);
  };

  return (
    <FormulaContext.Provider
      value={{
        records,
        input,
        isLoading,
        data,
        tier,
        usage,
        setInput: setInputWithStorage,
        setData: setDataWithStorage,
        generate,
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
