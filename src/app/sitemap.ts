import { readAllFiles } from "@/app/[locale]/(main)/(mdx)/mdx";
import { siteConfig } from "@/config/site";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await readAllFiles("blog");

  const blogUrls = posts.map((post) => ({
    url: `https://${siteConfig.domain}/blog/${post.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: `https://${siteConfig.domain}`,
      lastModified: new Date(),
    },
    {
      url: `https://${siteConfig.domain}/blog`,
      lastModified: new Date(),
    },
    ...blogUrls,
  ];
}
