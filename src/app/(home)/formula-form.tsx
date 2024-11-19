"use client";

import { AuthDialog } from "@/app/(home)/auth-dialog";
import { ExcelUploader } from "@/app/(home)/excel-uploader";
import { useFormula } from "@/app/(home)/formula-context";
import { UsageDisplay } from "@/app/(home)/usage-display";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  input: z
    .string()
    .min(1, "Input is required.")
    .max(500, "Input cannot exceed 500 characters.")
    .refine(
      (value) => value.trim().length > 0,
      "Input cannot be empty or only whitespace.",
    ),
  excelFile: z.instanceof(File).optional(),
});

const GenerateButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button> & {
    isLoading?: boolean;
  }
>(function GenerateButton({ isLoading, ...props }, ref) {
  return (
    <Button
      ref={ref}
      {...props}
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
  );
});

export function FormulaForm({ className }: { className?: string }) {
  const { input, setInput, generate, isLoading } = useFormula();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: "",
      excelFile: undefined,
    },
  });

  useEffect(() => {
    form.setValue("input", input);
  }, [input, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session) {
      toast.error(
        "Please sign in to use the formula generator. Sign in helps us prevent abuse and manage usage limits.",
      );
      return;
    }
    if (isLoading) return;
    setInput(values.input);
    try {
      await generate();
      toast.success("Formula generated successfully.");
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full overflow-hidden rounded-lg border bg-white shadow-md">
            <UsageDisplay />
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setInput(e.target.value);
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
                  <FormMessage className="absolute right-3 top-0" />
                </FormItem>
              )}
            />
          </div>

          <div className="absolute bottom-0 flex items-center gap-2">
            <ExcelUploader />
          </div>
          {session && <GenerateButton isLoading={isLoading} />}
        </form>
      </Form>
      {!session && <AuthDialog trigger={<GenerateButton type="button" />} />}
    </div>
  );
}
