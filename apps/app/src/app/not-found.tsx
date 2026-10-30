import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-h1 font-bold">Page introuvable</h1>
      <p className="text-muted-foreground">Cette page n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
      <Link href="/" className="text-primary underline">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
