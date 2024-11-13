"use client";

import { Logo } from "@/components/logo";
import useHighlight from "@/hooks/use-highlight";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const NAV_ITEMS = [
  {
    label: "Product",
    href: "/",
    regex: "/",
  },
  {
    label: "Pricing",
    href: "/pricing",
    regex: "/pricing",
  },
  {
    label: "GitHub",
    href: "https://github.com/celerforge/excelformulagpt",
    regex: "/github",
  },
  {
    label: "Feedback",
    href: "https://github.com/celerforge/excelformulagpt/issues",
    regex: "/github",
  },
];

interface NavItemProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
  highlightRef: React.RefObject<HTMLDivElement>;
}

function NavItem({ highlightRef, isActive, children, ...props }: NavItemProps) {
  const targetRef = useHighlight(highlightRef, "x", isActive);
  return (
    <Link
      className={cn(
        "relative px-4 py-3 text-sm transition-colors",
        isActive && "text-white",
      )}
      ref={targetRef}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const highlightRef = useRef<HTMLDivElement>(null);

  return (
    <header className={cn("container bg-background", className)}>
      <div className="flex h-14 items-center justify-between">
        <Link href="/" className="mt-2 flex items-center">
          <Logo />
        </Link>
        <div className="relative">
          <div
            className="w-30 absolute left-0 top-1.5 h-8 rounded-full bg-neutral-800 opacity-0 transition-[transform,opacity,width]"
            ref={highlightRef}
          ></div>
          <nav className="flex items-center gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                highlightRef={highlightRef}
                isActive={new RegExp(item.regex).test(pathname)}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
