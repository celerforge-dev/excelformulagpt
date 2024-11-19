"use server";

import { checkUsage, recordUsage } from "@/actions/usage";
import { ExcelData } from "@/app/(home)/excel-parser";
import { FormulaPrompt } from "@/app/(home)/formula-context";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

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

interface FormulaResponse {
  formula: string;
  error?: string;
}

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
): Promise<FormulaResponse> {
  const { error } = await checkUsage();
  if (error) {
    return { formula: "", error };
  }

  const promptImpl = new FormulaPromptImpl(prompt.input, prompt.data);
  const response = await generateText({
    model: openrouter("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    prompt: promptImpl.toPrompt(),
    temperature: 0.1,
    maxTokens: 2000,
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  // Clean up the response
  const formula = response.text
    .trim()
    .replace(/^`+|`+$/g, "") // Remove backticks if present
    .replace(/^=?\s*/, "="); // Ensure formula starts with =
  await recordUsage();
  return { formula };
}
