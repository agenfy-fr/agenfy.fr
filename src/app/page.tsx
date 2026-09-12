import {
  Header,
  Hero,
  Benefits,
  Expertise,
  Process,
  Clients,
  CTA,
  Newsletter,
  Footer,
} from "@/components/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Expertise />
        <Process />
        <Clients />
        <CTA />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
