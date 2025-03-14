import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email({ message: "Must be a valid email." }),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
});
