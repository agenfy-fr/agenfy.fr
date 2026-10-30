/**
 * Rate limiter en mémoire — bucket par (IP, route-group), fenêtre glissante.
 *
 * IMPORTANT : ce stockage est par-process (par-pod en K8s). Avec plusieurs
 * réplicas, la limite effective est `replicas * limit`. Suffisant comme
 * première ligne anti-burst, mais à remplacer par Redis si on monte en
 * volume.
 *
 * Aucune dépendance externe pour rester compatible avec l'edge runtime
 * (Next.js middleware).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const STORE = new Map<string, Bucket>();
const MAX_KEYS = 10_000; // garde-fou anti-OOM

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  let bucket = STORE.get(key);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    if (STORE.size > MAX_KEYS) {
      // Eviction grossière : on dégage le premier élément trouvé.
      const firstKey = STORE.keys().next().value;
      if (firstKey !== undefined) STORE.delete(firstKey);
    }
    STORE.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}
