/**
 * API endpoint for tracking errors
 * Stores error logs in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const errorData = await request.json();

    // Validate required fields
    if (!errorData.id || !errorData.error_code || !errorData.error_message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert error log into database
    const { error } = await supabase
      .from('error_logs')
      .insert({
        id: errorData.id,
        timestamp: errorData.timestamp,
        error_code: errorData.error_code,
        error_message: errorData.error_message,
        error_category: errorData.error_category,
        error_severity: errorData.error_severity,
        component: errorData.component,
        user_id: errorData.user_id,
        session_id: errorData.session_id,
        url: errorData.url,
        user_agent: errorData.user_agent,
        stack_trace: errorData.stack_trace,
        context: errorData.context,
        breadcrumbs: errorData.breadcrumbs
      });

    if (error) {
      console.error('Error storing error log:', error);
      return NextResponse.json(
        { error: 'Failed to store error log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in error tracking endpoint:', error);
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
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const component = searchParams.get('component');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('error_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (severity) {
      query = query.eq('error_severity', severity);
    }
    if (category) {
      query = query.eq('error_category', category);
    }
    if (component) {
      query = query.eq('component', component);
    }
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching error logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch error logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in error logs endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}