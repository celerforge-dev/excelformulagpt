"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useParams } from "next/navigation";

const LANGUAGE_MAP: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  zh: { label: "中文", flag: "🇨🇳" },
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

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
          <DropdownMenuItem
            key={l}
            onClick={() => handleLanguageChange(l)}
            className={l === locale ? "bg-accent" : ""}
          >
            <span className="mr-2">{LANGUAGE_MAP[l]?.flag}</span>
            {LANGUAGE_MAP[l]?.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
