import { AuthHeader } from "@/app/(auth)/header";
import { OauthSection } from "@/app/(auth)/oauth-section";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default async function SignUp() {
  return (
    <>
      <AuthHeader
        title="Sign up"
        toggle={{
          text: "Already have an account?",
          linkText: "Sign in",
          linkPath: "/sign-in",
        }}
      />
      <OauthSection />
      <div className="mt-4 text-xs leading-4 text-secondary-foreground">
        By registering, you agree to the processing of your personal data by{" "}
        {siteConfig.name} as described in the &nbsp;
        <Link href="/terms" className="text-blue-500 hover:text-blue-600">
          Terms of Service
        </Link>
        {` and `}
        <Link href="/privacy" className="text-blue-500 hover:text-blue-600">
          Privacy Policy
        </Link>
        .
      </div>
    </>
  );
}
