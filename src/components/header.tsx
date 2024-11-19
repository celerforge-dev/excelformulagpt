"use client";

import { Icons } from "@/components/icons";
import { Logo } from "@/components/logo";
import { UserDropdownMenu } from "@/components/user-menu";
import useHighlight from "@/hooks/use-highlight";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const LINKS = [
  {
    title: "Product",
    href: "/product",
    regex: "^/",
  },
  {
    title: "Pricing",
    href: "/pricing",
    regex: "^/pricing$",
  },
  {
    title: "Feedback",
    isExternal: true,
    href: "/https://github.com/celerforge/excelformulagpt/issues",
    regex: "^/feedback",
  },
];

export interface NavItemProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
  highlightRef: React.RefObject<HTMLDivElement>;
  isExternal?: boolean;
}

function NavItem({
  highlightRef,
  isActive,
  isExternal,
  children,
  ...props
}: NavItemProps) {
  const targetRef = useHighlight(highlightRef, "x", isActive);
  return (
    <Link
      className={cn(
        "relative inline-flex items-center gap-1.5 px-4 py-3 text-sm text-secondary-foreground transition-colors hover:text-white",
        isActive && "text-foreground",
      )}
      ref={targetRef}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
      {isExternal && (
        <Icons.externalLink
          className="inline-block translate-y-[1px]"
          size={12}
        />
      )}
    </Link>
  );
}

export function Header({ className }: { className?: string }) {
  const { data: session } = useSession();
  const highlightRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  return (
    <header className={cn("z-50 h-16", className)}>
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>
          <div className="relative">
            <div
              className="absolute left-0 top-1.5 h-8 rounded-full bg-neutral-800 opacity-0 transition-[transform,opacity,width]"
              ref={highlightRef}
            />
            <nav className="flex items-center gap-2">
              {LINKS.map((item, index) => (
                <NavItem
                  key={index}
                  href={item.href}
                  highlightRef={highlightRef}
                  isActive={new RegExp(item.regex).test(pathname)}
                  isExternal={item.isExternal}
                >
                  {item.title}
                </NavItem>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex w-36 flex-row-reverse">
          {session?.user ? (
            <UserDropdownMenu user={session.user} />
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/sign-in"
                className="w-16 text-secondary-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex h-8 w-28 items-center justify-center rounded-full border border-secondary-foreground text-foreground transition-all hover:border-foreground"
              >
                <div className="flex items-center gap-1">
                  <span>Sign up</span>
                  <Icons.arrowRight size={16} />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
