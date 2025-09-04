'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, History, Sparkles, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AutocompleteSearch, type SearchSuggestion } from './AutocompleteSearch'
import { AdvancedSearchFilters, type SearchFilters, type FilterGroup } from './AdvancedSearchFilters'
import { SearchHistory, addSearchToHistory } from './SearchHistory'
import { cn } from '@/lib/utils'

export interface SearchResult {
  id: string
  title: string
  description: string
  imageUrl?: string
  type: 'politician' | 'party' | 'constituency'
  metadata?: Record<string, any>
  score?: number
  snippet?: string
}

export interface IntelligentSearchInterfaceProps {
  onSearch?: (query: string, filters?: SearchFilters) => void
  onResultSelect?: (result: SearchResult) => void
  className?: string
  userId?: string
  placeholder?: string
  showHistory?: boolean
  showFilters?: boolean
  showRecommendations?: boolean
  initialQuery?: string
  initialFilters?: SearchFilters
}

export function IntelligentSearchInterface({
  onSearch,
  onResultSelect,
  className,
  userId,
  placeholder = "Search politicians, parties, constituencies...",
  showHistory = true,
  showFilters = true,
  showRecommendations = true,
  initialQuery = "",
  initialFilters = {}
}: IntelligentSearchInterfaceProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'recommendations'>('search')
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([])
  const [recommendations, setRecommendations] = useState<SearchResult[]>([])

  // Initialize filter groups
  useEffect(() => {
    initializeFilterGroups()
  }, [])

  // Load recommendations if enabled
  useEffect(() => {
    if (showRecommendations && userId && activeTab === 'recommendations') {
      loadRecommendations()
    }
  }, [showRecommendations, userId, activeTab])

  const initializeFilterGroups = async () => {
    try {
      // In a real implementation, you'd fetch these from your API
      // For now, we'll use mock data
      const mockFilterGroups: FilterGroup[] = [
        {
          key: 'parties',
          label: 'Political Parties',
          options: [
            { value: 'BJP', label: 'Bharatiya Janata Party', count: 150 },
            { value: 'INC', label: 'Indian National Congress', count: 120 },
            { value: 'AAP', label: 'Aam Aadmi Party', count: 45 },
            { value: 'TMC', label: 'Trinamool Congress', count: 35 },
            { value: 'DMK', label: 'Dravida Munnetra Kazhagam', count: 30 },
            { value: 'SP', label: 'Samajwadi Party', count: 25 },
            { value: 'BSP', label: 'Bahujan Samaj Party', count: 20 }
          ],
          maxVisible: 5
        },
        {
          key: 'positions',
          label: 'Positions',
          options: [
            { value: 'Prime Minister', label: 'Prime Minister', count: 1 },
            { value: 'Chief Minister', label: 'Chief Minister', count: 28 },
            { value: 'Cabinet Minister', label: 'Cabinet Minister', count: 75 },
            { value: 'Member of Parliament', label: 'Member of Parliament', count: 543 },
            { value: 'Member of Legislative Assembly', label: 'Member of Legislative Assembly', count: 4000 },
            { value: 'Mayor', label: 'Mayor', count: 200 }
          ],
          maxVisible: 4
        },
        {
          key: 'constituencies',
          label: 'Constituencies',
          options: [
            { value: 'Delhi', label: 'Delhi', count: 70 },
            { value: 'Mumbai', label: 'Mumbai', count: 36 },
            { value: 'Kolkata', label: 'Kolkata', count: 42 },
            { value: 'Chennai', label: 'Chennai', count: 16 },
            { value: 'Bangalore', label: 'Bangalore', count: 28 },
            { value: 'Hyderabad', label: 'Hyderabad', count: 24 }
          ],
          maxVisible: 4
        },
        {
          key: 'genders',
          label: 'Gender',
          options: [
            { value: 'Male', label: 'Male', count: 3500 },
            { value: 'Female', label: 'Female', count: 1200 },
            { value: 'Other', label: 'Other', count: 5 }
          ]
        },
        {
          key: 'languages',
          label: 'Languages',
          options: [
            { value: 'Hindi', label: 'Hindi', count: 2000 },
            { value: 'English', label: 'English', count: 1800 },
            { value: 'Bengali', label: 'Bengali', count: 400 },
            { value: 'Tamil', label: 'Tamil', count: 350 },
            { value: 'Telugu', label: 'Telugu', count: 300 },
            { value: 'Marathi', label: 'Marathi', count: 250 }
          ],
          maxVisible: 4
        }
      ]

      setFilterGroups(mockFilterGroups)
    } catch (error) {
      console.error('Error initializing filter groups:', error)
    }
  }

  const loadRecommendations = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&type=politician&limit=10`)
      const data = await response.json()

      if (data.success) {
        const formattedRecs: SearchResult[] = data.data.recommendations.map((rec: any) => ({
          id: rec.id,
          title: rec.title,
          description: rec.description || '',
          imageUrl: rec.imageUrl,
          type: 'politician',
          metadata: rec.metadata,
          score: rec.score
        }))
        setRecommendations(formattedRecs)
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const handleSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setActiveTab('search')

    try {
      const finalFilters = searchFilters || filters
      const queryParams = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      })

      // Add filters to query params
      if (finalFilters.parties?.length) {
        finalFilters.parties.forEach(party => queryParams.append('party', party))
      }
      if (finalFilters.constituencies?.length) {
        finalFilters.constituencies.forEach(constituency => queryParams.append('constituency', constituency))
      }
      if (finalFilters.positions?.length) {
        finalFilters.positions.forEach(position => queryParams.append('position', position))
      }
      if (finalFilters.genders?.length) {
        finalFilters.genders.forEach(gender => queryParams.append('gender', gender))
      }
      if (finalFilters.languages?.length) {
        finalFilters.languages.forEach(language => queryParams.append('language', language))
      }

      const response = await fetch(`/api/search?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        const formattedResults: SearchResult[] = data.data.politicians.map((politician: any) => ({
          id: politician.id,
          title: politician.fullName,
          description: `${politician.currentPosition} from ${politician.constituency}`,
          imageUrl: politician.photoUrl,
          type: 'politician',
          metadata: {
            party: politician.party,
            constituency: politician.constituency,
            position: politician.currentPosition
          },
          score: politician.searchRank,
          snippet: politician.snippet
        }))

        setResults(formattedResults)
        
        // Add to search history
        addSearchToHistory(searchQuery, formattedResults.length, finalFilters)
        
        // Track search interaction
        if (userId) {
          fetch('/api/interactions/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              sessionId: `session_${Date.now()}`,
              type: 'search',
              targetType: 'search',
              targetId: searchQuery,
              metadata: {
                resultsCount: formattedResults.length,
                filters: finalFilters
              }
            })
          }).catch(console.error)
        }
      }

      onSearch?.(searchQuery, finalFilters)
    } catch (error) {
      console.error('Error performing search:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [filters, onSearch, userId])

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text)
  }

  const handleResultSelect = (result: SearchResult) => {
    // Track click interaction
    if (userId) {
      fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId: `session_${Date.now()}`,
          type: 'click',
          targetType: 'politician',
          targetId: result.id,
          metadata: {
            searchQuery: query,
            resultPosition: results.findIndex(r => r.id === result.id)
          }
        })
      }).catch(console.error)
    }

    onResultSelect?.(result)
  }

  const handleHistorySelect = (historicalQuery: string) => {
    setQuery(historicalQuery)
    handleSearch(historicalQuery)
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce(
      (count, filterArray) => count + (filterArray?.length || 0),
      0
    )
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Main search interface */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search input */}
          <AutocompleteSearch
            placeholder={placeholder}
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            showRecentSearches={showHistory}
            showTrending={true}
          />

          {/* Filter controls */}
          {showFilters && (
            <div className="flex items-center gap-2">
              <AdvancedSearchFilters
                filters={filters}
                onChange={setFilters}
                filterGroups={filterGroups}
                isOpen={showAdvancedFilters}
                onToggle={setShowAdvancedFilters}
              />
              
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results and additional features */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Results
            {results.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {results.length}
              </Badge>
            )}
          </TabsTrigger>
          {showHistory && (
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          )}
          {showRecommendations && userId && (
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              For You
              {recommendations.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {recommendations.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="search" className="mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </CardContent>
            </Card>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, index) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent 
                    className="p-4"
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="flex items-start gap-4">
                      {result.imageUrl && (
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{result.title}</h3>
                            <p className="text-muted-foreground mb-2">{result.description}</p>
                            {result.snippet && (
                              <p className="text-sm text-muted-foreground italic mb-2">
                                "{result.snippet}"
                              </p>
                            )}
                          </div>
                          {result.score && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(result.score * 100)}% match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.metadata?.party && (
                            <Badge variant="secondary">{result.metadata.party}</Badge>
                          )}
                          {result.metadata?.constituency && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.metadata.constituency}
                            </Badge>
                          )}
                          {result.metadata?.position && (
                            <Badge variant="outline">{result.metadata.position}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(true)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Adjust Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Start your search</h3>
                <p className="text-muted-foreground">
                  Search for politicians, parties, or constituencies
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {showHistory && (
          <TabsContent value="history" className="mt-4">
            <SearchHistory
              userId={userId}
              onSearchSelect={handleHistorySelect}
            />
          </TabsContent>
        )}

        {showRecommendations && userId && (
          <TabsContent value="recommendations" className="mt-4">
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Recommended for you</h3>
                </div>
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent 
                      className="p-4"
                      onClick={() => handleResultSelect(rec)}
                    >
                      <div className="flex items-start gap-4">
                        {rec.imageUrl && (
                          <img
                            src={rec.imageUrl}
                            alt={rec.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
                              <p className="text-muted-foreground mb-2">{rec.description}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {rec.metadata?.party && (
                              <Badge variant="secondary">{rec.metadata.party}</Badge>
                            )}
                            {rec.metadata?.constituency && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {rec.metadata.constituency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                  <p className="text-muted-foreground">
                    Start searching and viewing politicians to get personalized recommendations
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}