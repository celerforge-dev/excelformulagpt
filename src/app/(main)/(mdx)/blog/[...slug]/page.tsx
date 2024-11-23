import "@/styles/mdx.css";
import { notFound } from "next/navigation";

import {
  getPageMetadata,
  PageProps,
  readPageFile,
} from "@/app/(main)/(mdx)/mdx";
import { MDXPage } from "@/app/(main)/(mdx)/mdx-page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slugPath = (await params).slug;
  const metadata = await getPageMetadata(`blog/${slugPath}`);
  return metadata;
}

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
