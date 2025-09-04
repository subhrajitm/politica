/**
 * API endpoint for sending alert notifications
 * Handles email and other notification channels
 */

import { NextRequest, NextResponse } from 'next/server';
import { ErrorAlert } from '@/lib/monitoring/ErrorTracker';

// Simple email notification function (can be replaced with proper email service)
async function sendEmailAlert(alert: ErrorAlert): Promise<boolean> {
  try {
    // In a real implementation, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Supabase Edge Functions with email
    
    console.log('📧 Email Alert:', {
      subject: `[PolitiFind] ${alert.type.toUpperCase()} Alert`,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp
    });

    // For now, just log the alert
    // In production, implement actual email sending
    return true;
  } catch (error) {
    console.error('Failed to send email alert:', error);
    return false;
  }
}

// Simple webhook notification function
async function sendWebhookAlert(alert: ErrorAlert): Promise<boolean> {
  try {
    const webhookUrl = process.env.ERROR_WEBHOOK_URL;
    if (!webhookUrl) {
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `🚨 PolitiFind Alert: ${alert.message}`,
        attachments: [
          {
            color: alert.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              {
                title: 'Type',
                value: alert.type,
                short: true
              },
              {
                title: 'Severity',
                value: alert.severity,
                short: true
              },
              {
                title: 'Error Count',
                value: alert.errorCount.toString(),
                short: true
              },
              {
                title: 'Time Window',
                value: alert.timeWindow,
                short: true
              }
            ],
            ts: Math.floor(alert.timestamp.getTime() / 1000)
          }
        ]
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send webhook alert:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const alert: ErrorAlert = await request.json();

    // Validate alert data
    if (!alert.id || !alert.type || !alert.message) {
      return NextResponse.json(
        { error: 'Invalid alert data' },
        { status: 400 }
      );
    }

    const results = {
      email: false,
      webhook: false
    };

    // Send email notification for high severity alerts
    if (alert.severity === 'critical' || alert.severity === 'high') {
      results.email = await sendEmailAlert(alert);
    }

    // Send webhook notification for all alerts
    results.webhook = await sendWebhookAlert(alert);

    // Log the alert to console for development
    console.log('🚨 Alert Notification:', {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp,
      results
    });

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error in alert notification endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}