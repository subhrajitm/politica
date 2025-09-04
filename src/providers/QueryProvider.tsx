'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';
import { errorLogger, AppError, ErrorSeverity } from '@/lib/monitoring/errorHandler';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
            onError: (error) => {
              errorLogger.log(
                new AppError(
                  error.message,
                  'MUTATION_ERROR',
                  ErrorSeverity.MEDIUM,
                  {
                    component: 'QueryClient',
                    action: 'mutation',
                  }
                )
              );
            },
          },
        },
      })
  );

  // Add global query monitoring
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'observerResultsUpdated') {
      const query = event.query;
      if (query.state.error) {
        errorLogger.log(
          new AppError(
            query.state.error.message,
            'QUERY_ERROR',
            ErrorSeverity.MEDIUM,
            {
              component: 'QueryClient',
              action: 'query',
              metadata: {
                queryKey: query.queryKey,
                queryHash: query.queryHash,
              },
            }
          )
        );
      }
    }
  });

  // Monitor query performance
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'observerResultsUpdated') {
      const query = event.query;
      if (query.state.dataUpdatedAt && query.state.dataUpdatedAt > 0) {
        const duration = Date.now() - query.state.dataUpdatedAt;
        if (duration > 0) {
          performanceMonitor.trackAPICall(
            `query:${query.queryKey.join(':')}`,
            duration,
            query.state.error ? 500 : 200,
            'GET'
          );
        }
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}