import AuthForm from "@/components/auth-form";

export default async function SignIn() {
  return (
    <AuthForm
      title="Sign in"
      toggle={{
        text: "New to celerforge?",
        linkText: "Sign up for an account",
        linkPath: "/sign-up",
      }}
    />
  );
}
