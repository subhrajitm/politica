/**
 * Lazy loading component for heavy content with intersection observer
 */

'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LazyContentProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  height?: number | string;
  width?: number | string;
  onLoad?: () => void;
}

export function LazyContent({
  children,
  fallback,
  className,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  height,
  width,
  onLoad,
}: LazyContentProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (!hasLoaded) {
            setHasLoaded(true);
            onLoad?.();
          }
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce, hasLoaded, onLoad]);

  const shouldShowContent = triggerOnce ? hasLoaded : isInView;

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      style={{
        height: height || 'auto',
        width: width || 'auto',
      }}
    >
      {shouldShowContent ? (
        children
      ) : (
        fallback || (
          <div
            className="flex items-center justify-center bg-muted animate-pulse"
            style={{
              height: height || '200px',
              width: width || '100%',
            }}
          >
            <div className="text-muted-foreground text-sm">Loading...</div>
          </div>
        )
      )}
    </div>
  );
}

/**
 * Lazy loading wrapper for charts and data visualizations
 */
export function LazyChart({
  children,
  className,
  height = 300,
  ...props
}: Omit<LazyContentProps, 'fallback'> & { height?: number }) {
  return (
    <LazyContent
      className={className}
      height={height}
      fallback={
        <div
          className="flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25"
          style={{ height }}
        >
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading chart...</p>
          </div>
        </div>
      }
      {...props}
    >
      {children}
    </LazyContent>
  );
}

/**
 * Lazy loading wrapper for data tables
 */
export function LazyTable({
  children,
  className,
  rows = 5,
  ...props
}: Omit<LazyContentProps, 'fallback'> & { rows?: number }) {
  return (
    <LazyContent
      className={className}
      fallback={
        <div className="space-y-2">
          {/* Table header skeleton */}
          <div className="h-10 bg-muted animate-pulse rounded" />
          {/* Table rows skeleton */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-8 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      }
      {...props}
    >
      {children}
    </LazyContent>
  );
}

/**
 * Lazy loading wrapper for politician cards
 */
export function LazyPoliticianCard({
  children,
  className,
  ...props
}: Omit<LazyContentProps, 'fallback'>) {
  return (
    <LazyContent
      className={className}
      fallback={
        <div className="border rounded-lg p-4 space-y-3 animate-pulse">
          {/* Avatar skeleton */}
          <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
          {/* Name skeleton */}
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          {/* Party skeleton */}
          <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
          {/* Details skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      }
      {...props}
    >
      {children}
    </LazyContent>
  );
}

/**
 * Progressive loading component that loads content in stages
 */
interface ProgressiveLoadingProps {
  stages: {
    component: ReactNode;
    delay?: number;
    condition?: boolean;
  }[];
  className?: string;
}

export function ProgressiveLoading({ stages, className }: ProgressiveLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage >= stages.length) return;

    const stage = stages[currentStage];
    const delay = stage.delay || 0;
    const condition = stage.condition !== undefined ? stage.condition : true;

    if (!condition) {
      setCurrentStage(prev => prev + 1);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStage(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStage, stages]);

  return (
    <div className={className}>
      {stages.slice(0, currentStage + 1).map((stage, index) => (
        <div key={index}>{stage.component}</div>
      ))}
    </div>
  );
}