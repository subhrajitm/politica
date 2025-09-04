/**
 * Natural Language Processing utilities for search query processing
 * Implements simple text parsing and keyword extraction for political search
 */

export interface QueryIntent {
  type: 'search' | 'filter' | 'location' | 'comparison'
  confidence: number
  entities: ExtractedEntity[]
  filters: QueryFilters
  originalQuery: string
  processedQuery: string
}

export interface ExtractedEntity {
  type: 'person' | 'party' | 'location' | 'position' | 'topic' | 'date'
  value: string
  confidence: number
  startIndex: number
  endIndex: number
}

export interface QueryFilters {
  parties?: string[]
  constituencies?: string[]
  positions?: string[]
  locations?: string[]
  topics?: string[]
  dateRange?: {
    start?: Date
    end?: Date
  }
}

export class NLPProcessor {
  // Common political terms and their categories
  private static readonly POLITICAL_TERMS = {
    positions: [
      'prime minister', 'pm', 'chief minister', 'cm', 'minister', 'mp', 'mla',
      'member of parliament', 'member of legislative assembly', 'speaker',
      'deputy speaker', 'leader of opposition', 'cabinet minister', 'governor',
      'president', 'vice president', 'mayor', 'councillor', 'sarpanch'
    ],
    parties: [
      'bjp', 'congress', 'aap', 'tmc', 'dmk', 'aiadmk', 'sp', 'bsp', 'jdu',
      'rjd', 'shiv sena', 'ncp', 'cpi', 'cpim', 'akali dal', 'jmm', 'aitc',
      'bharatiya janata party', 'indian national congress', 'aam aadmi party',
      'trinamool congress', 'dravida munnetra kazhagam', 'samajwadi party',
      'bahujan samaj party', 'janata dal united', 'rashtriya janata dal'
    ],
    topics: [
      'education', 'healthcare', 'economy', 'agriculture', 'infrastructure',
      'employment', 'corruption', 'environment', 'women empowerment',
      'youth development', 'rural development', 'urban planning', 'technology',
      'defense', 'foreign policy', 'taxation', 'social welfare'
    ],
    locations: [
      'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad',
      'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
      'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara'
    ]
  }

  // Stop words to filter out
  private static readonly STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'
  ])

  /**
   * Process natural language query and extract intent and entities
   */
  static processQuery(query: string): QueryIntent {
    const normalizedQuery = this.normalizeQuery(query)
    const tokens = this.tokenize(normalizedQuery)
    const entities = this.extractEntities(tokens, normalizedQuery)
    const filters = this.extractFilters(entities)
    const processedQuery = this.buildProcessedQuery(tokens, entities)
    
    return {
      type: this.determineQueryType(entities, tokens),
      confidence: this.calculateConfidence(entities, tokens),
      entities,
      filters,
      originalQuery: query,
      processedQuery
    }
  }

  /**
   * Extract search keywords from query
   */
  static extractKeywords(query: string): string[] {
    const normalizedQuery = this.normalizeQuery(query)
    const tokens = this.tokenize(normalizedQuery)
    
    // Filter out stop words and short tokens
    const keywords = tokens.filter(token => 
      !this.STOP_WORDS.has(token.toLowerCase()) && 
      token.length > 2
    )

    // Add n-grams for better matching
    const ngrams = this.generateNGrams(tokens, 2)
    keywords.push(...ngrams)

    return [...new Set(keywords)] // Remove duplicates
  }

  /**
   * Expand query with synonyms and related terms
   */
  static expandQuery(query: string): string[] {
    const keywords = this.extractKeywords(query)
    const expandedTerms: string[] = [...keywords]

    // Add synonyms and related terms
    for (const keyword of keywords) {
      const synonyms = this.getSynonyms(keyword.toLowerCase())
      expandedTerms.push(...synonyms)
    }

    return [...new Set(expandedTerms)]
  }

  /**
   * Detect query language (simplified)
   */
  static detectLanguage(query: string): 'english' | 'hindi' | 'mixed' {
    const hindiPattern = /[\u0900-\u097F]/
    const englishPattern = /[a-zA-Z]/
    
    const hasHindi = hindiPattern.test(query)
    const hasEnglish = englishPattern.test(query)
    
    if (hasHindi && hasEnglish) return 'mixed'
    if (hasHindi) return 'hindi'
    return 'english'
  }

  /**
   * Normalize query text
   */
  private static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  /**
   * Tokenize query into words
   */
  private static tokenize(query: string): string[] {
    return query.split(/\s+/).filter(token => token.length > 0)
  }

  /**
   * Extract entities from tokens
   */
  private static extractEntities(tokens: string[], originalQuery: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []
    const queryLower = originalQuery.toLowerCase()

    // Extract political positions
    for (const position of this.POLITICAL_TERMS.positions) {
      if (queryLower.includes(position)) {
        const startIndex = queryLower.indexOf(position)
        entities.push({
          type: 'position',
          value: position,
          confidence: 0.9,
          startIndex,
          endIndex: startIndex + position.length
        })
      }
    }

    // Extract party names
    for (const party of this.POLITICAL_TERMS.parties) {
      if (queryLower.includes(party)) {
        const startIndex = queryLower.indexOf(party)
        entities.push({
          type: 'party',
          value: party,
          confidence: 0.9,
          startIndex,
          endIndex: startIndex + party.length
        })
      }
    }

    // Extract locations
    for (const location of this.POLITICAL_TERMS.locations) {
      if (queryLower.includes(location)) {
        const startIndex = queryLower.indexOf(location)
        entities.push({
          type: 'location',
          value: location,
          confidence: 0.8,
          startIndex,
          endIndex: startIndex + location.length
        })
      }
    }

    // Extract topics
    for (const topic of this.POLITICAL_TERMS.topics) {
      if (queryLower.includes(topic)) {
        const startIndex = queryLower.indexOf(topic)
        entities.push({
          type: 'topic',
          value: topic,
          confidence: 0.7,
          startIndex,
          endIndex: startIndex + topic.length
        })
      }
    }

    // Extract potential person names (capitalized words)
    const personPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g
    let match
    while ((match = personPattern.exec(originalQuery)) !== null) {
      entities.push({
        type: 'person',
        value: match[0],
        confidence: 0.6,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      })
    }

    return entities.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Extract filters from entities
   */
  private static extractFilters(entities: ExtractedEntity[]): QueryFilters {
    const filters: QueryFilters = {}

    for (const entity of entities) {
      switch (entity.type) {
        case 'party':
          if (!filters.parties) filters.parties = []
          filters.parties.push(entity.value)
          break
        case 'location':
          if (!filters.locations) filters.locations = []
          filters.locations.push(entity.value)
          break
        case 'position':
          if (!filters.positions) filters.positions = []
          filters.positions.push(entity.value)
          break
        case 'topic':
          if (!filters.topics) filters.topics = []
          filters.topics.push(entity.value)
          break
      }
    }

    return filters
  }

  /**
   * Build processed query for search
   */
  private static buildProcessedQuery(tokens: string[], entities: ExtractedEntity[]): string {
    // Remove entity tokens that are already captured
    const entityValues = new Set(
      entities.flatMap(e => e.value.toLowerCase().split(/\s+/))
    )

    const filteredTokens = tokens.filter(token => 
      !entityValues.has(token.toLowerCase()) &&
      !this.STOP_WORDS.has(token.toLowerCase()) &&
      token.length > 2
    )

    return filteredTokens.join(' ')
  }

  /**
   * Determine query type based on entities and tokens
   */
  private static determineQueryType(entities: ExtractedEntity[], tokens: string[]): QueryIntent['type'] {
    const hasLocationEntity = entities.some(e => e.type === 'location')
    const hasFilterEntity = entities.some(e => ['party', 'position', 'topic'].includes(e.type))
    const hasComparisonWords = tokens.some(t => ['vs', 'versus', 'compare', 'difference'].includes(t.toLowerCase()))

    if (hasComparisonWords) return 'comparison'
    if (hasLocationEntity) return 'location'
    if (hasFilterEntity) return 'filter'
    return 'search'
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(entities: ExtractedEntity[], tokens: string[]): number {
    if (entities.length === 0) return 0.3

    const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
    const entityCoverage = entities.length / Math.max(tokens.length, 1)
    
    return Math.min(0.95, avgEntityConfidence * 0.7 + entityCoverage * 0.3)
  }

  /**
   * Generate n-grams from tokens
   */
  private static generateNGrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = []
    
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ')
      if (ngram.length > 3) { // Only include meaningful n-grams
        ngrams.push(ngram)
      }
    }
    
    return ngrams
  }

  /**
   * Get synonyms for a term (simplified implementation)
   */
  private static getSynonyms(term: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'minister': ['cabinet minister', 'state minister'],
      'mp': ['member of parliament', 'parliamentarian'],
      'mla': ['member of legislative assembly', 'legislator'],
      'bjp': ['bharatiya janata party', 'lotus party'],
      'congress': ['indian national congress', 'inc'],
      'aap': ['aam aadmi party', 'common man party'],
      'education': ['schooling', 'learning', 'academics'],
      'healthcare': ['medical', 'health', 'medicine'],
      'economy': ['economic', 'financial', 'fiscal'],
      'corruption': ['graft', 'bribery', 'dishonesty']
    }

    return synonymMap[term] || []
  }
}

// Export utility functions for direct use
export const nlpUtils = {
  processQuery: NLPProcessor.processQuery,
  extractKeywords: NLPProcessor.extractKeywords,
  expandQuery: NLPProcessor.expandQuery,
  detectLanguage: NLPProcessor.detectLanguage
}