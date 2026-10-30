import "server-only";
import { type ZodSchema } from "zod";

/**
 * Standard API response envelope (same shape as Hasfy Console).
 */
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Returns a standardized successful JSON Response.
 * Default HTTP status is 200.
 */
export function apiSuccess<T>(
  data: T,
  status = 200,
  init?: Omit<ResponseInit, "status">
): Response {
  return Response.json(
    {
      success: true,
      data,
    } satisfies ApiSuccessResponse<T>,
    {
      status,
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    }
  );
}

/**
 * Returns a standardized error JSON Response.
 * Default HTTP status is 400.
 */
export function apiError(
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: unknown;
    headers?: HeadersInit;
  }
): Response {
  const status = options?.status ?? 400;
  return Response.json(
    {
      success: false,
      error: message,
      ...(options?.code ? { code: options.code } : {}),
      ...(options?.details ? { details: options.details } : {}),
    } satisfies ApiErrorResponse,
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }
  );
}

/**
 * Parses and validates an incoming Request body against a Zod schema.
 *
 * If valid: returns `{ success: true, data }`.
 * If invalid JSON or invalid schema: returns `{ success: false, response }`
 * with a pre-formatted 400 Response containing error message and issues details.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; response: Response }
> {
  let rawJson: unknown;
  try {
    rawJson = await req.json();
  } catch {
    return {
      success: false,
      response: apiError("Invalid JSON", {
        status: 400,
        code: "INVALID_JSON",
      }),
    };
  }

  const result = schema.safeParse(rawJson);
  if (!result.success) {
    const primaryMessage =
      result.error.issues[0]?.message ?? "Validation error";
    return {
      success: false,
      response: apiError(primaryMessage, {
        status: 400,
        code: "VALIDATION_ERROR",
        details: result.error.issues,
      }),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
