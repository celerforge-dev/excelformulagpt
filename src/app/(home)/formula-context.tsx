"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface FormulaRecord {
  prompt: string;
  result: string;
  timestamp: number;
}

interface FormulaContextType {
  records: FormulaRecord[];
  addRecord: (prompt: string, result: string) => void;
  setPrompt: (prompt: string) => void;
  currentPrompt: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

export function FormulaProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<FormulaRecord[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
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
    setCurrentPrompt(prompt);
    const updatedRecords = [newRecord, ...records].slice(0, 5);
    setRecords(updatedRecords);
    localStorage.setItem("formula-records", JSON.stringify(updatedRecords));
  };

  return (
    <FormulaContext.Provider
      value={{
        records,
        addRecord,
        currentPrompt,
        setPrompt: setCurrentPrompt,
        isLoading,
        setIsLoading,
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
