export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="mdx container max-w-3xl py-32">{children}</main>
    </>
  );
}
