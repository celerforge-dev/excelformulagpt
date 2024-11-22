import "@/styles/mdx.css";
import { notFound } from "next/navigation";

import { readPageFile } from "@/app/(main)/(mdx)/mdx";
import { MDXPage } from "@/app/(main)/(mdx)/mdx-page";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slugPath = (await params).slug;
  const markdown = await readPageFile(`blog/${slugPath}`);

  if (!markdown) {
    notFound();
  }

  return <MDXPage markdown={markdown} />;
}
