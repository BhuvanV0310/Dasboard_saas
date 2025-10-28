/**
 * Rate limiting utilities for API routes
 * Uses in-memory store (suitable for single-instance deploys or low traffic)
 * For multi-instance/high traffic, consider Redis-based rate limiting
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 10
   */
  maxRequests?: number;
  
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;
  
  /**
   * Custom key generator (defaults to IP + userId if available)
   */
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (IP address, userId, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed flag and remaining count
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const {
    maxRequests = 10,
    windowMs = 60000, // 1 minute
    keyGenerator = (id) => id,
  } = config;

  const key = keyGenerator(identifier);
  const now = Date.now();

  // Get or create rate limit entry
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  const entry = store[key];

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP address from request headers
 * Checks x-forwarded-for, x-real-ip, and falls back to connection
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return 'unknown';
}

/**
 * Generate rate limit key from user ID and IP
 * Prioritizes user ID if available for better accuracy across devices
 */
export function generateRateLimitKey(userId?: string, ip?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ip) {
    return `ip:${ip}`;
  }
  return 'anonymous';
}
