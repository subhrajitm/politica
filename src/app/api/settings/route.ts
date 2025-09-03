import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/settingsService';

export async function GET() {
  try {
    const settings = await SettingsService.getAllSettings();
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid updates object' },
        { status: 400 }
      );
    }

    await SettingsService.updateMultipleSettings(updates);
    
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
