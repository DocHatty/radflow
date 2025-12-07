import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, withRateLimit, getRateLimitStatus } from '../utils/apiRetry';

describe('API Retry Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const resultPromise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('rate limit'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();
      
      const resultPromise = withRetry(fn, { 
        maxRetries: 2, 
        initialDelayMs: 100,
        onRetry 
      });
      
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should respect maxRetries limit', async () => {
      const error = new Error('rate limit');
      const fn = vi.fn().mockRejectedValue(error);

      const resultPromise = withRetry(fn, { maxRetries: 3, initialDelayMs: 10 });
      
      await vi.runAllTimersAsync();
      
      await expect(resultPromise).rejects.toThrow('rate limit');
      expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry non-retryable errors', async () => {
      const error = new Error('validation error');
      const fn = vi.fn().mockRejectedValue(error);

      const resultPromise = withRetry(fn, { maxRetries: 3 });
      
      await expect(resultPromise).rejects.toThrow('validation error');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on 429 status code (rate limit)', async () => {
      const error = Object.assign(new Error('Too Many Requests'), { status: 429 });
      const fn = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, { initialDelayMs: 10 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on 503 status code (service unavailable)', async () => {
      const error = Object.assign(new Error('Service Unavailable'), { status: 503 });
      const fn = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, { initialDelayMs: 10 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('withRateLimit', () => {
    it('should limit concurrent requests', async () => {
      const fn = vi.fn(async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return value;
      });

      const limited = withRateLimit(fn, { maxConcurrentRequests: 2 });

      const promises = [
        limited('a'),
        limited('b'),
        limited('c'),
        limited('d'),
      ];

      // Initially only 2 should be running
      await vi.advanceTimersByTimeAsync(50);
      expect(fn).toHaveBeenCalledTimes(2);

      // After first batch completes, next 2 should start
      await vi.advanceTimersByTimeAsync(100);
      expect(fn).toHaveBeenCalledTimes(4);

      await vi.runAllTimersAsync();
      const results = await Promise.all(promises);
      expect(results).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current rate limit status', () => {
      const status = getRateLimitStatus();

      expect(status).toHaveProperty('activeRequests');
      expect(status).toHaveProperty('recentRequests');
      expect(status).toHaveProperty('availableSlots');
      expect(status).toHaveProperty('maxRequestsPerMinute');
      expect(status).toHaveProperty('maxConcurrentRequests');
    });
  });
});
