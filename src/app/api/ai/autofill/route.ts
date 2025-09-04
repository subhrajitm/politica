import { NextRequest, NextResponse } from 'next/server';
import { autofillPoliticianByName } from '@/ai/flows/autofill-politician';
import { createClient } from '@/lib/supabase-server';
import { getServerUser } from '@/lib/authUtilsServer';

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication using server-side utility
    const { user, error: authError } = await getServerUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Create server-side Supabase client for database operations
    const supabase = createClient();
    
    // Verify user is admin (since this is used in admin pages)
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminError || !adminProfile) {
      // Check hardcoded admin emails as fallback
      const adminEmails = ['admin@politifind.com', 'superadmin@politifind.com'];
      if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
        return NextResponse.json({ 
          error: 'Admin privileges required' 
        }, { status: 403 });
      }
    }

    const body = await req.json();
    const name = String(body?.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const data = await autofillPoliticianByName({ name });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error('AI autofill error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to autofill' }, { status: 500 });
  }
}


