"use client";

import { FormButton } from "@/components/form-button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  prompt: z.string().min(1, "prompt is required."),
});

export function FormulaPrompt() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="describe the formula you want here..."
                  className="min-h-[200px] resize-none rounded-lg border-gray-200 bg-white p-4 focus:border-gray-300 focus:ring-gray-300"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormButton type="submit" className="w-full">
          GENERATE
        </FormButton>
      </form>
    </Form>
  );
}
