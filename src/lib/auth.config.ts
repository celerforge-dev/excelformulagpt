import { credentialsSchema } from "@/app/(auth)/schema";
import { db, users } from "@/lib/drizzle";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { ZodError } from "zod";

export default {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
            await credentialsSchema.parseAsync(credentials);
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            throw new Error("Invalid email or password.");
          }

          const isValid = await compare(password, user?.password ?? "");
          if (!isValid) {
            throw new Error("Invalid email or password.");
          }

          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error("Invalid email or password format.");
          }
          throw error;
        }
      },
    }),
    Google,
    GitHub,
  ],
} satisfies NextAuthConfig;
