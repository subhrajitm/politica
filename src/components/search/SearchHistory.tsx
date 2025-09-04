'use client'

import React, { useState, useEffect } from 'react'
import { Clock, X, Search, TrendingUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: Date
  resultsCount?: number
  filters?: Record<string, any>
}

export interface SearchHistoryProps {
  userId?: string
  onSearchSelect?: (query: string) => void
  onClearHistory?: () => void
  className?: string
  maxItems?: number
  showTimestamps?: boolean
  showResultCounts?: boolean
}

export function SearchHistory({
  userId,
  onSearchSelect,
  onClearHistory,
  className,
  maxItems = 20,
  showTimestamps = true,
  showResultCounts = true
}: SearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [savedSearches, setSavedSearches] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load search history from localStorage and API
  useEffect(() => {
    loadSearchHistory()
  }, [userId])

  const loadSearchHistory = async () => {
    setIsLoading(true)
    try {
      // Load from localStorage
      const localHistory = localStorage.getItem('search_history')
      if (localHistory) {
        const parsed = JSON.parse(localHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setSearchHistory(parsed.slice(0, maxItems))
      }

      // Load saved searches from API if user is logged in
      if (userId) {
        const response = await fetch(`/api/interactions/track?userId=${userId}&type=preferences`)
        const data = await response.json()
        
        if (data.success && data.data.searchHistory) {
          const apiHistory = data.data.searchHistory.map((query: string, index: number) => ({
            id: `api_${index}`,
            query,
            timestamp: new Date(),
            resultsCount: undefined
          }))
          setSavedSearches(apiHistory.slice(0, 10))
        }
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add search to history
  const addToHistory = (query: string, resultsCount?: number, filters?: Record<string, any>) => {
    const newItem: SearchHistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      timestamp: new Date(),
      resultsCount,
      filters
    }

    const updatedHistory = [
      newItem,
      ...searchHistory.filter(item => item.query !== query)
    ].slice(0, maxItems)

    setSearchHistory(updatedHistory)
    
    // Save to localStorage
    localStorage.setItem('search_history', JSON.stringify(updatedHistory))
  }

  // Remove item from history
  const removeFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id)
    setSearchHistory(updatedHistory)
    localStorage.setItem('search_history', JSON.stringify(updatedHistory))
  }

  // Clear all history
  const clearAllHistory = () => {
    setSearchHistory([])
    setSavedSearches([])
    localStorage.removeItem('search_history')
    onClearHistory?.()
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  // Get filter summary
  const getFilterSummary = (filters?: Record<string, any>) => {
    if (!filters) return null
    
    const filterCount = Object.values(filters).reduce(
      (count, value) => count + (Array.isArray(value) ? value.length : value ? 1 : 0),
      0
    )
    
    return filterCount > 0 ? `${filterCount} filter${filterCount > 1 ? 's' : ''}` : null
  }

  const hasHistory = searchHistory.length > 0 || savedSearches.length > 0

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading search history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasHistory) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No search history</h3>
          <p className="text-sm text-muted-foreground">
            Your recent searches will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Search History
          </CardTitle>
          {hasHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllHistory}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-96">
          {/* Saved searches */}
          {savedSearches.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Saved Searches</span>
              </div>
              <div className="space-y-2">
                {savedSearches.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSearchSelect?.(item.query)}
                    className="w-full p-2 text-left hover:bg-muted rounded-md transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">{item.query}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedSearches.length > 0 && searchHistory.length > 0 && (
            <Separator className="mx-4" />
          )}

          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <div className="px-4 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
              </div>
              <div className="space-y-2">
                {searchHistory.map(item => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <button
                      onClick={() => onSearchSelect?.(item.query)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{item.query}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                        {showTimestamps && (
                          <span>{formatTimestamp(item.timestamp)}</span>
                        )}
                        {showResultCounts && item.resultsCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{item.resultsCount} results</span>
                          </>
                        )}
                        {getFilterSummary(item.filters) && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {getFilterSummary(item.filters)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromHistory(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Export utility function to add searches to history
export const addSearchToHistory = (
  query: string,
  resultsCount?: number,
  filters?: Record<string, any>
) => {
  const history = JSON.parse(localStorage.getItem('search_history') || '[]')
  const newItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    query,
    timestamp: new Date().toISOString(),
    resultsCount,
    filters
  }

  const updatedHistory = [
    newItem,
    ...history.filter((item: any) => item.query !== query)
  ].slice(0, 20)

  localStorage.setItem('search_history', JSON.stringify(updatedHistory))
}