import Link from "next/link";

type AuthHeaderProps = {
  title: string;
  toggle: {
    text: string;
    linkText: string;
    linkPath: string;
  };
  error?: string;
};

export function AuthHeader({ title, toggle, error }: AuthHeaderProps) {
  return (
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
  );
}
