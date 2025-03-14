import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function NotFound() {
  return (
    <>
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center">
        <div className="h-full text-center">
          <h1 className="mb-3 text-6xl font-bold">404</h1>
          <h2 className="mb-2 text-2xl">Page not found</h2>
          <p className="mb-6 text-secondary-foreground">
            The page you are looking for does not exist.
          </p>
          <Link className={cn(buttonVariants())} href="/">
            Go back to the home page
          </Link>
        </div>
      </div>
    </>
  );
}
