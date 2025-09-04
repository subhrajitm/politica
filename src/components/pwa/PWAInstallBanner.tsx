/**
 * PWA Installation Banner Component
 */

'use client';

import { useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstallBanner } from '@/hooks/use-pwa';

export function PWAInstallBanner() {
  const { showBanner, dismissBanner, install } = usePWAInstallBanner();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!showBanner) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-blue-200 bg-blue-50 shadow-lg md:left-auto md:right-4 md:w-96">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-900">
              Install PolitiFind
            </h3>
            <p className="text-xs text-blue-700 mt-1">
              Get the full app experience with offline access and notifications
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-3 w-3 mr-1" />
                {isInstalling ? 'Installing...' : 'Install'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissBanner}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                Not now
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={dismissBanner}
            className="flex-shrink-0 h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PWAInstallButton() {
  const { showBanner, install } = usePWAInstallBanner();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!showBanner) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  );
}