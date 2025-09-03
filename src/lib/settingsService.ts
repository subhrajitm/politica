import { supabase } from './supabase';

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export class SettingsService {
  static async getAllSettings(): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }

    return data || [];
  }

  static async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Table doesn't exist or no rows found
          console.warn(`Setting ${key} not found - table may not exist yet`);
          return null;
        }
        console.error(`Error fetching setting ${key}:`, error);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.error(`Unexpected error fetching setting ${key}:`, error);
      return null;
    }
  }

  static async updateSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key);

    if (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw new Error(`Failed to update setting ${key}`);
    }
  }

  static async updateMultipleSettings(updates: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      await this.updateSetting(key, value);
    }
  }

  static async getSiteName(): Promise<string> {
    return await this.getSetting('site_name') || 'PolitiFind';
  }

  static async getSiteDescription(): Promise<string> {
    return await this.getSetting('site_description') || 'Find Politicians In Your Area';
  }

  static async getContactEmail(): Promise<string> {
    return await this.getSetting('contact_email') || 'contact@politifind.com';
  }

  static async getRequireApproval(): Promise<boolean> {
    const value = await this.getSetting('require_approval');
    return value === 'true';
  }

  static async getEnablePublicContributions(): Promise<boolean> {
    const value = await this.getSetting('enable_public_contributions');
    return value === 'true';
  }
}
