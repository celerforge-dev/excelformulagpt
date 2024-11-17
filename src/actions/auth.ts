"use server";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/lib/auth";
import { db, users } from "@/lib/drizzle";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

type SignOutParams = Parameters<typeof nextAuthSignOut>[0];

export async function signOut(options: SignOutParams) {
  return nextAuthSignOut(options);
}

type SignInParams = Parameters<typeof nextAuthSignIn>;

export async function signIn(...args: SignInParams) {
  return nextAuthSignIn(...args);
}

export async function signUp(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (user) {
    throw new Error("User already exists.");
  }

  const pwHash = await hash(password, 12);
  const name = email.split("@")[0];

  await db.insert(users).values({
    email,
    name,
    password: pwHash,
  });
}
