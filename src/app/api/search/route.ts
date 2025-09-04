import { NextRequest, NextResponse } from 'next/server'
import { SearchService, type SearchQuery } from '@/lib/searchService'
import { AppError } from '@/lib/errors/AppError'
import { RetryMechanism } from '@/lib/errors/RetryMechanism'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId') || undefined
    
    // Extract filters
    const filters = {
      party: searchParams.getAll('party').filter(Boolean),
      constituency: searchParams.getAll('constituency').filter(Boolean),
      position: searchParams.getAll('position').filter(Boolean),
      gender: searchParams.getAll('gender').filter(Boolean),
      languages: searchParams.getAll('language').filter(Boolean),
      committees: searchParams.getAll('committee').filter(Boolean)
    }

    // Extract location if provided
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    
    const location = lat && lng ? {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius: radius ? parseFloat(radius) : undefined
    } : undefined

    // Build search query
    const searchQuery: SearchQuery = {
      text: query,
      filters: Object.keys(filters).some(key => filters[key as keyof typeof filters].length > 0) ? filters : undefined,
      location,
      userId,
      limit,
      offset
    }

    // Perform search with retry mechanism
    const searchResults = await RetryMechanism.execute(
      () => SearchService.search(searchQuery),
      {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        maxDelay: 1000
      }
    )

    return NextResponse.json({
      success: true,
      data: searchResults,
      query: searchQuery
    })

  } catch (error) {
    console.error('Search API error:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code 
        },
        { status: error.code === 'VALIDATION_ERROR' ? 400 : 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during search' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.query) {
      throw new AppError(
        'Search query is required',
        'VALIDATION_ERROR',
        'medium',
        { body },
        true,
        'Please provide a search query'
      )
    }

    const searchQuery: SearchQuery = {
      text: body.query,
      filters: body.filters,
      location: body.location,
      userId: body.userId,
      limit: body.limit || 20,
      offset: body.offset || 0
    }

    // Perform search with retry mechanism
    const searchResults = await RetryMechanism.execute(
      () => SearchService.search(searchQuery),
      {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        maxDelay: 1000
      }
    )

    return NextResponse.json({
      success: true,
      data: searchResults,
      query: searchQuery
    })

  } catch (error) {
    console.error('Search API error:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code 
        },
        { status: error.code === 'VALIDATION_ERROR' ? 400 : 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during search' 
      },
      { status: 500 }
    )
  }
}