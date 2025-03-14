import { CSPostHogProvider } from "@/components/post-hog-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <NextIntlClientProvider>
        <CSPostHogProvider>
          <body
            className={cn(
              "bg-background font-sans antialiased",
              fontSans.variable,
            )}
          >
            <SessionProvider session={session}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster richColors />
              </ThemeProvider>
            </SessionProvider>
            <Analytics />
          </body>
        </CSPostHogProvider>
      </NextIntlClientProvider>
    </html>
  );
}
