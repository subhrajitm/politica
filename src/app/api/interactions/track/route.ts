import { NextRequest, NextResponse } from 'next/server'
import { UserInteractionService, type InteractionType } from '@/lib/userInteractionService'
import { AppError } from '@/lib/errors/AppError'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.userId || !body.sessionId || !body.type || !body.targetType || !body.targetId) {
      throw new AppError(
        'Required fields missing for interaction tracking',
        'VALIDATION_ERROR',
        'low', // Low severity as this shouldn't break user experience
        { body },
        true,
        'Please provide all required fields for interaction tracking'
      )
    }

    const validTypes: InteractionType[] = ['view', 'search', 'favorite', 'unfavorite', 'share', 'click', 'hover', 'scroll']
    const validTargetTypes = ['politician', 'search', 'page', 'feature']

    if (!validTypes.includes(body.type)) {
      throw new AppError(
        'Invalid interaction type',
        'VALIDATION_ERROR',
        'low',
        { type: body.type, validTypes },
        true,
        'Invalid interaction type provided'
      )
    }

    if (!validTargetTypes.includes(body.targetType)) {
      throw new AppError(
        'Invalid target type',
        'VALIDATION_ERROR',
        'low',
        { targetType: body.targetType, validTargetTypes },
        true,
        'Invalid target type provided'
      )
    }

    // Track the interaction
    await UserInteractionService.trackInteraction({
      userId: body.userId,
      sessionId: body.sessionId,
      type: body.type,
      targetType: body.targetType,
      targetId: body.targetId,
      metadata: body.metadata || {},
      deviceInfo: body.deviceInfo,
      location: body.location
    })

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully',
      data: {
        userId: body.userId,
        type: body.type,
        targetType: body.targetType,
        targetId: body.targetId,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Interaction tracking API error:', error)
    
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
        error: 'Internal server error tracking interaction' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    if (!userId) {
      throw new AppError(
        'User ID is required',
        'VALIDATION_ERROR',
        'medium',
        { userId },
        true,
        'Please provide a user ID'
      )
    }

    let result
    
    if (type === 'profile') {
      // Get user profile with interaction history
      result = await UserInteractionService.getUserProfile(userId)
    } else if (type === 'preferences') {
      // Get user preferences only
      result = await UserInteractionService.getUserPreferences(userId)
    } else if (type === 'trending') {
      // Get trending politicians
      const timeWindow = parseInt(searchParams.get('timeWindow') || '86400000') // 24 hours default
      result = await UserInteractionService.getTrendingPoliticians(timeWindow)
    } else if (type === 'similar') {
      // Get similar users
      const limit = parseInt(searchParams.get('limit') || '10')
      result = await UserInteractionService.getSimilarUsers(userId, limit)
    } else {
      throw new AppError(
        'Invalid request type',
        'VALIDATION_ERROR',
        'medium',
        { type },
        true,
        'Please provide a valid request type (profile, preferences, trending, similar)'
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      type,
      userId
    })

  } catch (error) {
    console.error('Interaction data API error:', error)
    
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
        error: 'Internal server error getting interaction data' 
      },
      { status: 500 }
    )
  }
}