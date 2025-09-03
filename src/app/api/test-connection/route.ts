import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('politicians')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Unknown error',
      details: err 
    }, { status: 500 });
  }
}
