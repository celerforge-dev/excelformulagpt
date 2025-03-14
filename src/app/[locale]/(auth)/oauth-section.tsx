import { signIn } from "@/actions/auth";
import { FormButton } from "@/components/form-button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const providers = [
  { name: "google", label: "Google", Icon: Icons.google },
  { name: "github", label: "GitHub", Icon: Icons.github },
];

export function OauthSection({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {providers.map(({ name, label, Icon }) => (
        <form key={name} action={signIn.bind(null, name, { redirectTo: "/" })}>
          <FormButton
            className="h-9 w-full rounded-md text-sm font-medium"
            pendingText={`Continuing with ${label}...`}
          >
            <Icon className="mr-2" size={18} width={18} height={18} />
            Continue with {label}
          </FormButton>
        </form>
      ))}
    </div>
  );
}
