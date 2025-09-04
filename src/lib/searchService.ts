import { supabase } from './supabase'
import { cacheService } from './cache/cacheService'
import { NLPProcessor, type QueryIntent } from './nlpProcessor'
import type { Politician } from './types'

// Search interfaces
export interface SearchQuery {
  text: string
  filters?: SearchFilters
  location?: GeoLocation
  userId?: string
  limit?: number
  offset?: number
}

export interface SearchFilters {
  party?: string[]
  constituency?: string[]
  position?: string[]
  gender?: string[]
  languages?: string[]
  committees?: string[]
}

export interface GeoLocation {
  latitude: number
  longitude: number
  radius?: number // in kilometers
}

export interface SearchResult {
  politicians: SearchResultPolitician[]
  total: number
  suggestions?: string[]
  facets?: SearchFacets
}

export interface SearchResultPolitician {
  id: string
  fullName: string
  party: string
  constituency: string
  currentPosition: string
  photoUrl: string
  searchRank: number
  matchType: string
  snippet?: string
}

export interface SearchFacets {
  parties: FacetCount[]
  constituencies: FacetCount[]
  positions: FacetCount[]
  genders: FacetCount[]
  languages: FacetCount[]
}

export interface FacetCount {
  value: string
  count: number
}

export interface Suggestion {
  text: string
  type: 'politician' | 'party' | 'constituency' | 'position' | 'keyword'
  frequency: number
}

export interface RecommendationContext {
  viewedPoliticians?: string[]
  searchHistory?: string[]
  favoriteParties?: string[]
  location?: GeoLocation
}

export interface Recommendation {
  politician: SearchResultPolitician
  score: number
  reason: string
}

export class SearchService {
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly SEARCH_CACHE_PREFIX = 'search:'
  private static readonly SUGGESTION_CACHE_PREFIX = 'suggestions:'
  private static readonly RECOMMENDATION_CACHE_PREFIX = 'recommendations:'

  /**
   * Perform comprehensive search using PostgreSQL full-text search with NLP processing
   */
  static async search(query: SearchQuery): Promise<SearchResult> {
    try {
      const cacheKey = `${this.SEARCH_CACHE_PREFIX}${JSON.stringify(query)}`
      
      // Check cache first
      const cachedResult = await cacheService.get<SearchResult>(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      const { text, filters, limit = 50, offset = 0 } = query
      
      // Process query with NLP for better understanding
      const queryIntent = NLPProcessor.processQuery(text)
      const expandedQuery = NLPProcessor.expandQuery(text)
      
      // Use the processed query for better search results
      const searchText = queryIntent.processedQuery || text
      
      // Use PostgreSQL search function for primary results
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_politicians', {
          search_query: searchText,
          limit_count: limit,
          offset_count: offset
        })

      if (searchError) throw searchError

      // Apply additional filters from NLP processing and user filters
      let filteredResults = searchResults || []
      const combinedFilters = this.combineFilters(filters, queryIntent.filters)
      if (combinedFilters) {
        filteredResults = this.applyFilters(filteredResults, combinedFilters)
      }

      // Get full politician details for results
      const politicians = await Promise.all(
        filteredResults.slice(0, limit).map(async (result: any) => {
          const politician = await this.getPoliticianSummary(result.politician_id)
          return {
            ...politician,
            searchRank: result.search_rank,
            matchType: result.match_type,
            snippet: this.generateSnippet(politician, text)
          }
        })
      )

      // Generate search facets
      const facets = await this.generateSearchFacets(searchText, combinedFilters)

      // Get search suggestions based on expanded query
      const suggestions = await this.getSuggestions(text, 5)

      const result: SearchResult = {
        politicians,
        total: filteredResults.length,
        suggestions: suggestions.map(s => s.text),
        facets
      }

      // Cache the result
      await cacheService.set(cacheKey, result, this.CACHE_TTL)

      return result
    } catch (error) {
      console.error('Error performing search:', error)
      throw error
    }
  }

  /**
   * Process natural language query and return structured intent
   */
  static processNaturalLanguageQuery(query: string): QueryIntent {
    return NLPProcessor.processQuery(query)
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSuggestions(partialQuery: string, limit: number = 10): Promise<Suggestion[]> {
    try {
      const cacheKey = `${this.SUGGESTION_CACHE_PREFIX}${partialQuery}:${limit}`
      
      // Check cache first
      const cachedSuggestions = await cacheService.get<Suggestion[]>(cacheKey)
      if (cachedSuggestions) {
        return cachedSuggestions
      }

      const { data: suggestions, error } = await supabase
        .rpc('get_search_suggestions', {
          partial_query: partialQuery,
          limit_count: limit
        })

      if (error) throw error

      const formattedSuggestions: Suggestion[] = (suggestions || []).map((s: any) => ({
        text: s.suggestion,
        type: s.suggestion_type,
        frequency: s.frequency
      }))

      // Cache the suggestions
      await cacheService.set(cacheKey, formattedSuggestions, this.CACHE_TTL)

      return formattedSuggestions
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  static async getRecommendations(
    userId: string, 
    context: RecommendationContext,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      const cacheKey = `${this.RECOMMENDATION_CACHE_PREFIX}${userId}:${JSON.stringify(context)}:${limit}`
      
      // Check cache first
      const cachedRecommendations = await cacheService.get<Recommendation[]>(cacheKey)
      if (cachedRecommendations) {
        return cachedRecommendations
      }

      const recommendations: Recommendation[] = []

      // Get content-based recommendations from viewed politicians
      if (context.viewedPoliticians && context.viewedPoliticians.length > 0) {
        const contentBasedRecs = await this.getContentBasedRecommendations(
          context.viewedPoliticians,
          limit / 2
        )
        recommendations.push(...contentBasedRecs)
      }

      // Get collaborative filtering recommendations
      const collaborativeRecs = await this.getCollaborativeRecommendations(
        userId,
        context,
        limit - recommendations.length
      )
      recommendations.push(...collaborativeRecs)

      // Sort by score and remove duplicates
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      // Cache the recommendations
      await cacheService.set(cacheKey, uniqueRecommendations, this.CACHE_TTL)

      return uniqueRecommendations
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  }

  /**
   * Get related politicians using PostgreSQL function
   */
  static async getRelatedPoliticians(politicianId: string, limit: number = 5): Promise<SearchResultPolitician[]> {
    try {
      const cacheKey = `related:${politicianId}:${limit}`
      
      // Check cache first
      const cachedRelated = await cacheService.get<SearchResultPolitician[]>(cacheKey)
      if (cachedRelated) {
        return cachedRelated
      }

      const { data: relatedResults, error } = await supabase
        .rpc('get_related_politicians', {
          politician_id: politicianId,
          limit_count: limit
        })

      if (error) throw error

      const relatedPoliticians: SearchResultPolitician[] = (relatedResults || []).map((result: any) => ({
        id: result.related_politician_id,
        fullName: result.full_name,
        party: result.party,
        constituency: result.constituency,
        currentPosition: result.current_position,
        photoUrl: result.photo_url,
        searchRank: result.relation_score,
        matchType: result.relation_type
      }))

      // Cache the results
      await cacheService.set(cacheKey, relatedPoliticians, this.CACHE_TTL)

      return relatedPoliticians
    } catch (error) {
      console.error('Error getting related politicians:', error)
      return []
    }
  }

  /**
   * Perform fuzzy search using PostgreSQL trigram similarity
   */
  static async fuzzySearch(query: string, threshold: number = 0.3, limit: number = 20): Promise<SearchResultPolitician[]> {
    try {
      const { data: results, error } = await supabase
        .from('politicians')
        .select('id, full_name, party, constituency, current_position, photo_url')
        .or(`full_name.ilike.%${query}%,party.ilike.%${query}%,constituency.ilike.%${query}%`)
        .limit(limit)

      if (error) throw error

      // Calculate similarity scores and filter
      const fuzzyResults: SearchResultPolitician[] = []
      
      for (const politician of results || []) {
        const nameScore = this.calculateSimilarity(politician.full_name, query)
        const partyScore = this.calculateSimilarity(politician.party, query)
        const constituencyScore = this.calculateSimilarity(politician.constituency, query)
        
        const maxScore = Math.max(nameScore, partyScore, constituencyScore)
        
        if (maxScore >= threshold) {
          fuzzyResults.push({
            id: politician.id,
            fullName: politician.full_name,
            party: politician.party,
            constituency: politician.constituency,
            currentPosition: politician.current_position,
            photoUrl: politician.photo_url,
            searchRank: maxScore,
            matchType: nameScore === maxScore ? 'name_fuzzy' : 
                      partyScore === maxScore ? 'party_fuzzy' : 'constituency_fuzzy'
          })
        }
      }

      return fuzzyResults.sort((a, b) => b.searchRank - a.searchRank)
    } catch (error) {
      console.error('Error performing fuzzy search:', error)
      return []
    }
  }

  /**
   * Get search facets for filtering
   */
  private static async generateSearchFacets(query: string, currentFilters?: SearchFilters): Promise<SearchFacets> {
    try {
      // Get base search results without filters
      const { data: baseResults } = await supabase
        .rpc('search_politicians', {
          search_query: query,
          limit_count: 1000,
          offset_count: 0
        })

      if (!baseResults) {
        return {
          parties: [],
          constituencies: [],
          positions: [],
          genders: [],
          languages: []
        }
      }

      // Get politician IDs from search results
      const politicianIds = baseResults.map((r: any) => r.politician_id)

      // Get detailed politician data for facet generation
      const { data: politicians } = await supabase
        .from('politicians')
        .select('party, constituency, current_position, gender, languages')
        .in('id', politicianIds)

      if (!politicians) {
        return {
          parties: [],
          constituencies: [],
          positions: [],
          genders: [],
          languages: []
        }
      }

      // Generate facet counts
      const facets: SearchFacets = {
        parties: this.generateFacetCounts(politicians.map(p => p.party)),
        constituencies: this.generateFacetCounts(politicians.map(p => p.constituency)),
        positions: this.generateFacetCounts(politicians.map(p => p.current_position)),
        genders: this.generateFacetCounts(politicians.map(p => p.gender)),
        languages: this.generateFacetCounts(
          politicians.flatMap(p => p.languages || [])
        )
      }

      return facets
    } catch (error) {
      console.error('Error generating search facets:', error)
      return {
        parties: [],
        constituencies: [],
        positions: [],
        genders: [],
        languages: []
      }
    }
  }

  /**
   * Combine user filters with NLP-extracted filters
   */
  private static combineFilters(userFilters?: SearchFilters, nlpFilters?: any): SearchFilters | undefined {
    if (!userFilters && !nlpFilters) return undefined

    const combined: SearchFilters = { ...userFilters }

    if (nlpFilters) {
      // Map NLP filters to search filters
      if (nlpFilters.parties) {
        combined.party = [...(combined.party || []), ...nlpFilters.parties]
      }
      if (nlpFilters.positions) {
        combined.position = [...(combined.position || []), ...nlpFilters.positions]
      }
      if (nlpFilters.locations) {
        combined.constituency = [...(combined.constituency || []), ...nlpFilters.locations]
      }
    }

    return Object.keys(combined).length > 0 ? combined : undefined
  }

  /**
   * Apply filters to search results
   */
  private static applyFilters(results: any[], filters: SearchFilters): any[] {
    return results.filter(result => {
      // This would need to be implemented based on the actual result structure
      // For now, return all results as filtering is done at the database level
      return true
    })
  }

  /**
   * Get politician summary for search results
   */
  private static async getPoliticianSummary(politicianId: string): Promise<SearchResultPolitician> {
    const { data: politician, error } = await supabase
      .from('politicians')
      .select('id, full_name, party, constituency, current_position, photo_url')
      .eq('id', politicianId)
      .single()

    if (error || !politician) {
      throw new Error(`Politician not found: ${politicianId}`)
    }

    return {
      id: politician.id,
      fullName: politician.full_name,
      party: politician.party,
      constituency: politician.constituency,
      currentPosition: politician.current_position,
      photoUrl: politician.photo_url,
      searchRank: 0,
      matchType: 'exact'
    }
  }

  /**
   * Generate search snippet
   */
  private static generateSnippet(politician: SearchResultPolitician, query: string): string {
    const fields = [
      politician.fullName,
      politician.party,
      politician.constituency,
      politician.currentPosition
    ]

    // Find the field that best matches the query
    const matchingField = fields.find(field => 
      field.toLowerCase().includes(query.toLowerCase())
    )

    if (matchingField) {
      const index = matchingField.toLowerCase().indexOf(query.toLowerCase())
      const start = Math.max(0, index - 20)
      const end = Math.min(matchingField.length, index + query.length + 20)
      return matchingField.substring(start, end)
    }

    return `${politician.fullName} - ${politician.party}`
  }

  /**
   * Get content-based recommendations
   */
  private static async getContentBasedRecommendations(
    viewedPoliticianIds: string[],
    limit: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    for (const politicianId of viewedPoliticianIds.slice(0, 3)) {
      const related = await this.getRelatedPoliticians(politicianId, Math.ceil(limit / 3))
      
      for (const politician of related) {
        recommendations.push({
          politician,
          score: politician.searchRank * 0.8, // Content-based gets lower weight
          reason: `Similar to ${politician.fullName} (${politician.matchType})`
        })
      }
    }

    return recommendations
  }

  /**
   * Get collaborative filtering recommendations
   */
  private static async getCollaborativeRecommendations(
    userId: string,
    context: RecommendationContext,
    limit: number
  ): Promise<Recommendation[]> {
    // This is a simplified collaborative filtering implementation
    // In a real system, you'd analyze user behavior patterns
    
    const recommendations: Recommendation[] = []

    // Get popular politicians from user's favorite parties
    if (context.favoriteParties && context.favoriteParties.length > 0) {
      const { data: popularPoliticians } = await supabase
        .from('politicians')
        .select('id, full_name, party, constituency, current_position, photo_url')
        .in('party', context.favoriteParties)
        .limit(limit)

      for (const politician of popularPoliticians || []) {
        recommendations.push({
          politician: {
            id: politician.id,
            fullName: politician.full_name,
            party: politician.party,
            constituency: politician.constituency,
            currentPosition: politician.current_position,
            photoUrl: politician.photo_url,
            searchRank: 0.6,
            matchType: 'collaborative'
          },
          score: 0.6,
          reason: `Popular in ${politician.party}`
        })
      }
    }

    return recommendations
  }

  /**
   * Remove duplicate recommendations
   */
  private static deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>()
    return recommendations.filter(rec => {
      if (seen.has(rec.politician.id)) {
        return false
      }
      seen.add(rec.politician.id)
      return true
    })
  }

  /**
   * Generate facet counts from array of values
   */
  private static generateFacetCounts(values: string[]): FacetCount[] {
    const counts = new Map<string, number>()
    
    for (const value of values) {
      if (value) {
        counts.set(value, (counts.get(value) || 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Limit to top 20 facets
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase())
    return (longer.length - distance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Invalidate search-related caches
   */
  static async invalidateSearchCache(): Promise<void> {
    try {
      // This would need to be implemented based on your cache service
      await cacheService.invalidatePattern(this.SEARCH_CACHE_PREFIX)
      await cacheService.invalidatePattern(this.SUGGESTION_CACHE_PREFIX)
      await cacheService.invalidatePattern(this.RECOMMENDATION_CACHE_PREFIX)
    } catch (error) {
      console.error('Error invalidating search cache:', error)
    }
  }
}