'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

export default function DynamicTitle() {
  const { siteName, siteDescription } = useSettings();

  useEffect(() => {
    if (siteName && siteDescription) {
      document.title = `${siteName} - ${siteDescription}`;
    }
  }, [siteName, siteDescription]);

  return null; // This component doesn't render anything
}
