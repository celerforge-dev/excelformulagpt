import { evaluate } from "@mdx-js/mdx";
import { type Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import * as runtime from "react/jsx-runtime";

import { MDX_COMPONENTS } from "@/components/mdx/mdx-components";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/mdx/page-header";
import { Separator } from "@/components/ui/separator";

interface MDXPageProps {
  markdown: string;
}

export async function MDXPage({ markdown }: MDXPageProps) {
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
        <PageHeaderHeading>
          {metadata.title?.toString() ?? ""}
        </PageHeaderHeading>
        <PageHeaderDescription>
          {metadata.description ?? ""}
        </PageHeaderDescription>
      </PageHeader>
      <Separator className="my-8" />
      {content}
    </>
  );
}
