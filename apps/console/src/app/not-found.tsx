import Link from "next/link";
import { AuthCard } from "@/app/auth/auth-card";

export default function NotFound() {
  return (
    <AuthCard title="Page introuvable">
      <p className="text-sm text-muted-foreground">
        Cette page n&apos;existe pas ou vous n&apos;y avez pas accès.{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Revenir à l&apos;accueil
        </Link>
      </p>
    </AuthCard>
  );
}
