import { Logo } from "@/components/logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <section className="container flex w-full justify-center border-l-border md:w-2/3 md:border-r">
        <div className="m-auto w-full max-w-sm py-4">{children}</div>
      </section>
      <section className="hidden w-1/3 items-center md:flex">
        <div className="relative -left-6 flex items-center overflow-hidden bg-background">
          <Logo size={"lg"} className="py-6 text-3xl" />
        </div>
      </section>
    </div>
  );
}
