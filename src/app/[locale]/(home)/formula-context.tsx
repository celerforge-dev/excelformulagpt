"use client";

import { generateExcelFormula } from "@/actions/ai";
import { ExcelData } from "@/app/[locale]/(home)/excel-parser";
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
  isLoading: boolean;
  setInput: (input: string) => void;
  setData: (data: ExcelData | null) => void;
  generate: (token: string) => Promise<string>;
}

const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

interface StorageItem<T> {
  value: T;
  expiry: number;
}

const STORAGE_KEYS = {
  RECORDS: "formula-records",
  INPUT: "formula-input",
  DATA: "formula-data",
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadFromStorage() {
      const savedRecords = getWithExpiry<FormulaRecord[]>(STORAGE_KEYS.RECORDS);
      const savedInput = getWithExpiry<string>(STORAGE_KEYS.INPUT);
      const savedData = getWithExpiry<ExcelData>(STORAGE_KEYS.DATA);

      if (savedRecords) {
        setRecords(savedRecords);
      }
      if (savedInput) {
        setInput(savedInput);
      }
      if (savedData) {
        setData(savedData);
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

  async function generate(token: string) {
    try {
      setIsLoading(true);
      const { formula, error, errorValues } = await generateExcelFormula(
        {
          input,
          data,
        },
        token,
      );

      if (error || !formula) {
        throw new Error(error, { cause: errorValues });
      }

      addRecord(input, formula, data);
      setInput("");

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
