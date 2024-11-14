"use client";

import { useFormula } from "@/app/(home)/formula-context";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  prompt: z.string().min(1, "prompt is required."),
});

export function FormulaPrompt({ className }: { className?: string }) {
  const { prompt, setPrompt, submitPrompt, isLoading } = useFormula();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    form.setValue("prompt", prompt);
  }, [prompt, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return;

    try {
      setPrompt(values.prompt);
      await submitPrompt();
      toast.success("Formula generated successfully");
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
        <div className="absolute bottom-1 left-1 flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-6 w-6 text-secondary-foreground hover:bg-transparent"
                  aria-label="Upload excel file"
                  title="Upload excel file"
                >
                  <Icons.fileUp />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Upload your file to help us better understand your data
                  context. Your file is processed locally and we respect your
                  privacy.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-xs text-gray-500">5 free credits left</span>
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
                  className="w-full rounded-lg border bg-white p-3 pb-8 font-normal shadow-md transition-all placeholder:text-gray-400"
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
