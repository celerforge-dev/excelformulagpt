import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Header({ className }: { className?: string }) {
  return (
    <header className={cn("container bg-background", className)}>
      <nav className="flex h-16 items-center justify-between">
        <Link href="/" className="mt-2 flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
