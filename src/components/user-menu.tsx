"use client";

import { signOut } from "@/actions/auth";
import { Icons } from "@/components/icons";
import ThemeSwitch from "@/components/theme-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserMenu() {
  const { data: session } = useSession();
  return session?.user ? (
    <UserDropdownMenu user={session.user} />
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "hover:bg-background/70",
        )}
      >
        Sign in
      </Link>
      <Link href="/sign-up" className={cn(buttonVariants(), "rounded-full")}>
        <div className="flex items-center gap-1">
          <span>Sign up</span>
          <Icons.arrowRight size={16} />
        </div>
      </Link>
    </div>
  );
}

type UserDropdownMenuProps = {
  user: NonNullable<Session["user"]>;
};

export function UserDropdownMenu({ user }: UserDropdownMenuProps) {
  const pathname = usePathname();
  async function signOutHandler() {
    await signOut({ redirectTo: "/sign-in" });
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8 border">
          <AvatarImage alt={user.name || ""} src={user.image || ""} />
          <AvatarFallback className="text-neutral-foreground font-medium">
            {user.name?.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex flex-col px-2 py-2 text-sm font-medium">
          <span className="capitalize">{user.name}</span>
          <span className="text-xs text-secondary-foreground">
            {user.email}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="mb-1 h-8">
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex justify-between",
              pathname == "/" ? "bg-accent" : "",
            )}
          >
            <span className="mr-5">Homepage</span>
          </Link>
        </DropdownMenuItem>
        <div className="flex items-center justify-between px-2 text-sm">
          <span className="cursor-default text-foreground">Theme</span>
          <ThemeSwitch />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="h-8 w-52 cursor-pointer"
          onSelect={signOutHandler}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
