/**
 * API Retry and Rate Limiting Utility
 * 
 * Implements exponential backoff for retrying failed API requests
 * and basic rate limiting to prevent overwhelming the API endpoints.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RateLimitOptions {
  maxRequestsPerMinute?: number;
  maxConcurrentRequests?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Rate limiter class to manage API request quotas
 */
class RateLimiter {
  private requestTimestamps: number[] = [];
  private activeRequests = 0;
  private maxRequestsPerMinute: number;
  private maxConcurrentRequests: number;
  private pendingQueue: Array<() => void> = [];

  constructor(options: RateLimitOptions = {}) {
    this.maxRequestsPerMinute = options.maxRequestsPerMinute || 60;
    this.maxConcurrentRequests = options.maxConcurrentRequests || 10;
  }

  /**
   * Wait until a request slot is available
   */
  async acquire(): Promise<void> {
    // Wait for concurrent request limit
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await new Promise(resolve => {
        this.pendingQueue.push(resolve as () => void);
      });
    }

    // Clean up old timestamps (older than 1 minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );

    // Wait if we've hit the rate limit
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.activeRequests++;
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Release a request slot
   */
  release(): void {
    this.activeRequests--;
    
    // Process pending queue
    if (this.pendingQueue.length > 0) {
      const resolve = this.pendingQueue.shift();
      resolve?.();
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    ).length;

    return {
      activeRequests: this.activeRequests,
      recentRequests,
      availableSlots: Math.max(0, this.maxRequestsPerMinute - recentRequests),
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      maxConcurrentRequests: this.maxConcurrentRequests,
    };
  }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter();

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(
  attempt: number,
  options: Required<Omit<RetryOptions, 'onRetry'>>
): number {
  const delay = Math.min(
    options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1),
    options.maxDelayMs
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(
  error: any,
  retryableStatusCodes: number[]
): boolean {
  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('network')) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError' && error.message?.includes('timeout')) {
    return true;
  }

  // HTTP status codes
  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Rate limit errors
  if (error.message?.toLowerCase().includes('rate limit')) {
    return true;
  }

  return false;
}

/**
 * Execute a function with exponential backoff retry logic
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      // Acquire rate limit slot
      await globalRateLimiter.acquire();

      try {
        const result = await fn();
        return result;
      } finally {
        // Release rate limit slot
        globalRateLimiter.release();
      }
    } catch (error) {
      lastError = error as Error;

      // Don't retry if this is the last attempt
      if (attempt > config.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, config.retryableStatusCodes)) {
        throw error;
      }

      // Call retry callback if provided
      options.onRetry?.(attempt, lastError);

      // Calculate and wait for backoff delay
      const delay = calculateBackoffDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Create a rate-limited version of an async function
 * 
 * @param fn - The async function to rate limit
 * @param options - Rate limit options
 * @returns Rate-limited version of the function
 */
export function withRateLimit<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RateLimitOptions = {}
): (...args: TArgs) => Promise<TResult> {
  const rateLimiter = new RateLimiter(options);

  return async (...args: TArgs): Promise<TResult> => {
    await rateLimiter.acquire();
    try {
      return await fn(...args);
    } finally {
      rateLimiter.release();
    }
  };
}

/**
 * Get the status of the global rate limiter
 */
export function getRateLimitStatus() {
  return globalRateLimiter.getStatus();
}

/**
 * Configure global rate limiter
 */
export function configureGlobalRateLimit(options: RateLimitOptions) {
  Object.assign(globalRateLimiter, {
    maxRequestsPerMinute: options.maxRequestsPerMinute || 60,
    maxConcurrentRequests: options.maxConcurrentRequests || 10,
  });
}

/**
 * Retry decorator for class methods
 */
export function Retry(options: RetryOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}
