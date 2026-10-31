"use client";

import { MailOpen, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/shared/action-form";
import { markUnreadAction, trashMessageAction } from "../actions";

export function MessageActions({ folder, uid }: { folder: string; uid: number }) {
  return (
    <>
      <ActionButton variant="outline" size="sm" action={() => markUnreadAction(folder, uid)}>
        <MailOpen className="h-4 w-4" aria-hidden="true" /> Non lu
      </ActionButton>
      <ActionButton
        variant="ghost"
        size="sm"
        className="text-destructive"
        confirm="Supprimer ce message ? (déplacé dans la corbeille ; supprimé définitivement s'il y est déjà)"
        action={() => trashMessageAction(folder, uid)}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
      </ActionButton>
    </>
  );
}
