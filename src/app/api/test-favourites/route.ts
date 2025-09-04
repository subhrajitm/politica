import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Test if user_favourites table exists and is accessible
    const { data, error } = await supabase
      .from('user_favourites')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    // Test if politicians table exists and is accessible
    const { data: politiciansData, error: politiciansError } = await supabase
      .from('politicians')
      .select('id, full_name')
      .limit(1);

    if (politiciansError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Politicians table error: ' + politiciansError.message,
        politiciansError
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Favourites table is accessible',
      favouritesCount: data?.length || 0,
      politiciansCount: politiciansData?.length || 0,
      samplePolitician: politiciansData?.[0] || null
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Unknown error',
      details: err 
    }, { status: 500 });
  }
}
