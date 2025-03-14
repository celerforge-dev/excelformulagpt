"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useParams } from "next/navigation";

const LANGUAGE_MAP: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  zh: { label: "中文", flag: "🇨🇳" },
  es: { label: "Español", flag: "🇪🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  ja: { label: "日本語", flag: "🇯🇵" },
  ko: { label: "한국어", flag: "🇰🇷" },
  ru: { label: "Русский", flag: "🇷🇺" },
  it: { label: "Italiano", flag: "🇮🇹" },
  pt: { label: "Português", flag: "🇵🇹" },
  "pt-BR": { label: "Português (Brasil)", flag: "🇧🇷" },
  "es-CL": { label: "Español (Chile)", flag: "🇨🇱" },
  nl: { label: "Nederlands", flag: "🇳🇱" },
  ur: { label: "اردو", flag: "🇵🇰" },
  tr: { label: "Türkçe", flag: "🇹🇷" },
  id: { label: "Bahasa Indonesia", flag: "🇮🇩" },
  ar: { label: "العربية", flag: "🇸🇦" },
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-16">
          <span className="mr-1">{LANGUAGE_MAP[locale]?.flag || "🌐"}</span>
          <Icons.chevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((l) => (
          <DropdownMenuItem key={l} asChild>
            <Link href={pathname} locale={l}>
              <span className="mr-2">{LANGUAGE_MAP[l]?.flag}</span>
              {LANGUAGE_MAP[l]?.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
