"use client";

import * as React from "react";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/lib/toast";

/** Mirrors lib/server/actions.ts ActionResult (kept client-safe). */
export type ClientActionResult<T = unknown> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

type FormAction<T> = (prev: ClientActionResult<T> | null, formData: FormData) => Promise<ClientActionResult<T>>;

export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

/**
 * Form bound to a server action (useActionState): toasts the result, resets
 * on success if asked, and exposes the returned data to `onSuccess`.
 */
export function ActionForm<T = unknown>({
  action,
  children,
  submitLabel = "Enregistrer",
  submitProps,
  resetOnSuccess = false,
  onSuccess,
  className,
  hideSubmit = false,
  successToast = true,
}: {
  action: FormAction<T>;
  children: React.ReactNode;
  submitLabel?: React.ReactNode;
  submitProps?: ButtonProps;
  resetOnSuccess?: boolean;
  onSuccess?: (data: T | undefined) => void;
  className?: string;
  hideSubmit?: boolean;
  successToast?: boolean;
}) {
  const [state, formAction] = useActionState<ClientActionResult<T> | null, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (successToast) toast.success(state.message ?? "Enregistré.");
      if (resetOnSuccess) formRef.current?.reset();
      onSuccessRef.current?.(state.data);
    } else {
      toast.error(state.error);
    }
  }, [state, resetOnSuccess, successToast]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {!hideSubmit && (
        <div className="flex justify-end pt-2">
          <SubmitButton {...submitProps}>{submitLabel}</SubmitButton>
        </div>
      )}
    </form>
  );
}

/** Button running a parameterless server action (delete, convert…), with optional confirmation. */
export function ActionButton<T = unknown>({
  action,
  children,
  confirm,
  onSuccess,
  ...props
}: Omit<ButtonProps, "onClick" | "action"> & {
  action: () => Promise<ClientActionResult<T>>;
  confirm?: string;
  onSuccess?: (data: T | undefined) => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      disabled={pending || props.disabled}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          const res = await action();
          if (res.ok) {
            toast.success(res.message ?? "Enregistré.");
            onSuccess?.(res.data);
          } else {
            toast.error(res.error);
          }
        });
      }}
      {...props}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Button>
  );
}
