/**
 * Error Dashboard for Admin Interface
 * Displays error metrics, alerts, and recent errors
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Activity,
  Bug,
  Shield,
  Bell,
  BellOff
} from 'lucide-react';
import { useErrorTracking, ErrorMetrics, ErrorAlert } from '@/lib/monitoring/ErrorTracker';
import { ErrorSeverity, ErrorCategory } from '@/lib/errors';
import { ErrorLogEntry } from '@/components/error/ErrorLogger';

const ErrorDashboard: React.FC = () => {
  const {
    getMetrics,
    getAlerts,
    acknowledgeAlert,
    resolveAlert,
    getRecentErrors
  } = useErrorTracking();

  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [alerts, setAlerts] = useState<ErrorAlert[]>([]);
  const [recentErrors, setRecentErrors] = useState<ErrorLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setMetrics(getMetrics());
      setAlerts(getAlerts());
      setRecentErrors(getRecentErrors(20));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (acknowledgeAlert(alertId)) {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    if (resolveAlert(alertId)) {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true, resolvedAt: new Date() } : alert
      ));
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-500';
      case ErrorSeverity.HIGH:
        return 'bg-orange-500';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-500';
      case ErrorSeverity.LOW:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      case ErrorSeverity.HIGH:
        return 'destructive';
      case ErrorSeverity.MEDIUM:
        return 'secondary';
      case ErrorSeverity.LOW:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'threshold':
        return <TrendingUp className="h-4 w-4" />;
      case 'spike':
        return <Activity className="h-4 w-4" />;
      case 'new_error':
        return <Bug className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Dashboard</h1>
          <p className="text-gray-600">Monitor and manage application errors</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Alert Banner */}
      {unacknowledgedAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length !== 1 ? 's' : ''} 
            that require attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                <Bug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalErrors || 0}</div>
                <p className="text-xs text-muted-foreground">Last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.errorRate.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Errors per minute</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unacknowledgedAlerts.length}</div>
                <p className="text-xs text-muted-foreground">Unacknowledged</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics?.errorRate || 0) < 1 ? 'Good' : 'Warning'}
                </div>
                <p className="text-xs text-muted-foreground">Overall status</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Errors by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics?.errorsBySeverity || {}).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity as ErrorSeverity)}`} />
                        <span className="capitalize">{severity}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Errors by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics?.errorsByCategory || {}).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Error Alerts</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Mark All Read
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-medium">No alerts</p>
                    <p className="text-gray-600">All systems are running smoothly</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className={`${!alert.acknowledged ? 'border-red-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                            {!alert.acknowledged && (
                              <Badge variant="destructive">New</Badge>
                            )}
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{alert.timestamp.toLocaleString()}</span>
                            </span>
                            <span>Errors: {alert.errorCount}</span>
                            <span>Window: {alert.timeWindow}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            <BellOff className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        {!alert.resolvedAt && (
                          <Button
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Errors</h2>
          
          <div className="space-y-3">
            {recentErrors.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-medium">No recent errors</p>
                    <p className="text-gray-600">System is running smoothly</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              recentErrors.map((errorLog) => (
                <Card key={errorLog.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={getSeverityBadgeVariant(errorLog.error.severity)}>
                            {errorLog.error.severity}
                          </Badge>
                          <Badge variant="outline">
                            {errorLog.error.category}
                          </Badge>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {errorLog.error.code}
                          </code>
                        </div>
                        <p className="font-medium mb-1">{errorLog.error.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{errorLog.timestamp.toLocaleString()}</span>
                          </span>
                          {errorLog.error.context.component && (
                            <span>Component: {errorLog.error.context.component}</span>
                          )}
                          {errorLog.userId && (
                            <span>User: {errorLog.userId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Error Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Error Types</CardTitle>
                <CardDescription>Most frequent errors in the last hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.topErrors.slice(0, 5).map((error, index) => (
                    <div key={error.code} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {error.code}
                        </code>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{error.count}</div>
                        <div className="text-xs text-gray-600">
                          {error.lastOccurrence.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-600">No error data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Components with Most Errors</CardTitle>
                <CardDescription>Error distribution by component</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics?.errorsByComponent || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([component, count], index) => (
                      <div key={component} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{component}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(metrics?.errorsByComponent || {}).length === 0 && (
                    <p className="text-gray-600">No component data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorDashboard;