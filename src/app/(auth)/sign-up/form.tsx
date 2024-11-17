"use client";

import { signIn, signUp } from "@/actions/auth";
import { credentialsSchema } from "@/app/(auth)/schema";
import { FormButton } from "@/components/form-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function SignUpForm() {
  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async () => {
    await signUp(form.getValues().email, form.getValues().password)
      .then(async () => {
        await signIn("credentials", form.getValues()).catch((error) => {
          // ignore redirect error https://github.com/nextauthjs/next-auth/issues/10016
          if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          }
        });
        // https://github.com/nextauthjs/next-auth/issues/9504
        window.location.href = "/";
        toast.success("Account created successfully.");
      })
      .catch((error: Error) => {
        console.log(error);
        toast.error(error.message);
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type={"email"} {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type={"password"} {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormButton className="mt-4 w-full">Sign up</FormButton>
      </form>
    </Form>
  );
}
