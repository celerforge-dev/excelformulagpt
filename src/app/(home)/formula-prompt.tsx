"use client";

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
});

export function FormulaPrompt({ className }: { className?: string }) {
  const { addRecord, currentPrompt, setIsLoading } = useFormula();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: currentPrompt || "",
    },
  });

  useEffect(() => {
    if (currentPrompt) {
      form.reset({ prompt: currentPrompt });
    }
  }, [currentPrompt, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const submittedPrompt = values.prompt;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = `=MOCK(${submittedPrompt})`;
      addRecord(submittedPrompt, result);
      toast.success(`Formula ${result} generated successfully.`);
      form.reset({ prompt: "" });
    } catch (error) {
      toast.error(`Failed to generate formula: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("relative", className)}
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="describe the formula you want here..."
                  className="w-full rounded-lg border bg-white p-3 font-normal shadow-md transition-all placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isSubmitting) {
                        form.handleSubmit(onSubmit)();
                      }
                    }
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-black p-2 text-white shadow-sm hover:bg-gray-800"
          aria-label="Generate"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Icons.loader className="animate-spin" />
          ) : (
            <Icons.cornerDownLeft />
          )}
        </Button>
      </form>
    </Form>
  );
}
