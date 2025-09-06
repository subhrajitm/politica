import { NextRequest, NextResponse } from 'next/server';
import { PoliticalPartyService } from '@/lib/politicalPartyService';

// Cache the response for 5 minutes
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('API: Fetching party with ID:', id);
    
    const startTime = Date.now();
    const party = await PoliticalPartyService.getPartyById(id);
    const endTime = Date.now();
    
    console.log(`API: Party fetch took ${endTime - startTime}ms`);

    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Political party not found' },
        { status: 404 }
      );
    }

    // Set cache headers for better performance
    const response = NextResponse.json({
      success: true,
      data: party,
      cached: true,
      timestamp: new Date().toISOString()
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('API: Error fetching party:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch political party' },
      { status: 500 }
    );
  }
}