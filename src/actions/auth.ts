"use server";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/lib/auth";

type SignOutParams = Parameters<typeof nextAuthSignOut>[0];

export async function signOut(options: SignOutParams) {
  "use server";
  return nextAuthSignOut(options);
}

export async function signIn(
  provider: string,
  options: { redirectTo: string },
) {
  "use server";
  return nextAuthSignIn(provider, options);
}
