"use server";

import { ExcelData } from "@/app/[locale]/(home)/excel-parser";
import { FormulaPrompt } from "@/app/[locale]/(home)/formula-context";
import { createXai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { env } from "~/env";

const SYSTEM_PROMPT = `
You are an Excel formula expert. Your role is to generate accurate and efficient Excel formulas based on user requests.

Guidelines for your responses:
1. Only output the Excel formula, nothing else
2. Use standard Excel functions and syntax
3. Ensure formulas are properly nested and parentheses are balanced
4. Consider error handling when appropriate (e.g., IFERROR, IFNA)
5. For complex calculations, break down nested functions in a clear way
6. Use absolute references ($) when it makes sense for the formula's purpose

Example format:
User: Average of B where A > 100
Response: =AVERAGEIF(A:A,">100",B:B)
`;

const MAX_INPUT_TOKENS = 1500;
const MAX_OUTPUT_TOKENS = 500;

type FormulaResponse = {
  formula: string;
  error?: string;
  errorValues?: { tokens: number };
};

class FormulaPromptImpl implements FormulaPrompt {
  constructor(
    public input: string,
    public data: ExcelData | null,
  ) {}

  toPrompt(): string {
    const context = this.data
      ? `Excel Context:
  ${this.formatSheets()}
  
  User is likely working with this data structure. Consider the sheet names and columns when generating formulas.`
      : "No Excel context provided";

    return `
  Context: ${context}
  User Request: ${this.input}
  
  Generate an Excel formula for this request.`;
  }

  private formatSheets(): string {
    if (!this.data) return "";

    return `Available Sheets:${this.data.sheets
      .map((sheet) => {
        const columnInfo = sheet.columns
          .map((col) => {
            const sampleDisplay = col.sample ? `"${col.sample}"` : "undefined";
            return `      ${col.key}: ${col.name} (${col.dataType || "unknown"}, sample: ${sampleDisplay})`;
          })
          .join("\n");

        return `
    - Sheet: ${sheet.name}
    Rows: ${sheet.rowCount}
    Columns:
${columnInfo}`;
      })
      .join("\n")}
  `;
  }
}

export async function generateExcelFormula(
  prompt: FormulaPrompt,
  token: string,
): Promise<FormulaResponse> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );
  const data = await res.json();

  if (!data.success) {
    return {
      formula: "",
      error: "formula.error.invalidToken",
    };
  }
  const promptImpl = new FormulaPromptImpl(prompt.input, prompt.data);
  const fullPrompt = promptImpl.toPrompt();

  const estimatedSystemTokens = Math.ceil(SYSTEM_PROMPT.length / 4);
  const estimatedPromptTokens = Math.ceil(fullPrompt.length / 4);
  const estimatedTotalTokens = estimatedSystemTokens + estimatedPromptTokens;

  if (estimatedTotalTokens > MAX_INPUT_TOKENS) {
    return {
      formula: "",
      error: "formula.error.tooLong",
      errorValues: { tokens: estimatedTotalTokens },
    };
  }

  const xai = createXai({
    apiKey: env.XAI_API_KEY,
  });
  const model = xai("grok-2-1212", {});

  const response = await generateText({
    model: model,
    system: SYSTEM_PROMPT,
    prompt: fullPrompt,
    temperature: 0.1,
    maxTokens: MAX_OUTPUT_TOKENS,
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  // Clean up the response
  const formula = response.text
    .trim()
    .replace(/^`+|`+$/g, "") // Remove backticks if present
    .replace(/^=?\s*/, "="); // Ensure formula starts with =
  return { formula };
}
