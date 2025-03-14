import { AuthHeader } from "@/app/[locale]/(auth)/header";
import { OauthSection } from "@/app/[locale]/(auth)/oauth-section";
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
    </>
  );
}
