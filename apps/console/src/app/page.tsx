import { redirect } from "next/navigation";
import { resolveHome } from "@/lib/access-control";
import { MFA_PATH, getSession } from "@/lib/server/auth";

/** Entry point: staff → /dashboard, client → /portal, others → /unauthorized. */
export default async function Home() {
  const session = await getSession();
  if (session?.mfaPending) redirect(MFA_PATH);
  redirect(resolveHome(session?.access ?? null));
}
