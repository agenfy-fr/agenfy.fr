import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ForbiddenError, UnauthorizedError, requireStaffSection } from "@/lib/server/auth";

export interface MessageRef {
  folder: string;
  uid: number;
}

/** Owner/admin check + `?folder=&uid=` parsing for the mail route handlers. */
export async function guardMailRoute(request: NextRequest): Promise<MessageRef | NextResponse> {
  try {
    await requireStaffSection("/mail");
  } catch (err) {
    if (err instanceof UnauthorizedError) return new NextResponse("Unauthorized", { status: 401 });
    if (err instanceof ForbiddenError) return new NextResponse("Forbidden", { status: 403 });
    throw err;
  }
  const folder = request.nextUrl.searchParams.get("folder");
  const uid = Number(request.nextUrl.searchParams.get("uid"));
  if (!folder || folder.length > 1000 || !Number.isInteger(uid) || uid <= 0) return new NextResponse("Bad request", { status: 400 });
  return { folder, uid };
}
