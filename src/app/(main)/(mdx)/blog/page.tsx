import { readAllFiles } from "@/app/(main)/(mdx)/mdx";
import { evaluate } from "@mdx-js/mdx";
import { type Metadata } from "next";
import Link from "next/link";
import * as runtime from "react/jsx-runtime";

interface BlogPost {
  slug: string;
  metadata: Metadata & {
    date?: string;
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const files = await readAllFiles("blog");
  const posts = await Promise.all(
    files.map(async ({ slug, content }) => {
      // @ts-expect-error - TODO: fix this
      const { metadata } = (await evaluate(content, runtime)) as {
        metadata: Metadata & { date?: string };
      };
      return { slug, metadata };
    }),
  );

  // Sort by date, newest first
  return posts.sort((a, b) => {
    if (!a.metadata.date || !b.metadata.date) return 0;
    return (
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    );
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="font-heading inline-block text-4xl tracking-tight lg:text-5xl">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Thoughts, stories and ideas.
          </p>
        </div>
      </div>
      <hr className="my-8 border-t" />
      {posts?.length ? (
        <div className="grid gap-10">
          {posts.map((post, index) => (
            <div key={post.slug}>
              <article className="group relative flex flex-col space-y-2">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-bold">
                    {post.metadata.title?.toString()}
                  </h2>
                  {post.metadata.description && (
                    <p className="text-muted-foreground">
                      {post.metadata.description}
                    </p>
                  )}
                  {post.metadata.date && (
                    <p className="text-sm text-muted-foreground">
                      {formatDate(post.metadata.date)}
                    </p>
                  )}
                </Link>
              </article>
              {index < posts.length - 1 && (
                <hr className="my-8 border-t border-dashed opacity-30" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No blog posts published.</p>
      )}
    </div>
  );
}
