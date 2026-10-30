"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Imprimer / PDF" }: { label?: string }) {
  return (
    <Button variant="outline" className="no-print rounded-full" onClick={() => window.print()}>
      <Printer /> {label}
    </Button>
  );
}
