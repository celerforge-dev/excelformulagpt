import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import Script from "next/script";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  setRequestLocale(locale);
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <Script
        src={"/script.js"}
        data-website-id="15c4a70e-1a89-43c8-bb64-af985a063ca9"
        strategy="afterInteractive"
      />
      <NextIntlClientProvider>
        <body
          className={cn(
            "bg-background font-sans antialiased",
            fontSans.variable,
          )}
        >
          <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster richColors />
            </ThemeProvider>
          </SessionProvider>
          <Analytics />
        </body>
      </NextIntlClientProvider>
    </html>
  );
}
