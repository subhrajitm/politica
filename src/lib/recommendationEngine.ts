import { supabase } from './supabase'
import { UserInteractionService, type UserPreferences } from './userInteractionService'
import { cacheService } from './cache/cacheService'
import type { SearchResultPolitician } from './searchService'

export interface RecommendationRequest {
  userId: string
  type: 'politician' | 'content' | 'search'
  context?: RecommendationContext
  limit?: number
  excludeIds?: string[]
}

export interface RecommendationContext {
  currentPoliticianId?: string
  searchQuery?: string
  location?: {
    latitude: number
    longitude: number
  }
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  deviceType?: 'mobile' | 'desktop' | 'tablet'
}

export interface Recommendation {
  id: string
  type: 'politician' | 'content'
  title: string
  description?: string
  imageUrl?: string
  score: number
  confidence: number
  reason: string
  algorithm: 'collaborative' | 'content_based' | 'hybrid' | 'trending' | 'location_based'
  metadata?: Record<string, any>
}

export interface RecommendationResult {
  recommendations: Recommendation[]
  totalScore: number
  algorithms: string[]
  generatedAt: Date
  userId: string
}

export class RecommendationEngine {
  private static readonly CACHE_TTL = 15 * 60 * 1000 // 15 minutes
  private static readonly MIN_INTERACTIONS_FOR_COLLABORATIVE = 5
  private static readonly ALGORITHM_WEIGHTS = {
    collaborative: 0.4,
    content_based: 0.3,
    trending: 0.2,
    location_based: 0.1
  }

  /**
   * Generate personalized recommendations for a user
   */
  static async generateRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    try {
      const cacheKey = `recommendations:${request.userId}:${JSON.stringify(request)}`
      
      // Check cache first
      const cached = await cacheService.get<RecommendationResult>(cacheKey)
      if (cached) {
        return cached
      }

      const { userId, type, context, limit = 10, excludeIds = [] } = request

      // Get user preferences and interaction history
      const userPreferences = await UserInteractionService.getUserPreferences(userId)
      
      // Generate recommendations using multiple algorithms
      const [
        collaborativeRecs,
        contentBasedRecs,
        trendingRecs,
        locationBasedRecs
      ] = await Promise.all([
        this.getCollaborativeRecommendations(userId, userPreferences, limit, excludeIds),
        this.getContentBasedRecommendations(userId, userPreferences, context, limit, excludeIds),
        this.getTrendingRecommendations(type, limit, excludeIds),
        this.getLocationBasedRecommendations(userId, context?.location, limit, excludeIds)
      ])

      // Combine and rank recommendations
      const combinedRecommendations = this.combineRecommendations([
        ...collaborativeRecs,
        ...contentBasedRecs,
        ...trendingRecs,
        ...locationBasedRecs
      ], limit)

      const result: RecommendationResult = {
        recommendations: combinedRecommendations,
        totalScore: combinedRecommendations.reduce((sum, rec) => sum + rec.score, 0),
        algorithms: [...new Set(combinedRecommendations.map(rec => rec.algorithm))],
        generatedAt: new Date(),
        userId
      }

      // Cache the result
      await cacheService.set(cacheKey, result, this.CACHE_TTL)

      return result
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return {
        recommendations: [],
        totalScore: 0,
        algorithms: [],
        generatedAt: new Date(),
        userId: request.userId
      }
    }
  }

  /**
   * Get collaborative filtering recommendations
   */
  private static async getCollaborativeRecommendations(
    userId: string,
    userPreferences: UserPreferences,
    limit: number,
    excludeIds: string[]
  ): Promise<Recommendation[]> {
    try {
      // Check if user has enough interactions for collaborative filtering
      if (userPreferences.viewedPoliticians.length < this.MIN_INTERACTIONS_FOR_COLLABORATIVE) {
        return []
      }

      // Use PostgreSQL function for collaborative filtering
      const { data: recommendations, error } = await supabase
        .rpc('get_personalized_recommendations', {
          target_user_id: userId,
          recommendation_type: 'politician',
          limit_count: limit
        })

      if (error) throw error

      const collaborativeRecs: Recommendation[] = []

      for (const rec of recommendations || []) {
        if (excludeIds.includes(rec.recommended_id)) continue

        // Get politician details
        const { data: politician } = await supabase
          .from('politicians')
          .select('id, full_name, party, constituency, current_position, photo_url')
          .eq('id', rec.recommended_id)
          .single()

        if (politician) {
          collaborativeRecs.push({
            id: politician.id,
            type: 'politician',
            title: politician.full_name,
            description: `${politician.current_position} from ${politician.constituency}`,
            imageUrl: politician.photo_url,
            score: rec.recommendation_score * this.ALGORITHM_WEIGHTS.collaborative,
            confidence: Math.min(0.95, rec.recommendation_score / 5),
            reason: rec.recommendation_reason,
            algorithm: 'collaborative',
            metadata: {
              party: politician.party,
              constituency: politician.constituency,
              position: politician.current_position
            }
          })
        }
      }

      return collaborativeRecs.slice(0, Math.ceil(limit * 0.4))
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error)
      return []
    }
  }

  /**
   * Get content-based recommendations
   */
  private static async getContentBasedRecommendations(
    userId: string,
    userPreferences: UserPreferences,
    context: RecommendationContext | undefined,
    limit: number,
    excludeIds: string[]
  ): Promise<Recommendation[]> {
    try {
      const contentBasedRecs: Recommendation[] = []

      // Recommend politicians from favorite parties
      if (userPreferences.favoriteParties.length > 0) {
        const { data: partyPoliticians } = await supabase
          .from('politicians')
          .select('id, full_name, party, constituency, current_position, photo_url')
          .in('party', userPreferences.favoriteParties)
          .not('id', 'in', `(${[...excludeIds, ...userPreferences.viewedPoliticians].join(',')})`)
          .limit(Math.ceil(limit * 0.5))

        for (const politician of partyPoliticians || []) {
          const partyIndex = userPreferences.favoriteParties.indexOf(politician.party)
          const score = (1 - partyIndex * 0.1) * this.ALGORITHM_WEIGHTS.content_based

          contentBasedRecs.push({
            id: politician.id,
            type: 'politician',
            title: politician.full_name,
            description: `${politician.current_position} from ${politician.constituency}`,
            imageUrl: politician.photo_url,
            score,
            confidence: 0.8 - partyIndex * 0.1,
            reason: `Member of ${politician.party}, one of your favorite parties`,
            algorithm: 'content_based',
            metadata: {
              party: politician.party,
              constituency: politician.constituency,
              position: politician.current_position,
              matchType: 'favorite_party'
            }
          })
        }
      }

      // Recommend politicians from favorite constituencies
      if (userPreferences.favoriteConstituencies.length > 0) {
        const { data: constituencyPoliticians } = await supabase
          .from('politicians')
          .select('id, full_name, party, constituency, current_position, photo_url')
          .in('constituency', userPreferences.favoriteConstituencies)
          .not('id', 'in', `(${[...excludeIds, ...userPreferences.viewedPoliticians].join(',')})`)
          .limit(Math.ceil(limit * 0.3))

        for (const politician of constituencyPoliticians || []) {
          const constituencyIndex = userPreferences.favoriteConstituencies.indexOf(politician.constituency)
          const score = (0.8 - constituencyIndex * 0.1) * this.ALGORITHM_WEIGHTS.content_based

          contentBasedRecs.push({
            id: politician.id,
            type: 'politician',
            title: politician.full_name,
            description: `${politician.current_position} from ${politician.constituency}`,
            imageUrl: politician.photo_url,
            score,
            confidence: 0.7 - constituencyIndex * 0.1,
            reason: `Represents ${politician.constituency}, one of your areas of interest`,
            algorithm: 'content_based',
            metadata: {
              party: politician.party,
              constituency: politician.constituency,
              position: politician.current_position,
              matchType: 'favorite_constituency'
            }
          })
        }
      }

      // Recommend politicians with similar positions
      if (userPreferences.favoritePositions.length > 0) {
        const { data: positionPoliticians } = await supabase
          .from('politicians')
          .select('id, full_name, party, constituency, current_position, photo_url')
          .in('current_position', userPreferences.favoritePositions)
          .not('id', 'in', `(${[...excludeIds, ...userPreferences.viewedPoliticians].join(',')})`)
          .limit(Math.ceil(limit * 0.2))

        for (const politician of positionPoliticians || []) {
          const positionIndex = userPreferences.favoritePositions.indexOf(politician.current_position)
          const score = (0.6 - positionIndex * 0.1) * this.ALGORITHM_WEIGHTS.content_based

          contentBasedRecs.push({
            id: politician.id,
            type: 'politician',
            title: politician.full_name,
            description: `${politician.current_position} from ${politician.constituency}`,
            imageUrl: politician.photo_url,
            score,
            confidence: 0.6 - positionIndex * 0.1,
            reason: `Holds position of ${politician.current_position}, similar to your interests`,
            algorithm: 'content_based',
            metadata: {
              party: politician.party,
              constituency: politician.constituency,
              position: politician.current_position,
              matchType: 'similar_position'
            }
          })
        }
      }

      return contentBasedRecs.slice(0, Math.ceil(limit * 0.3))
    } catch (error) {
      console.error('Error getting content-based recommendations:', error)
      return []
    }
  }

  /**
   * Get trending recommendations
   */
  private static async getTrendingRecommendations(
    type: string,
    limit: number,
    excludeIds: string[]
  ): Promise<Recommendation[]> {
    try {
      // Get trending politicians from interactions
      const trendingIds = await UserInteractionService.getTrendingPoliticians(24 * 60 * 60 * 1000)
      const filteredIds = trendingIds.filter(id => !excludeIds.includes(id))

      if (filteredIds.length === 0) return []

      const { data: trendingPoliticians } = await supabase
        .from('politicians')
        .select('id, full_name, party, constituency, current_position, photo_url')
        .in('id', filteredIds.slice(0, Math.ceil(limit * 0.3)))

      const trendingRecs: Recommendation[] = []

      for (let i = 0; i < (trendingPoliticians || []).length; i++) {
        const politician = trendingPoliticians![i]
        const trendingIndex = filteredIds.indexOf(politician.id)
        const score = (1 - trendingIndex * 0.05) * this.ALGORITHM_WEIGHTS.trending

        trendingRecs.push({
          id: politician.id,
          type: 'politician',
          title: politician.full_name,
          description: `${politician.current_position} from ${politician.constituency}`,
          imageUrl: politician.photo_url,
          score,
          confidence: 0.7 - trendingIndex * 0.02,
          reason: 'Trending now - popular among users',
          algorithm: 'trending',
          metadata: {
            party: politician.party,
            constituency: politician.constituency,
            position: politician.current_position,
            trendingRank: trendingIndex + 1
          }
        })
      }

      return trendingRecs
    } catch (error) {
      console.error('Error getting trending recommendations:', error)
      return []
    }
  }

  /**
   * Get location-based recommendations
   */
  private static async getLocationBasedRecommendations(
    userId: string,
    location: { latitude: number; longitude: number } | undefined,
    limit: number,
    excludeIds: string[]
  ): Promise<Recommendation[]> {
    try {
      if (!location) return []

      // This is a simplified location-based recommendation
      // In a real system, you'd use proper geospatial queries
      
      // For now, we'll recommend politicians from major cities
      const majorCities = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad']
      
      const { data: locationPoliticians } = await supabase
        .from('politicians')
        .select('id, full_name, party, constituency, current_position, photo_url')
        .or(majorCities.map(city => `constituency.ilike.%${city}%`).join(','))
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(Math.ceil(limit * 0.2))

      const locationRecs: Recommendation[] = []

      for (const politician of locationPoliticians || []) {
        locationRecs.push({
          id: politician.id,
          type: 'politician',
          title: politician.full_name,
          description: `${politician.current_position} from ${politician.constituency}`,
          imageUrl: politician.photo_url,
          score: 0.5 * this.ALGORITHM_WEIGHTS.location_based,
          confidence: 0.5,
          reason: `Represents an area near your location`,
          algorithm: 'location_based',
          metadata: {
            party: politician.party,
            constituency: politician.constituency,
            position: politician.current_position
          }
        })
      }

      return locationRecs
    } catch (error) {
      console.error('Error getting location-based recommendations:', error)
      return []
    }
  }

  /**
   * Combine and rank recommendations from different algorithms
   */
  private static combineRecommendations(
    recommendations: Recommendation[],
    limit: number
  ): Recommendation[] {
    // Remove duplicates, keeping the highest scored version
    const uniqueRecs = new Map<string, Recommendation>()
    
    for (const rec of recommendations) {
      const existing = uniqueRecs.get(rec.id)
      if (!existing || rec.score > existing.score) {
        uniqueRecs.set(rec.id, rec)
      }
    }

    // Sort by score and return top recommendations
    return Array.from(uniqueRecs.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get recommendations for a specific politician (related politicians)
   */
  static async getRelatedRecommendations(
    politicianId: string,
    userId?: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    try {
      const cacheKey = `related_recs:${politicianId}:${userId}:${limit}`
      
      // Check cache first
      const cached = await cacheService.get<Recommendation[]>(cacheKey)
      if (cached) return cached

      // Get politician details
      const { data: politician } = await supabase
        .from('politicians')
        .select('*')
        .eq('id', politicianId)
        .single()

      if (!politician) return []

      // Get related politicians using PostgreSQL function
      const { data: relatedResults } = await supabase
        .rpc('get_related_politicians', {
          politician_id: politicianId,
          limit_count: limit
        })

      const recommendations: Recommendation[] = []

      for (const result of relatedResults || []) {
        recommendations.push({
          id: result.related_politician_id,
          type: 'politician',
          title: result.full_name,
          description: `${result.current_position} from ${result.constituency}`,
          imageUrl: result.photo_url,
          score: result.relation_score,
          confidence: Math.min(0.9, result.relation_score),
          reason: this.getRelationReason(result.relation_type, politician),
          algorithm: 'content_based',
          metadata: {
            party: result.party,
            constituency: result.constituency,
            position: result.current_position,
            relationType: result.relation_type
          }
        })
      }

      // Cache the results
      await cacheService.set(cacheKey, recommendations, this.CACHE_TTL)

      return recommendations
    } catch (error) {
      console.error('Error getting related recommendations:', error)
      return []
    }
  }

  /**
   * Get human-readable reason for relation type
   */
  private static getRelationReason(relationType: string, politician: any): string {
    switch (relationType) {
      case 'same_constituency':
        return `Also represents ${politician.constituency}`
      case 'same_party':
        return `Also member of ${politician.party}`
      case 'shared_committees':
        return 'Serves on similar committees'
      case 'similar_position':
        return `Holds similar position to ${politician.current_position}`
      default:
        return 'Related politician'
    }
  }

  /**
   * Update recommendation models based on user feedback
   */
  static async updateRecommendationModels(
    userId: string,
    recommendationId: string,
    feedback: 'like' | 'dislike' | 'not_interested' | 'clicked'
  ): Promise<void> {
    try {
      // Track the feedback as an interaction
      await UserInteractionService.trackInteraction({
        userId,
        sessionId: `feedback_${Date.now()}`,
        type: feedback === 'clicked' ? 'click' : 'favorite',
        targetType: 'politician',
        targetId: recommendationId,
        metadata: {
          feedback,
          context: 'recommendation'
        }
      })

      // Invalidate recommendation cache for this user
      await cacheService.invalidatePattern(`recommendations:${userId}:*`)
    } catch (error) {
      console.error('Error updating recommendation models:', error)
    }
  }
}