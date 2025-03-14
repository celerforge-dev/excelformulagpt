import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import Link from "next/link";

const footerNav = [
  {
    title: "Resources",
    links: [
      {
        title: "Blog",
        href: "/blog",
      },
      {
        title: "Github",
        href: "https://github.com/celerforge/excelformulagpt",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        title: "Home",
        href: "/",
      },
      {
        title: "Terms",
        href: "/terms",
      },
      {
        title: "Privacy",
        href: "/privacy",
      },
    ],
  },
  {
    title: "Feedback",
    links: [
      {
        title: "Github Issues",
        href: "https://github.com/celerforge/excelformulagpt/issues",
      },
      {
        title: "support@excelformulagpt.com",
        href: "#",
      },
      {
        title: "cal",
        href: "https://app.cal.com/chaoying",
      },
      {
        title: "evernote",
        href: "https://share.evernote.com/note/4d52d9cb-49fb-5df7-bd24-6d3d96c53887",
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="container border-t bg-background py-16">
      <nav className="grid grid-cols-12 gap-8 md:gap-3">
        {footerNav.map((linkBlock, index) => (
          <div className="col-span-6 md:col-span-3" key={index}>
            <div className="mb-2 font-medium">{linkBlock.title}</div>
            <div className="flex flex-col gap-1">
              {linkBlock.links.map((link, linkIndex) => (
                <div key={linkIndex}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="col-span-12 md:col-span-3">
          <div className="lg:flex lg:items-center lg:gap-3">
            <Logo size={"sm"} />
            <div>
              <span className="text-sm">
                Follow us on
                <Link className="text-blue-700" href={siteConfig.twitter}>
                  &nbsp; Twitter
                </Link>
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-secondary-foreground">
            Copyright © {new Date().getFullYear()} {siteConfig.name}. All
          </div>
        </div>
      </nav>
    </footer>
  );
}
