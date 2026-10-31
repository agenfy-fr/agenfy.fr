"use client";

import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field } from "@/components/shared/field";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { createBlogPost } from "./actions";

export function NewBlogPostButton() {
  return (
    <FormDialog
      trigger={
        <>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nouvel article
        </>
      }
      title="Nouvel article"
      description="L'article est créé en brouillon : rien n'est publié sur www.agenfy.fr avant que vous cliquiez sur « Publier »."
      action={createBlogPost}
      submitLabel="Créer le brouillon"
    >
      <Field label="Titre" htmlFor="blog-new-title">
        <Input id="blog-new-title" name="title" required maxLength={200} placeholder="Agents IA : par où commencer en PME ?" />
      </Field>
      <Field label="Catégorie" htmlFor="blog-new-category">
        <NativeSelect id="blog-new-category" name="category" defaultValue="IA">
          {BLOG_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FormDialog>
  );
}
