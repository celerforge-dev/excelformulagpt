import { signIn } from "@/actions/auth";
import { FormButton } from "@/components/form-button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { z } from "zod";

const providers = [
  { name: "google", label: "Google", Icon: Icons.google },
  { name: "github", label: "GitHub", Icon: Icons.github },
];

type AuthFormProps = {
  title: string;
  toggle: {
    text: string;
    linkText: string;
    linkPath: string;
  };
  error?: string;
};

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email({ message: "Must be a valid email." }),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
});

export default async function AuthForm({
  title,
  toggle,
  error,
}: AuthFormProps) {
  return (
    <>
      <div className="mb-8">
        <h2 className="mb-1.5 text-xl font-semibold">{title}</h2>
        <p className="font-light text-secondary-foreground">
          {toggle.text}{" "}
          <Link
            className="text-blue-500 hover:text-blue-600"
            href={toggle.linkPath}
          >
            {toggle.linkText}
          </Link>
          .
        </p>
        {error && <p className="mt-2 text-destructive">{error}</p>}
      </div>
      {providers.map(({ name, label, Icon }) => (
        <form
          key={name}
          action={async () => {
            "use server";
            await signIn(name, { redirectTo: "/" });
          }}
        >
          <FormButton
            className="mb-4 h-9 w-full rounded-md text-sm font-medium"
            pendingText={`Signing in with ${label}...`}
          >
            <Icon className="mr-2" size={18} width={18} height={18} />
            Sign in with {label}
          </FormButton>
        </form>
      ))}
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", formData);
        }}
      >
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" />
        </label>
        <FormButton>Sign in</FormButton>
      </form>
    </>
  );
}
