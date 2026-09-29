import { SiteFooter, SiteHeader } from "@/components/site-ui";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

