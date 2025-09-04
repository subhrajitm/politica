import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/lib/searchService'
import { AppError } from '@/lib/errors/AppError'
import { RetryMechanism } from '@/lib/errors/RetryMechanism'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Query too short for suggestions'
      })
    }

    // Get suggestions with retry mechanism
    const suggestions = await RetryMechanism.execute(
      () => SearchService.getSuggestions(query.trim(), limit),
      {
        maxAttempts: 2,
        backoffStrategy: 'linear',
        baseDelay: 50,
        maxDelay: 200
      }
    )

    return NextResponse.json({
      success: true,
      data: suggestions,
      query: query.trim()
    })

  } catch (error) {
    console.error('Search suggestions API error:', error)
    
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
        error: 'Internal server error getting suggestions',
        data: [] 
      },
      { status: 500 }
    )
  }
}