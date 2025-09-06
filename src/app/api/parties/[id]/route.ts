import { NextRequest, NextResponse } from 'next/server';
import { PoliticalPartyService } from '@/lib/politicalPartyService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const party = await PoliticalPartyService.getPartyById(params.id);

    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Political party not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: party
    });
  } catch (error) {
    console.error('Error fetching party:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch political party' },
      { status: 500 }
    );
  }
}
