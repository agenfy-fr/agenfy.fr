import { existsSync } from "node:fs";
import path from "node:path";
import { ILLUSTRATIONS, type IllustrationName } from "@/lib/illustrations";
import { IllustrationFrame } from "./IllustrationFrame";

const EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

function findFile(name: IllustrationName): string | null {
  const dir = path.join(process.cwd(), "public", "illustrations");
  const ext = EXTENSIONS.find((e) => existsSync(path.join(dir, `${name}.${e}`)));
  return ext ? `/illustrations/${name}.${ext}` : null;
}

/** Renders the illustration if its file exists, nothing otherwise. */
export function Illustration({
  name,
  priority = false,
  className,
}: {
  name: IllustrationName;
  priority?: boolean;
  className?: string;
}) {
  const src = findFile(name);
  if (!src) return null;
  const spec = ILLUSTRATIONS[name];
  return <IllustrationFrame src={src} {...spec} priority={priority} className={className} />;
}
