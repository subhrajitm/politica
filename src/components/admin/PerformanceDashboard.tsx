/**
 * Performance monitoring dashboard for admin interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useWebVitals } from '../WebVitalsTracker';
import { performanceMonitor } from '../../lib/monitoring/performanceMonitor';
import { BundleAnalyzer } from '../../lib/codeSplitting';
import { Activity, Zap, Clock, Eye, Trash2, RefreshCw } from 'lucide-react';

export function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [webVitalsData, setWebVitalsData] = useState<any>({});
  const [bundleData, setBundleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getVitalsReport, clearStoredVitals } = useWebVitals();

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = () => {
    setIsLoading(true);
    
    try {
      // Get performance report
      const report = performanceMonitor.generateReport();
      setPerformanceData(report);

      // Get Web Vitals data
      const vitalsReport = getVitalsReport();
      setWebVitalsData(vitalsReport);

      // Get bundle analytics
      const bundleReport = BundleAnalyzer.getBundleReport();
      setBundleData(bundleReport);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    performanceMonitor.clearData();
    clearStoredVitals();
    localStorage.removeItem('pf_bundle_analytics');
    localStorage.removeItem('pf_fps_data');
    loadPerformanceData();
  };

  const getVitalRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVitalRatingVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Dashboard</CardTitle>
          <CardDescription>Loading performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor Core Web Vitals, bundle sizes, and application performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPerformanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={clearAllData}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="resources">Resource Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(webVitalsData).map(([name, data]: [string, any]) => (
              <Card key={name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {name}
                    <Badge variant={getVitalRatingVariant(data.rating)}>
                      {data.rating}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {name === 'CLS' 
                      ? data.average?.toFixed(3) 
                      : Math.round(data.average || 0)
                    }
                    {name !== 'CLS' && 'ms'}
                  </div>
                  <div className="mt-2">
                    <div className={`h-2 rounded-full ${getVitalRatingColor(data.rating)}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Latest: {data.latest?.value?.toFixed(name === 'CLS' ? 3 : 0) || 'N/A'}
                    {name !== 'CLS' && data.latest && 'ms'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {Object.keys(webVitalsData).length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No Web Vitals data available. Navigate through the app to collect metrics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(performanceData.pageMetrics.pageLoad || 0)}ms
                  </div>
                  <Progress 
                    value={Math.min((performanceData.pageMetrics.pageLoad || 0) / 3000 * 100, 100)} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">DOM Content Loaded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(performanceData.pageMetrics.domContentLoaded || 0)}ms
                  </div>
                  <Progress 
                    value={Math.min((performanceData.pageMetrics.domContentLoaded || 0) / 2000 * 100, 100)} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.apiCalls.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg: {performanceData.apiCalls.length > 0 
                      ? Math.round(performanceData.apiCalls.reduce((sum: number, call: any) => sum + call.duration, 0) / performanceData.apiCalls.length)
                      : 0
                    }ms
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.memoryUsage 
                      ? Math.round(performanceData.memoryUsage.usedJSHeapSize / 1048576)
                      : 'N/A'
                    }
                    {performanceData.memoryUsage && 'MB'}
                  </div>
                  {performanceData.memoryUsage && (
                    <Progress 
                      value={(performanceData.memoryUsage.usedJSHeapSize / performanceData.memoryUsage.jsHeapSizeLimit) * 100} 
                      className="mt-2" 
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent API Calls */}
          {performanceData?.apiCalls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent API Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {performanceData.apiCalls.slice(0, 10).map((call: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs truncate flex-1">
                        {call.method} {call.endpoint}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={call.status >= 400 ? 'destructive' : 'default'}>
                          {call.status}
                        </Badge>
                        <span className={`font-medium ${call.duration > 1000 ? 'text-red-500' : call.duration > 500 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {Math.round(call.duration)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bundles" className="space-y-4">
          {bundleData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {bundleData.slice(0, 20).map((bundle: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm truncate">{bundle.bundleName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bundle.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {(bundle.size / 1024).toFixed(1)}KB
                          </p>
                          <Badge variant={bundle.size > 500 * 1024 ? 'destructive' : bundle.size > 100 * 1024 ? 'secondary' : 'default'}>
                            {bundle.size > 500 * 1024 ? 'Large' : bundle.size > 100 * 1024 ? 'Medium' : 'Small'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round(bundle.loadTime)}ms
                          </p>
                          <Badge variant={bundle.loadTime > 1000 ? 'destructive' : bundle.loadTime > 500 ? 'secondary' : 'default'}>
                            {bundle.loadTime > 1000 ? 'Slow' : bundle.loadTime > 500 ? 'Medium' : 'Fast'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No bundle data available. Navigate through the app to collect bundle metrics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {performanceData?.resourceTiming.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Resource Timing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {performanceData.resourceTiming
                    .filter((resource: any) => resource.duration > 0)
                    .sort((a: any, b: any) => b.duration - a.duration)
                    .slice(0, 20)
                    .map((resource: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-xs truncate flex-1">
                          {resource.name.split('/').pop()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {resource.initiatorType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {resource.transferSize ? `${(resource.transferSize / 1024).toFixed(1)}KB` : 'cached'}
                          </span>
                          <span className={`font-medium ${resource.duration > 1000 ? 'text-red-500' : resource.duration > 500 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {Math.round(resource.duration)}ms
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No resource timing data available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}