/**
 * Real-time System Demo Component
 * Demonstrates the real-time functionality for testing and development
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  useRealtime, 
  usePoliticianRealtime, 
  useNotifications, 
  useConnectionHealth 
} from '@/hooks/use-realtime';
import { politicianEventManager } from '@/lib/realtime/PoliticianEvents';
import { notificationSystem } from '@/lib/realtime/NotificationSystem';
import { ActivityIndicator, LiveUserCount, ActivityFeed } from './ActivityIndicator';
import { NotificationCenter, ToastNotifications } from './NotificationCenter';

export function RealtimeDemo() {
  const [testPoliticianId, setTestPoliticianId] = useState('demo-politician-123');
  const [testMessage, setTestMessage] = useState('Test notification message');
  
  const { isConnected, connectionStatus, error } = useRealtime();
  const { health, isHealthy } = useConnectionHealth();
  const { notifications, unreadCount, showNotification } = useNotifications();
  const politicianRealtime = usePoliticianRealtime(testPoliticianId);

  const handleEmitUpdate = async () => {
    try {
      await politicianEventManager.emitPoliticianUpdate(
        testPoliticianId,
        [
          { field: 'name', oldValue: 'Old Name', newValue: 'Updated Name' },
          { field: 'position', oldValue: 'Old Position', newValue: 'New Position' },
        ],
        'demo-user',
        true
      );
    } catch (error) {
      console.error('Failed to emit update:', error);
    }
  };

  const handleEmitActivity = async (activityType: 'view' | 'favorite' | 'share' | 'comment') => {
    try {
      await politicianEventManager.emitPoliticianActivity(
        testPoliticianId,
        activityType,
        `demo-user-${Math.random().toString(36).substr(2, 5)}`,
        { source: 'demo', timestamp: Date.now() }
      );
    } catch (error) {
      console.error('Failed to emit activity:', error);
    }
  };

  const handleEmitNews = async () => {
    try {
      await politicianEventManager.emitNewsUpdate(
        testPoliticianId,
        {
          id: `news-${Date.now()}`,
          title: 'Breaking: Demo News Update',
          summary: 'This is a demo news update for testing purposes',
          source: 'Demo News',
          publishedAt: Date.now(),
        },
        true
      );
    } catch (error) {
      console.error('Failed to emit news:', error);
    }
  };

  const handleShowNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    showNotification(
      type,
      `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      testMessage,
      {
        actions: type === 'info' ? [
          {
            id: 'demo_action',
            label: 'Demo Action',
            action: () => alert('Demo action executed!'),
          },
        ] : undefined,
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time System Demo</h2>
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error.message}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connection Status
              <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <strong>Supabase:</strong> {health?.supabase || 'Unknown'}
            </div>
            <div className="text-sm">
              <strong>WebSocket:</strong> {health?.isWebSocketConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-sm">
              <strong>Notifications:</strong> {unreadCount} unread
            </div>
            {connectionStatus && (
              <div className="text-xs text-muted-foreground mt-2">
                <pre>{JSON.stringify(connectionStatus, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Politician Events */}
        <Card>
          <CardHeader>
            <CardTitle>Politician Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="politician-id">Politician ID</Label>
              <Input
                id="politician-id"
                value={testPoliticianId}
                onChange={(e) => setTestPoliticianId(e.target.value)}
                placeholder="Enter politician ID"
              />
            </div>

            <div className="space-y-2">
              <Button onClick={handleEmitUpdate} size="sm" className="w-full">
                Emit Update Event
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleEmitActivity('view')} size="sm" variant="outline">
                  View
                </Button>
                <Button onClick={() => handleEmitActivity('favorite')} size="sm" variant="outline">
                  Favorite
                </Button>
                <Button onClick={() => handleEmitActivity('share')} size="sm" variant="outline">
                  Share
                </Button>
                <Button onClick={() => handleEmitActivity('comment')} size="sm" variant="outline">
                  Comment
                </Button>
              </div>

              <Button onClick={handleEmitNews} size="sm" variant="secondary" className="w-full">
                Emit News Update
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Real-time Status:</div>
              <Badge variant={politicianRealtime.isActive ? 'default' : 'secondary'}>
                {politicianRealtime.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <div className="text-xs text-muted-foreground">
                Activities: {politicianRealtime.activityCount}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notification-message">Message</Label>
              <Input
                id="notification-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter notification message"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => handleShowNotification('info')} size="sm" variant="outline">
                Info
              </Button>
              <Button onClick={() => handleShowNotification('success')} size="sm" variant="outline">
                Success
              </Button>
              <Button onClick={() => handleShowNotification('warning')} size="sm" variant="outline">
                Warning
              </Button>
              <Button onClick={() => handleShowNotification('error')} size="sm" variant="outline">
                Error
              </Button>
            </div>

            <Separator />

            <div className="text-sm">
              <strong>Total:</strong> {notifications.length}<br />
              <strong>Unread:</strong> {unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <ActivityIndicator politicianId={testPoliticianId} />
            <LiveUserCount politicianId={testPoliticianId} />
          </div>
          
          <Separator />
          
          <ActivityFeed politicianId={testPoliticianId} maxItems={5} />
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <ToastNotifications position="top-right" />
    </div>
  );
}