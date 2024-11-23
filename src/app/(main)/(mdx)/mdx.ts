import { evaluate } from "@mdx-js/mdx";
import { promises as fs } from "fs";
import { access, readFile } from "fs/promises";
import { Metadata } from "next";
import path from "path";
import * as runtime from "react/jsx-runtime";

export const PAGE_FOLDER = path.join(process.cwd(), "src", "content");

export async function readPageFile(slug: string) {
  const filePath = path.resolve(path.join(PAGE_FOLDER, `${slug}.mdx`));

  try {
    await access(filePath);
  } catch {
    return null;
  }

  const fileContent = await readFile(filePath, { encoding: "utf8" });
  return fileContent;
}

export interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function getPageMetadata(slug: string) {
  const pageData = await readPageFile(slug);

  if (!pageData) {
    return {};
  }

  // @ts-expect-error - TODO: fix this
  const { metadata } = (await evaluate(pageData, runtime)) as {
    metadata: Metadata;
  };

  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export async function readAllFiles(directory: string) {
  const contentDirectory = path.join(
    process.cwd(),
    "src",
    "content",
    directory,
  );

  try {
    const files = await fs.readdir(contentDirectory);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    const contents = await Promise.all(
      mdxFiles.map(async (file) => {
        const content = await fs.readFile(
          path.join(contentDirectory, file),
          "utf8",
        );
        const slug = file.replace(/\.mdx$/, "");
        return { slug, content };
      }),
    );

    return contents;
  } catch (error) {
    console.error("Error reading files:", error);
    return [];
  }
}
