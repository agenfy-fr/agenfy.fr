import {
  Header,
  Hero,
  Trust,
  Benefits,
  Expertise,
  Process,
  Clients,
  Insights,
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
        <Trust />
        <Expertise />
        <Benefits />
        <Process />
        <Clients />
        <Insights />
        <CTA />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
