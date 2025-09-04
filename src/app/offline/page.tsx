/**
 * Offline fallback page for PWA
 */

'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Home, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Status Icon */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isOnline ? (
              <Wifi className="w-10 h-10" />
            ) : (
              <WifiOff className="w-10 h-10" />
            )}
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isOnline 
                ? 'Your internet connection has been restored. You can now access all features.'
                : 'It looks like you\'re not connected to the internet. Some features may be limited.'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isOnline ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleGoHome}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
                
                <div className="text-center text-sm text-gray-500">
                  Connection restored after {retryCount} {retryCount === 1 ? 'attempt' : 'attempts'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Offline Actions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Available Offline:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/favourites">
                      <Button variant="outline" className="w-full justify-start">
                        <Heart className="w-4 h-4 mr-2" />
                        View Saved Politicians
                      </Button>
                    </Link>
                    
                    <Link href="/browse">
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Cached Content
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Retry Button */}
                <Button 
                  onClick={handleRetry}
                  variant="default"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                {/* Tips */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Try switching between WiFi and mobile data</li>
                    <li>• Some content is available offline</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500">
          <p>PolitiFind works offline with cached content</p>
          <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}