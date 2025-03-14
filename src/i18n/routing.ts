import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [
    "en",
    "zh",
    "es",
    "fr",
    "de",
    "ja",
    "ko",
    "ru",
    "it",
    "pt",
    "pt-BR",
    "es-CL",
    "nl",
    "ur",
    "tr",
    "id",
    "ar",
  ],
  localePrefix: "as-needed",

  // Used when no locale matches
  defaultLocale: "en",
});
