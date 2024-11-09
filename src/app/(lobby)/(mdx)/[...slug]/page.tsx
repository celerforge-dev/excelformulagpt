import { MDX_COMPONENTS } from "@/components/mdx/mdx-components";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/mdx/page-header";
import { Separator } from "@/components/ui/separator";
import { evaluate } from "@mdx-js/mdx";
import { access, readFile } from "fs/promises";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import path from "path";
import * as runtime from "react/jsx-runtime";

const PAGE_FOLDER = path.join(process.cwd(), "src", "content", "pages");

async function readPageFile(slug: string) {
  const filePath = path.resolve(path.join(PAGE_FOLDER, `${slug}.mdx`));

  try {
    await access(filePath);
  } catch {
    return null;
  }

  const fileContent = await readFile(filePath, { encoding: "utf8" });
  return fileContent;
}

interface Metadata {
  title: string;
  description: string;
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slugPath = (await params).slug.join("/");
  const markdown = await readPageFile(slugPath);

  if (!markdown) {
    notFound();
  }

  // @ts-expect-error - TODO: fix this
  const { metadata } = (await evaluate(markdown, runtime)) as {
    metadata: Metadata;
  };

  const { content } = await compileMDX({
    source: markdown,
    options: { parseFrontmatter: true },
    components: MDX_COMPONENTS,
  });
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>{metadata.title}</PageHeaderHeading>
        <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
      </PageHeader>
      <Separator className="my-8" />
      {content}
    </>
  );
}
