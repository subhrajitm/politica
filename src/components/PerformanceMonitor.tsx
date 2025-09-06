'use client';

import { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  startTime?: number;
  label?: string;
  showInDev?: boolean;
}

export default function PerformanceMonitor({ 
  startTime = Date.now(), 
  label = 'Page Load',
  showInDev = true 
}: PerformanceMonitorProps) {
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    setLoadTime(duration);
    
    // Log performance metrics
    console.log(`Performance: ${label} took ${duration}ms`);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with analytics services here
      // Example: gtag('event', 'timing_complete', { name: label, value: duration });
    }
  }, [startTime, label]);

  // Only show in development or when explicitly requested
  if (!showInDev && process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!loadTime) return null;

  const getPerformanceColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (time: number) => {
    if (time < 100) return 'Fast';
    if (time < 500) return 'Good';
    if (time < 1000) return 'Slow';
    return 'Very Slow';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background border rounded-lg p-2 shadow-lg">
        <div className="text-xs text-muted-foreground">
          {label}: <span className={getPerformanceColor(loadTime)}>{loadTime}ms</span>
          <span className="ml-1 text-xs">({getPerformanceLabel(loadTime)})</span>
        </div>
      </div>
    </div>
  );
}
