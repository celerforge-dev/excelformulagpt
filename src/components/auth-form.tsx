import { signIn } from "@/actions/auth";
import { FormButton } from "@/components/form-button";
import { Icons } from "@/components/icons";
import Link from "next/link";

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
    </>
  );
}
