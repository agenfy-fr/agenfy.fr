import Image from "next/image";

/** Centered card used by every unauthenticated page (login, confirm, unauthorized). */
export function AuthCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/agenfy-logo.svg" alt="Agenfy" width={48} height={48} priority />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="rounded-xl border bg-background p-6 shadow-sm">{children}</div>
        <p className="text-center text-xs text-muted-foreground">Agenfy — une marque de Hasfy SAS</p>
      </div>
    </div>
  );
}
