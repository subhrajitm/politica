import { supabase } from './supabase'
import { cacheService } from './cache/cacheService'

// User interaction types
export type InteractionType = 
  | 'view' 
  | 'search' 
  | 'favorite' 
  | 'unfavorite' 
  | 'share' 
  | 'click' 
  | 'hover' 
  | 'scroll'

export interface UserInteraction {
  id?: string
  userId: string
  sessionId: string
  type: InteractionType
  targetType: 'politician' | 'search' | 'page' | 'feature'
  targetId: string
  metadata?: Record<string, any>
  timestamp: Date
  deviceInfo?: DeviceInfo
  location?: GeolocationCoordinates
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  isMobile: boolean
  screenWidth: number
  screenHeight: number
}

export interface UserProfile {
  userId: string
  preferences: UserPreferences
  interactionHistory: InteractionSummary[]
  lastUpdated: Date
}

export interface UserPreferences {
  favoriteParties: string[]
  favoriteConstituencies: string[]
  favoritePositions: string[]
  interests: string[]
  searchHistory: string[]
  viewedPoliticians: string[]
}

export interface InteractionSummary {
  targetId: string
  targetType: string
  interactionCount: number
  lastInteraction: Date
  interactionTypes: InteractionType[]
}

export class UserInteractionService {
  private static readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes
  private static readonly MAX_HISTORY_SIZE = 1000
  private static readonly INTERACTION_WEIGHTS = {
    view: 1,
    search: 2,
    favorite: 5,
    unfavorite: -3,
    share: 4,
    click: 2,
    hover: 0.5,
    scroll: 0.2
  }

  /**
   * Track a user interaction
   */
  static async trackInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const interactionData = {
        ...interaction,
        timestamp: new Date(),
        metadata: interaction.metadata || {}
      }

      // Store interaction in database (you'll need to create this table)
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: interactionData.userId,
          session_id: interactionData.sessionId,
          type: interactionData.type,
          target_type: interactionData.targetType,
          target_id: interactionData.targetId,
          metadata: interactionData.metadata,
          timestamp: interactionData.timestamp.toISOString(),
          device_info: interactionData.deviceInfo,
          location: interactionData.location
        })

      if (error) {
        console.error('Error tracking interaction:', error)
        // Don't throw error to avoid breaking user experience
        return
      }

      // Update user profile cache
      await this.updateUserProfile(interactionData.userId, interactionData)

      // Trigger real-time updates if needed
      await this.notifyInteractionUpdate(interactionData)

    } catch (error) {
      console.error('Error in trackInteraction:', error)
      // Fail silently to not disrupt user experience
    }
  }

  /**
   * Get user profile with preferences and interaction history
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const cacheKey = `user_profile:${userId}`
      
      // Check cache first
      const cachedProfile = await cacheService.get<UserProfile>(cacheKey)
      if (cachedProfile) {
        return cachedProfile
      }

      // Get interactions from database
      const { data: interactions, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(this.MAX_HISTORY_SIZE)

      if (error) throw error

      // Build user profile from interactions
      const profile = await this.buildUserProfile(userId, interactions || [])

      // Cache the profile
      await cacheService.set(cacheKey, profile, this.CACHE_TTL)

      return profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Get user preferences for recommendations
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    const profile = await this.getUserProfile(userId)
    
    if (!profile) {
      return {
        favoriteParties: [],
        favoriteConstituencies: [],
        favoritePositions: [],
        interests: [],
        searchHistory: [],
        viewedPoliticians: []
      }
    }

    return profile.preferences
  }

  /**
   * Get similar users based on interaction patterns
   */
  static async getSimilarUsers(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) return []

      // This is a simplified similarity calculation
      // In a real system, you'd use more sophisticated algorithms
      const { data: otherUsers, error } = await supabase
        .from('user_interactions')
        .select('user_id, target_id, type')
        .neq('user_id', userId)
        .in('target_id', userProfile.preferences.viewedPoliticians)
        .limit(1000)

      if (error) throw error

      // Calculate similarity scores
      const similarityScores = new Map<string, number>()
      
      for (const interaction of otherUsers || []) {
        const score = similarityScores.get(interaction.user_id) || 0
        const weight = this.INTERACTION_WEIGHTS[interaction.type as InteractionType] || 1
        similarityScores.set(interaction.user_id, score + weight)
      }

      // Return top similar users
      return Array.from(similarityScores.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([userId]) => userId)

    } catch (error) {
      console.error('Error getting similar users:', error)
      return []
    }
  }

  /**
   * Get trending politicians based on recent interactions
   */
  static async getTrendingPoliticians(timeWindow: number = 24 * 60 * 60 * 1000): Promise<string[]> {
    try {
      const cacheKey = `trending_politicians:${timeWindow}`
      
      // Check cache first
      const cached = await cacheService.get<string[]>(cacheKey)
      if (cached) return cached

      const since = new Date(Date.now() - timeWindow)

      const { data: interactions, error } = await supabase
        .from('user_interactions')
        .select('target_id, type')
        .eq('target_type', 'politician')
        .gte('timestamp', since.toISOString())

      if (error) throw error

      // Calculate trending scores
      const trendingScores = new Map<string, number>()
      
      for (const interaction of interactions || []) {
        const score = trendingScores.get(interaction.target_id) || 0
        const weight = this.INTERACTION_WEIGHTS[interaction.type as InteractionType] || 1
        trendingScores.set(interaction.target_id, score + weight)
      }

      // Return top trending politicians
      const trending = Array.from(trendingScores.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([politicianId]) => politicianId)

      // Cache the results
      await cacheService.set(cacheKey, trending, 30 * 60 * 1000) // 30 minutes

      return trending
    } catch (error) {
      console.error('Error getting trending politicians:', error)
      return []
    }
  }

  /**
   * Get interaction analytics for a politician
   */
  static async getPoliticianAnalytics(politicianId: string, timeWindow?: number): Promise<{
    totalViews: number
    uniqueUsers: number
    favorites: number
    shares: number
    trendingScore: number
  }> {
    try {
      const since = timeWindow ? new Date(Date.now() - timeWindow) : new Date(0)

      const { data: interactions, error } = await supabase
        .from('user_interactions')
        .select('user_id, type')
        .eq('target_id', politicianId)
        .eq('target_type', 'politician')
        .gte('timestamp', since.toISOString())

      if (error) throw error

      const analytics = {
        totalViews: 0,
        uniqueUsers: new Set<string>(),
        favorites: 0,
        shares: 0,
        trendingScore: 0
      }

      for (const interaction of interactions || []) {
        analytics.uniqueUsers.add(interaction.user_id)
        
        switch (interaction.type) {
          case 'view':
            analytics.totalViews++
            break
          case 'favorite':
            analytics.favorites++
            break
          case 'share':
            analytics.shares++
            break
        }

        const weight = this.INTERACTION_WEIGHTS[interaction.type as InteractionType] || 1
        analytics.trendingScore += weight
      }

      return {
        totalViews: analytics.totalViews,
        uniqueUsers: analytics.uniqueUsers.size,
        favorites: analytics.favorites,
        shares: analytics.shares,
        trendingScore: analytics.trendingScore
      }
    } catch (error) {
      console.error('Error getting politician analytics:', error)
      return {
        totalViews: 0,
        uniqueUsers: 0,
        favorites: 0,
        shares: 0,
        trendingScore: 0
      }
    }
  }

  /**
   * Build user profile from interactions
   */
  private static async buildUserProfile(userId: string, interactions: any[]): Promise<UserProfile> {
    const preferences: UserPreferences = {
      favoriteParties: [],
      favoriteConstituencies: [],
      favoritePositions: [],
      interests: [],
      searchHistory: [],
      viewedPoliticians: []
    }

    const interactionSummary = new Map<string, InteractionSummary>()

    // Process interactions
    for (const interaction of interactions) {
      const key = `${interaction.target_type}:${interaction.target_id}`
      
      if (!interactionSummary.has(key)) {
        interactionSummary.set(key, {
          targetId: interaction.target_id,
          targetType: interaction.target_type,
          interactionCount: 0,
          lastInteraction: new Date(interaction.timestamp),
          interactionTypes: []
        })
      }

      const summary = interactionSummary.get(key)!
      summary.interactionCount++
      summary.interactionTypes.push(interaction.type)
      
      if (new Date(interaction.timestamp) > summary.lastInteraction) {
        summary.lastInteraction = new Date(interaction.timestamp)
      }

      // Build preferences
      if (interaction.target_type === 'politician') {
        preferences.viewedPoliticians.push(interaction.target_id)
      } else if (interaction.target_type === 'search') {
        preferences.searchHistory.push(interaction.target_id)
      }
    }

    // Get politician details for preference extraction
    if (preferences.viewedPoliticians.length > 0) {
      const { data: politicians } = await supabase
        .from('politicians')
        .select('party, constituency, current_position')
        .in('id', preferences.viewedPoliticians.slice(0, 100)) // Limit for performance

      if (politicians) {
        const partyCounts = new Map<string, number>()
        const constituencyCounts = new Map<string, number>()
        const positionCounts = new Map<string, number>()

        for (const politician of politicians) {
          partyCounts.set(politician.party, (partyCounts.get(politician.party) || 0) + 1)
          constituencyCounts.set(politician.constituency, (constituencyCounts.get(politician.constituency) || 0) + 1)
          positionCounts.set(politician.current_position, (positionCounts.get(politician.current_position) || 0) + 1)
        }

        // Extract top preferences
        preferences.favoriteParties = Array.from(partyCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([party]) => party)

        preferences.favoriteConstituencies = Array.from(constituencyCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([constituency]) => constituency)

        preferences.favoritePositions = Array.from(positionCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([position]) => position)
      }
    }

    // Remove duplicates and limit sizes
    preferences.viewedPoliticians = [...new Set(preferences.viewedPoliticians)].slice(0, 100)
    preferences.searchHistory = [...new Set(preferences.searchHistory)].slice(0, 50)

    return {
      userId,
      preferences,
      interactionHistory: Array.from(interactionSummary.values()),
      lastUpdated: new Date()
    }
  }

  /**
   * Update user profile cache
   */
  private static async updateUserProfile(userId: string, interaction: UserInteraction): Promise<void> {
    try {
      const cacheKey = `user_profile:${userId}`
      
      // Invalidate cache to force refresh on next access
      await cacheService.invalidatePattern(cacheKey)
    } catch (error) {
      console.error('Error updating user profile cache:', error)
    }
  }

  /**
   * Notify about interaction updates (for real-time features)
   */
  private static async notifyInteractionUpdate(interaction: UserInteraction): Promise<void> {
    try {
      // This could trigger real-time updates, analytics updates, etc.
      // For now, we'll just log it
      console.log('Interaction tracked:', {
        type: interaction.type,
        targetType: interaction.targetType,
        targetId: interaction.targetId
      })
    } catch (error) {
      console.error('Error notifying interaction update:', error)
    }
  }
}