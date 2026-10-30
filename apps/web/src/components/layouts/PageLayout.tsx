import { Header, Footer } from "@/components/sections";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
