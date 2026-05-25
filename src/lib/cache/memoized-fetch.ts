import { cache } from 'react';

/**
 * Server-side Request Memoization wrapper using React's cache().
 * This ensures that duplicate fetches within the same server-rendering request lifecycle
 * (e.g. layout and page querying the same data) are executed exactly once.
 */
export const memoizedFetch = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>
): ((...args: Args) => Promise<T>) => {
  return cache(fn);
};
