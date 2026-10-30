"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
  size,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} variant={variant} size={size} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          {pendingLabel ?? "Envoi…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
