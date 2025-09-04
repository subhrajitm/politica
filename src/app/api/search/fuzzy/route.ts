import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/lib/searchService'
import { AppError } from '@/lib/errors/AppError'
import { RetryMechanism } from '@/lib/errors/RetryMechanism'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const threshold = parseFloat(searchParams.get('threshold') || '0.3')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate parameters
    if (!query || query.trim().length < 2) {
      throw new AppError(
        'Query must be at least 2 characters long',
        'VALIDATION_ERROR',
        'low',
        { query },
        true,
        'Please enter at least 2 characters to search'
      )
    }

    if (threshold < 0 || threshold > 1) {
      throw new AppError(
        'Threshold must be between 0 and 1',
        'VALIDATION_ERROR',
        'low',
        { threshold },
        true,
        'Invalid similarity threshold'
      )
    }

    // Perform fuzzy search with retry mechanism
    const results = await RetryMechanism.execute(
      () => SearchService.fuzzySearch(query.trim(), threshold, limit),
      {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        maxDelay: 500
      }
    )

    return NextResponse.json({
      success: true,
      data: results,
      query: query.trim(),
      threshold,
      total: results.length
    })

  } catch (error) {
    console.error('Fuzzy search API error:', error)
    
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
        error: 'Internal server error during fuzzy search' 
      },
      { status: 500 }
    )
  }
}