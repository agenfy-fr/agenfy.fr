"use client";

import * as React from "react";
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ActionForm, type ClientActionResult } from "./action-form";

/** Button opening a dialog that hosts a server-action form; closes on success. */
export function FormDialog<T = unknown>({
  trigger,
  triggerProps,
  title,
  description,
  action,
  submitLabel,
  onSuccess,
  children,
  wide,
}: {
  trigger: React.ReactNode;
  triggerProps?: ButtonProps;
  title: string;
  description?: string;
  action: (prev: ClientActionResult<T> | null, formData: FormData) => Promise<ClientActionResult<T>>;
  submitLabel?: string;
  onSuccess?: (data: T | undefined) => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...triggerProps}>{trigger}</Button>
      </DialogTrigger>
      <DialogContent className={wide ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ActionForm
          action={action}
          submitLabel={submitLabel}
          className="space-y-4"
          onSuccess={(data) => {
            setOpen(false);
            onSuccess?.(data);
          }}
        >
          {children}
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
