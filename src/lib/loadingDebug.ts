/**
 * Utility for debugging loading states in development
 */

export function debugLoadingState(component: string, loading: boolean, reason?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${component}] Loading: ${loading}${reason ? ` (${reason})` : ''}`);
  }
}

export function createLoadingTimeout(component: string, timeoutMs: number = 10000) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      console.error(`[${component}] Loading timeout after ${timeoutMs}ms`);
      reject(new Error(`Loading timeout in ${component}`));
    }, timeoutMs);
  });
}
