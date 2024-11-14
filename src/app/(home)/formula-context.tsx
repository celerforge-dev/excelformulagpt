"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface FormulaRecord {
  prompt: string;
  result: string;
  timestamp: number;
}

interface FormulaContextType {
  records: FormulaRecord[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  submitPrompt: () => Promise<string>;
}

const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

export function FormulaProvider({
  children,
  maxRecords = 5,
}: {
  children: React.ReactNode;
  maxRecords?: number;
}) {
  const [records, setRecords] = useState<FormulaRecord[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("formula-records");
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  const addRecord = (prompt: string, result: string) => {
    const newRecord = {
      prompt,
      result,
      timestamp: Date.now(),
    };
    const updatedRecords = [newRecord, ...records].slice(0, maxRecords);
    setRecords(updatedRecords);
    localStorage.setItem("formula-records", JSON.stringify(updatedRecords));
  };

  const submitPrompt = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      throw new Error("Please enter a valid prompt");
    }

    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = `=MOCK(${trimmedPrompt})`;
      addRecord(trimmedPrompt, result);
      setPrompt("");
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormulaContext.Provider
      value={{
        records,
        prompt,
        setPrompt,
        isLoading,
        submitPrompt,
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
