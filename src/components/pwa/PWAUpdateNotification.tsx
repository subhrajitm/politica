/**
 * PWA Update Notification Component
 */

'use client';

import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';

export function PWAUpdateNotification() {
  const { isUpdateAvailable, applyUpdate } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isUpdateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await applyUpdate();
    } catch (error) {
      console.error('Failed to apply update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 border-green-200 bg-green-50 shadow-lg md:left-auto md:right-4 md:w-96">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-6 w-6 text-green-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-green-900">
              Update Available
            </h3>
            <p className="text-xs text-green-700 mt-1">
              A new version of PolitiFind is ready to install
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updating...' : 'Update Now'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                Later
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}