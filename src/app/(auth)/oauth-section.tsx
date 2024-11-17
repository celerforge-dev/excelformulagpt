import { signIn } from "@/actions/auth";
import { FormButton } from "@/components/form-button";
import { Icons } from "@/components/icons";

const providers = [
  { name: "google", label: "Google", Icon: Icons.google },
  { name: "github", label: "GitHub", Icon: Icons.github },
];

export function OauthSection() {
  return (
    <>
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
            pendingText={`Continuing with ${label}...`}
          >
            <Icon className="mr-2" size={18} width={18} height={18} />
            Continue with {label}
          </FormButton>
        </form>
      ))}
    </>
  );
}
