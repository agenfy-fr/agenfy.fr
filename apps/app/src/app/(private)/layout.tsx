import { SiteFooter, SiteHeader } from "@/components/site-header";
import { requireViewer } from "@/lib/auth";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader viewer={viewer} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
