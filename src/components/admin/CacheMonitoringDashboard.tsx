/**
 * Cache monitoring dashboard for admin interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useCache } from '../../hooks/use-cache';
import { Trash2, RefreshCw, Zap, BarChart3 } from 'lucide-react';

export function CacheMonitoringDashboard() {
  const {
    stats,
    isLoading,
    refreshStats,
    clearCache,
    warmupCache,
    invalidatePoliticianCache,
    invalidateSearchCache
  } = useCache({
    autoWarmup: false,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cache Monitoring</CardTitle>
          <CardDescription>Loading cache statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hitRate = stats.memoryHits + stats.localStorageHits > 0 
    ? ((stats.memoryHits + stats.localStorageHits) / 
       (stats.memoryHits + stats.memoryMisses + stats.localStorageHits + stats.localStorageMisses)) * 100
    : 0;

  const memoryUsagePercent = (stats.memorySize / 100) * 100; // Assuming max 100 items
  const storageUsagePercent = (stats.localStorageSize / (5 * 1024 * 1024)) * 100; // 5MB max

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cache Monitoring</h2>
          <p className="text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={warmupCache}
            disabled={isLoading}
          >
            <Zap className="h-4 w-4 mr-2" />
            Warm Up
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hitRate.toFixed(1)}%</div>
            <Badge variant={hitRate > 70 ? 'default' : hitRate > 50 ? 'secondary' : 'destructive'}>
              {hitRate > 70 ? 'Excellent' : hitRate > 50 ? 'Good' : 'Poor'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memorySize}</div>
            <p className="text-xs text-muted-foreground">
              {stats.memoryHits} hits, {stats.memoryMisses} misses
            </p>
            <Progress value={memoryUsagePercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Local Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.localStorageSize / 1024).toFixed(1)}KB
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.localStorageHits} hits, {stats.localStorageMisses} misses
            </p>
            <Progress value={storageUsagePercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSize}</div>
            <p className="text-xs text-muted-foreground">
              Items + Storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Hits</span>
                <span className="font-medium">{stats.memoryHits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Memory Misses</span>
                <span className="font-medium">{stats.memoryMisses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>LocalStorage Hits</span>
                <span className="font-medium">{stats.localStorageHits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>LocalStorage Misses</span>
                <span className="font-medium">{stats.localStorageMisses}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
            <CardDescription>
              Manage cache data and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => invalidatePoliticianCache()}
                disabled={isLoading}
              >
                Clear Politicians
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={invalidateSearchCache}
                disabled={isLoading}
              >
                Clear Search
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearCache}
              disabled={isLoading}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Cache
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cache Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {hitRate > 70 ? '✓' : hitRate > 50 ? '⚠' : '✗'}
              </div>
              <p className="text-sm text-muted-foreground">Hit Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {memoryUsagePercent < 80 ? '✓' : memoryUsagePercent < 95 ? '⚠' : '✗'}
              </div>
              <p className="text-sm text-muted-foreground">Memory Usage</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {storageUsagePercent < 80 ? '✓' : storageUsagePercent < 95 ? '⚠' : '✗'}
              </div>
              <p className="text-sm text-muted-foreground">Storage Usage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}