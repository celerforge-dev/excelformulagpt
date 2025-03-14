"use client";

import { ExcelUploader } from "@/app/[locale]/(home)/excel-uploader";
import { useFormula } from "@/app/[locale]/(home)/formula-context";
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
import { useTranslations } from "next-intl";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import Turnstile, { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import * as z from "zod";
import { env } from "~/env";

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
  const [token, setToken] = useState("");
  const turnstile = useTurnstile();
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
    if (isLoading) return;
    setInput(values.input);
    try {
      await generate(token);
      toast.success("Formula generated successfully.");
    } catch (error) {
      if (error instanceof Error) {
        const errorKey = error.message;
        const values = error.cause as { tokens?: number } | undefined;
        toast.error(t(errorKey, values || {}));
      } else {
        toast.error(t("formula.error.unknown"));
      }
    } finally {
      turnstile.reset();
    }
  }
  const t = useTranslations("/");

  return (
    <div className={cn("relative", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Turnstile
            sitekey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onVerify={(token) => setToken(token)}
          />
          <div className="w-full overflow-hidden rounded-lg border bg-white hover:shadow">
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
                      placeholder={t("formula.input.placeholder")}
                      className="focus h-36 border-none pb-12 pt-3 font-normal placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
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
          <GenerateButton isLoading={isLoading} />
        </form>
      </Form>
    </div>
  );
}
