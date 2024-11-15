"use client";

import { ExcelUpload } from "@/app/(home)/excel-upload";
import { useFormula } from "@/app/(home)/formula-context";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  prompt: z.string().min(1, "prompt is required."),
  excelFile: z.instanceof(File).optional(),
});

export function FormulaPrompt({ className }: { className?: string }) {
  const { prompt, setPrompt, submitPrompt, isLoading, setExcelData } =
    useFormula();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      excelFile: undefined,
    },
  });

  useEffect(() => {
    form.setValue("prompt", prompt);
  }, [prompt, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return;
    setPrompt(values.prompt);
    try {
      await submitPrompt();
      toast.success("Formula generated successfully.");
    } catch (error) {
      toast.error(
        `Failed to generate formula: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("relative", className)}
      >
        <div className="w-full overflow-hidden rounded-lg border bg-white shadow-md">
          <div className="flex h-9 w-full items-center border-b px-3">
            <div className="flex text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-secondary-foreground">
                  5 free credits left
                </span>
              </div>
            </div>
            {/* <div className="flex text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-secondary-foreground">
                  5 free credits left,&nbsp;
                </span>
              </div>
              <div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-black transition-colors hover:text-gray-600"
                >
                  <span>Upgrade to Pro&nbsp;</span>
                </Link>
                <span className="text-secondary-foreground">
                  for more credits.
                </span>
              </div>
            </div> */}
            {/* <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-violet-600">
                Pro Member
              </span>
            </div> */}
          </div>
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setPrompt(e.target.value);
                    }}
                    placeholder="Enter formula request (e.g., 'Average of B where A > 100'). Click bottom left to upload file for better AI understanding."
                    className="focus border-none pb-12 pt-3 font-normal placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isLoading) {
                          form.handleSubmit(onSubmit)();
                        }
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="absolute bottom-0 flex items-center gap-2">
          <ExcelUpload
            onFileLoaded={setExcelData}
            onFileRemoved={() => setExcelData(null)}
          />
        </div>

        <Button
          type="submit"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-black p-2 text-white shadow-sm"
          aria-label="Generate"
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.loader className="animate-spin" />
          ) : (
            <Icons.cornerDownLeft />
          )}
        </Button>
      </form>
    </Form>
  );
}
