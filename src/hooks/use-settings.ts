import { useState, useEffect } from 'react';
import { SettingsService } from '@/lib/settingsService';

export function useSettings() {
  const [siteName, setSiteName] = useState<string>('PolitiFind');
  const [siteDescription, setSiteDescription] = useState<string>('Find Politicians In Your Area');
  const [contactEmail, setContactEmail] = useState<string>('contact@politifind.com');
  const [requireApproval, setRequireApproval] = useState<boolean>(true);
  const [enablePublicContributions, setEnablePublicContributions] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [name, description, email, approval, contributions] = await Promise.all([
        SettingsService.getSiteName().catch(() => 'PolitiFind'),
        SettingsService.getSiteDescription().catch(() => 'Find Politicians In Your Area'),
        SettingsService.getContactEmail().catch(() => 'contact@politifind.com'),
        SettingsService.getRequireApproval().catch(() => true),
        SettingsService.getEnablePublicContributions().catch(() => false),
      ]);

      setSiteName(name);
      setSiteDescription(description);
      setContactEmail(email);
      setRequireApproval(approval);
      setEnablePublicContributions(contributions);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    loadSettings();
  };

  return {
    siteName,
    siteDescription,
    contactEmail,
    requireApproval,
    enablePublicContributions,
    loading,
    refreshSettings,
  };
}
