import { NextRequest, NextResponse } from 'next/server';
import { PoliticalPartyService } from '@/lib/politicalPartyService';

export async function POST(request: NextRequest) {
  try {
    const parties = await request.json();
    
    if (!Array.isArray(parties)) {
      return NextResponse.json(
        { success: false, error: 'Expected an array of parties' },
        { status: 400 }
      );
    }

    const createdParties = await PoliticalPartyService.bulkImportParties(parties);
    
    return NextResponse.json({
      success: true,
      data: createdParties,
      count: createdParties.length
    });
  } catch (error) {
    console.error('Error creating parties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create political parties' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('country');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let parties;

    if (search) {
      parties = await PoliticalPartyService.searchParties(search, countryCode || undefined);
    } else if (countryCode) {
      parties = await PoliticalPartyService.getPartiesByCountry(countryCode);
    } else if (type === 'ruling') {
      parties = await PoliticalPartyService.getRulingParties();
    } else if (type === 'parliamentary') {
      parties = await PoliticalPartyService.getParliamentaryParties();
    } else {
      parties = await PoliticalPartyService.getAllParties();
    }

    // Apply pagination
    const paginatedParties = parties.slice(offset, offset + limit);
    const total = parties.length;

    return NextResponse.json({
      success: true,
      data: paginatedParties,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch political parties' },
      { status: 500 }
    );
  }
}
