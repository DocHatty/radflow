// services/retryService.ts
// Exponential backoff retry logic with circuit breaker pattern

import { logEvent, logError } from "./loggingService";

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  signal?: AbortSignal;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

// Circuit breaker state per provider
const circuitBreakers = new Map<string, CircuitBreakerState>();

const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of failures before opening circuit
const CIRCUIT_BREAKER_RESET_TIME = 30000; // 30 seconds before attempting again

// HTTP status codes that are retryable
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Check if an error is retryable based on status code or error type
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return false; // Never retry aborted requests
  }

  if (error instanceof Error) {
    const message = error.message;

    // Check for HTTP status codes in error message
    for (const code of RETRYABLE_STATUS_CODES) {
      if (message.includes(`${code}`)) {
        return true;
      }
    }

    // Network errors are retryable
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("ECONNRESET") ||
      message.includes("ETIMEDOUT") ||
      message.includes("fetch failed")
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Get circuit breaker state for a provider
 */
const getCircuitBreaker = (providerId: string): CircuitBreakerState => {
  if (!circuitBreakers.has(providerId)) {
    circuitBreakers.set(providerId, {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    });
  }
  return circuitBreakers.get(providerId)!;
};

/**
 * Check if circuit is open (should fail fast)
 */
export const isCircuitOpen = (providerId: string): boolean => {
  const breaker = getCircuitBreaker(providerId);

  if (!breaker.isOpen) return false;

  // Check if enough time has passed to try again
  const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
  if (timeSinceLastFailure >= CIRCUIT_BREAKER_RESET_TIME) {
    // Half-open state - allow one request through
    breaker.isOpen = false;
    logEvent("Circuit breaker half-open", { providerId });
    return false;
  }

  return true;
};

/**
 * Record a failure for circuit breaker
 */
export const recordFailure = (providerId: string): void => {
  const breaker = getCircuitBreaker(providerId);
  breaker.failures++;
  breaker.lastFailureTime = Date.now();

  if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    breaker.isOpen = true;
    logEvent("Circuit breaker opened", { providerId, failures: breaker.failures });
  }
};

/**
 * Record a success - reset circuit breaker
 */
export const recordSuccess = (providerId: string): void => {
  const breaker = getCircuitBreaker(providerId);
  if (breaker.failures > 0) {
    logEvent("Circuit breaker reset", { providerId, previousFailures: breaker.failures });
  }
  breaker.failures = 0;
  breaker.isOpen = false;
};

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);

  // Add jitter (random 0-1000ms) to prevent thundering herd
  const jitter = Math.random() * 1000;

  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeoutId);
          reject(new DOMException("Request aborted", "AbortError"));
        },
        { once: true }
      );
    }
  });
};

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param providerId - Provider ID for circuit breaker tracking
 * @param options - Retry configuration options
 * @returns The result of the function
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  providerId: string,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, signal } = options;

  // Check circuit breaker first
  if (isCircuitOpen(providerId)) {
    throw new Error(`Circuit breaker open for provider ${providerId}. Try again later.`);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check if aborted before each attempt
    if (signal?.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }

    try {
      const result = await fn();
      recordSuccess(providerId);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if aborted
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        logError("Non-retryable error", { providerId, attempt, error: lastError.message });
        recordFailure(providerId);
        throw error;
      }

      // If we've exhausted retries, throw
      if (attempt === maxRetries) {
        logError("Max retries exceeded", { providerId, attempts: attempt + 1 });
        recordFailure(providerId);
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, baseDelay, maxDelay);
      logEvent("Retrying after error", {
        providerId,
        attempt: attempt + 1,
        maxRetries,
        delay: Math.round(delay),
        error: lastError.message,
      });

      await sleep(delay, signal);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Unknown error in retry logic");
};

/**
 * Extract Retry-After header value from error message if present
 */
export const extractRetryAfter = (error: Error): number | null => {
  const match = error.message.match(/retry.?after[:\s]*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10) * 1000; // Convert to milliseconds
  }
  return null;
};
