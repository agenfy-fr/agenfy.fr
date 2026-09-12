import {
  Header,
  Hero,
  Trust,
  Problem,
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
        <Problem />
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
