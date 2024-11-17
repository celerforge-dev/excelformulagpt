import { AuthHeader } from "@/app/(auth)/header";
import { OauthSection } from "@/app/(auth)/oauth-section";
import { OrDivider } from "@/app/(auth)/or-divider";
import { siteConfig } from "@/config/site";

export default async function SignIn() {
  return (
    <>
      <AuthHeader
        title="Sign in"
        toggle={{
          text: `New to ${siteConfig.name}?`,
          linkText: "Sign up for an account",
          linkPath: "/sign-up",
        }}
      />
      <OauthSection />
      <OrDivider />
    </>
  );
}
