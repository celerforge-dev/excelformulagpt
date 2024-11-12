import { siteConfig } from "@/config/site";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `https://${siteConfig.domain}`,
      lastModified: new Date(),
    },
  ];
}