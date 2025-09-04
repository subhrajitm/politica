/**
 * API endpoint for storing alerts in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const alertData = await request.json();

    // Validate required fields
    if (!alertData.id || !alertData.type || !alertData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert alert into database
    const { error } = await supabase
      .from('error_alerts')
      .insert({
        id: alertData.id,
        type: alertData.type,
        severity: alertData.severity,
        message: alertData.message,
        timestamp: alertData.timestamp,
        error_count: alertData.errorCount,
        time_window: alertData.timeWindow,
        acknowledged: alertData.acknowledged,
        resolved_at: alertData.resolved_at
      });

    if (error) {
      console.error('Error storing alert:', error);
      return NextResponse.json(
        { error: 'Failed to store alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in alert storage endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unacknowledgedOnly = searchParams.get('unacknowledged') === 'true';
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');

    let query = supabase
      .from('error_alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (unacknowledgedOnly) {
      query = query.eq('acknowledged', false);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in alerts endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { id, acknowledged, resolved_at } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (acknowledged !== undefined) {
      updateData.acknowledged = acknowledged;
    }
    if (resolved_at !== undefined) {
      updateData.resolved_at = resolved_at;
    }

    const { error } = await supabase
      .from('error_alerts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in alert update endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}