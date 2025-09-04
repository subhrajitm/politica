import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '@/lib/recommendationEngine'
import { AppError } from '@/lib/errors/AppError'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.userId || !body.recommendationId || !body.feedback) {
      throw new AppError(
        'User ID, recommendation ID, and feedback are required',
        'VALIDATION_ERROR',
        'medium',
        { body },
        true,
        'Please provide all required fields for feedback'
      )
    }

    const validFeedback = ['like', 'dislike', 'not_interested', 'clicked']
    if (!validFeedback.includes(body.feedback)) {
      throw new AppError(
        'Invalid feedback type',
        'VALIDATION_ERROR',
        'medium',
        { feedback: body.feedback, validFeedback },
        true,
        'Please provide valid feedback type'
      )
    }

    // Update recommendation models with feedback
    await RecommendationEngine.updateRecommendationModels(
      body.userId,
      body.recommendationId,
      body.feedback
    )

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: {
        userId: body.userId,
        recommendationId: body.recommendationId,
        feedback: body.feedback,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Recommendation feedback API error:', error)
    
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
        error: 'Internal server error recording feedback' 
      },
      { status: 500 }
    )
  }
}