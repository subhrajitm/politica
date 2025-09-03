# Settings System Setup

This document explains how to set up and use the new dynamic settings system for the Politica application.

## Overview

The settings system allows administrators to dynamically configure various aspects of the application without needing to modify code or restart the server. Settings are stored in a database and can be updated through the admin interface.

## Database Setup

### 1. Run the Updated Schema

The settings system requires a new `settings` table. Run the updated `supabase-schema.sql` file in your Supabase SQL editor to create the table and insert default values.

### 2. Default Settings

The following default settings are automatically created:

- `site_name`: "PolitiFind" - The name of the website
- `site_description`: "Find Politicians In Your Area" - The description of the website
- `contact_email`: "contact@politifind.com" - Contact email address
- `require_approval`: "true" - Whether to require admin approval for new submissions
- `enable_public_contributions`: "false" - Whether to enable public contributions

## Components

### SettingsService (`src/lib/settingsService.ts`)

A service class that handles all database operations for settings:

- `getAllSettings()`: Fetch all settings
- `getSetting(key)`: Get a specific setting by key
- `updateSetting(key, value)`: Update a single setting
- `updateMultipleSettings(updates)`: Update multiple settings at once
- Helper methods for common settings (e.g., `getSiteName()`, `getContactEmail()`)

### useSettings Hook (`src/hooks/use-settings.ts`)

A React hook that provides access to settings throughout the application:

```typescript
const { siteName, siteDescription, contactEmail, requireApproval, enablePublicContributions } = useSettings();
```

### Admin Settings Page (`src/app/admin/settings/page.tsx`)

A fully functional admin interface for managing settings with:

- Form inputs for text-based settings
- Checkboxes for boolean settings
- Real-time validation and error handling
- Toast notifications for success/error feedback
- Automatic form state management

### API Endpoints (`src/app/api/settings/route.ts`)

RESTful API endpoints for settings:

- `GET /api/settings`: Fetch all settings
- `PUT /api/settings`: Update multiple settings

## Usage

### 1. Access Settings in Components

```typescript
import { useSettings } from '@/hooks/use-settings';

export default function MyComponent() {
  const { siteName, contactEmail } = useSettings();
  
  return (
    <div>
      <h1>Welcome to {siteName}</h1>
      <p>Contact us at {contactEmail}</p>
    </div>
  );
}
```

### 2. Update Settings Programmatically

```typescript
import { SettingsService } from '@/lib/settingsService';

// Update a single setting
await SettingsService.updateSetting('site_name', 'New Site Name');

// Update multiple settings
await SettingsService.updateMultipleSettings({
  site_name: 'New Site Name',
  contact_email: 'new@email.com'
});
```

### 3. Admin Interface

Navigate to `/admin/settings` to access the settings management interface. Changes are saved immediately to the database and reflected throughout the application.

## Dynamic Updates

The settings system automatically updates the following areas when changed:

- **Page Title**: Updates dynamically using the `DynamicTitle` component
- **Header**: Site name in navigation and mobile menu
- **Footer**: Site name in branding and copyright notice
- **Admin Settings**: All form fields and checkboxes

## Security

- Settings are protected by Row Level Security (RLS) policies
- Currently set to allow all operations for development
- In production, consider restricting access to admin users only

## Future Enhancements

Potential additions to the settings system:

- User roles and permissions
- Theme customization
- API rate limiting settings
- Notification preferences
- Multi-language support
- Cache invalidation for settings changes

## Troubleshooting

### Settings Not Loading

1. Check that the `settings` table exists in your database
2. Verify the Supabase connection is working
3. Check browser console for error messages

### Changes Not Reflecting

1. Ensure the component is using the `useSettings` hook
2. Check that the `DynamicTitle` component is included in the layout
3. Verify the database update was successful

### Database Errors

1. Check Supabase logs for detailed error messages
2. Verify the table schema matches the expected structure
3. Ensure RLS policies are properly configured
