import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/lib/searchService'
import { AppError } from '@/lib/errors/AppError'
import { RetryMechanism } from '@/lib/errors/RetryMechanism'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const politicianId = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '5')

    // Validate politician ID
    if (!politicianId) {
      throw new AppError(
        'Politician ID is required',
        'VALIDATION_ERROR',
        'medium',
        { politicianId },
        true,
        'Please provide a politician ID'
      )
    }

    // Get related politicians with retry mechanism
    const relatedPoliticians = await RetryMechanism.execute(
      () => SearchService.getRelatedPoliticians(politicianId, limit),
      {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        maxDelay: 500
      }
    )

    return NextResponse.json({
      success: true,
      data: relatedPoliticians,
      politicianId,
      total: relatedPoliticians.length
    })

  } catch (error) {
    console.error('Related politicians API error:', error)
    
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
        error: 'Internal server error getting related politicians' 
      },
      { status: 500 }
    )
  }
}