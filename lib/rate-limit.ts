interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter per IP address.
 * Default: 30 requests per minute.
 */
export function checkRateLimit(
  ip: string,
  limit = 30,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = ipMap.get(ip);

  // Clean expired
  if (!record || now > record.resetAt) {
    ipMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}
