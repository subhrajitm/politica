import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine, type RecommendationRequest } from '@/lib/recommendationEngine'
import { AppError } from '@/lib/errors/AppError'
import { RetryMechanism } from '@/lib/errors/RetryMechanism'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') as 'politician' | 'content' | 'search' || 'politician'
    const limit = parseInt(searchParams.get('limit') || '10')
    const excludeIds = searchParams.getAll('exclude')
    
    // Validate required parameters
    if (!userId) {
      throw new AppError(
        'User ID is required for recommendations',
        'VALIDATION_ERROR',
        'medium',
        { userId },
        true,
        'Please provide a user ID to get personalized recommendations'
      )
    }

    // Build recommendation request
    const recommendationRequest: RecommendationRequest = {
      userId,
      type,
      limit,
      excludeIds,
      context: {
        currentPoliticianId: searchParams.get('currentPoliticianId') || undefined,
        searchQuery: searchParams.get('searchQuery') || undefined,
        location: searchParams.get('lat') && searchParams.get('lng') ? {
          latitude: parseFloat(searchParams.get('lat')!),
          longitude: parseFloat(searchParams.get('lng')!)
        } : undefined,
        timeOfDay: searchParams.get('timeOfDay') as any || undefined,
        deviceType: searchParams.get('deviceType') as any || undefined
      }
    }

    // Generate recommendations with retry mechanism
    const recommendations = await RetryMechanism.execute(
      () => RecommendationEngine.generateRecommendations(recommendationRequest),
      {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        maxDelay: 1000
      }
    )

    return NextResponse.json({
      success: true,
      data: recommendations,
      request: recommendationRequest
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    
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
        error: 'Internal server error generating recommendations' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.userId) {
      throw new AppError(
        'User ID is required for recommendations',
        'VALIDATION_ERROR',
        'medium',
        { body },
        true,
        'Please provide a user ID to get personalized recommendations'
      )
    }

    const recommendationRequest: RecommendationRequest = {
      userId: body.userId,
      type: body.type || 'politician',
      context: body.context,
      limit: body.limit || 10,
      excludeIds: body.excludeIds || []
    }

    // Generate recommendations with retry mechanism
    const recommendations = await RetryMechanism.execute(
      () => RecommendationEngine.generateRecommendations(recommendationRequest),
      {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        maxDelay: 1000
      }
    )

    return NextResponse.json({
      success: true,
      data: recommendations,
      request: recommendationRequest
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    
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
        error: 'Internal server error generating recommendations' 
      },
      { status: 500 }
    )
  }
}