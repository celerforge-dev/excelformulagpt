"use server";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/lib/auth";

type SignOutParams = Parameters<typeof nextAuthSignOut>[0];

export async function signOut(options: SignOutParams) {
  return nextAuthSignOut(options);
}

type SignInParams = Parameters<typeof nextAuthSignIn>;

export async function signIn(...args: SignInParams) {
  return nextAuthSignIn(...args);
}
