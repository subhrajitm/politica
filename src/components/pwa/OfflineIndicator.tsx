/**
 * Offline Indicator Component
 */

'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOffline } from '@/hooks/use-offline';

export function OfflineIndicator() {
  const { isOnline, isOffline, syncQueueLength, isSyncing, forceSync } = useOffline();
  const [showDetails, setShowDetails] = useState(false);

  // Don't render during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  if (isOnline && syncQueueLength === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Card className={`shadow-lg transition-all duration-300 ${
        isOffline ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div className={`flex-shrink-0 ${
              isOffline ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {isOffline ? (
                <WifiOff className="h-5 w-5" />
              ) : isSyncing ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>

            {/* Status Text */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${
                isOffline ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {isOffline ? 'Offline Mode' : isSyncing ? 'Syncing...' : 'Sync Pending'}
              </div>
              
              {syncQueueLength > 0 && (
                <div className={`text-xs ${
                  isOffline ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {syncQueueLength} {syncQueueLength === 1 ? 'item' : 'items'} to sync
                </div>
              )}
            </div>

            {/* Sync Queue Badge */}
            {syncQueueLength > 0 && (
              <Badge variant="secondary" className="text-xs">
                {syncQueueLength}
              </Badge>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              {isOnline && syncQueueLength > 0 && !isSyncing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => forceSync()}
                  className={`h-6 px-2 text-xs ${
                    isOffline 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-100' 
                      : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className={`h-6 px-2 text-xs ${
                  isOffline 
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-100' 
                    : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                {showDetails ? '−' : '+'}
              </Button>
            </div>
          </div>

          {/* Details Panel */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className={`font-medium ${
                    isOnline ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                {syncQueueLength > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending sync:</span>
                    <span className="font-medium">{syncQueueLength} items</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">
                    {isSyncing ? 'Syncing...' : isOffline ? 'Offline mode' : 'Ready'}
                  </span>
                </div>
              </div>

              {isOffline && (
                <div className={`mt-2 p-2 rounded text-xs ${
                  isOffline ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className="font-medium mb-1">Offline Features Available:</div>
                  <ul className="space-y-0.5 text-xs">
                    <li>• View cached politicians</li>
                    <li>• Access saved favourites</li>
                    <li>• Browse offline content</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function OfflineStatusBar() {
  const { isOffline, syncQueueLength } = useOffline();

  // Don't render during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isOffline && syncQueueLength === 0) {
    return null;
  }

  return (
    <div className={`w-full py-1 px-4 text-center text-sm ${
      isOffline ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {isOffline ? (
          <WifiOff className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        
        <span>
          {isOffline 
            ? 'You are offline - some features may be limited'
            : `${syncQueueLength} items pending sync`
          }
        </span>
      </div>
    </div>
  );
}