import { readAllFiles } from "@/app/[locale]/(main)/(mdx)/mdx";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await readAllFiles("blog");
  const { locales } = routing;

  const blogUrls = posts.map((post) => ({
    url: `https://${siteConfig.domain}/blog/${post.slug}`,
    lastModified: new Date(),
  }));

  // Create URLs for all supported locales
  const localeUrls = locales.map((locale) => ({
    url:
      locale === "en"
        ? `https://${siteConfig.domain}`
        : `https://${siteConfig.domain}/${locale}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: `https://${siteConfig.domain}`,
      lastModified: new Date(),
    },
    // Add all locale URLs
    ...localeUrls.filter((url) => url.url !== `https://${siteConfig.domain}`), // Filter out the default locale which is already added above
    {
      url: `https://${siteConfig.domain}/blog`,
      lastModified: new Date(),
    },
    ...blogUrls,
  ];
}
