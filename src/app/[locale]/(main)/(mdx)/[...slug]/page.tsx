import "@/styles/mdx.css";
import { notFound } from "next/navigation";

import {
  getPageMetadata,
  PageProps,
  readPageFile,
} from "@/app/[locale]/(main)/(mdx)/mdx";
import { MDXPage } from "@/app/[locale]/(main)/(mdx)/mdx-page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slugPath = (await params).slug;
  return getPageMetadata(`pages/${slugPath}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slugPath = (await params).slug;
  const markdown = await readPageFile(`pages/${slugPath}`);

  if (!markdown) {
    notFound();
  }

  return <MDXPage markdown={markdown} />;
}
