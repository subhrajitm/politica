'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, User, MapPin, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

export interface SearchSuggestion {
  id: string
  text: string
  type: 'politician' | 'party' | 'constituency' | 'position' | 'keyword' | 'recent'
  frequency?: number
  metadata?: {
    party?: string
    constituency?: string
    position?: string
    photoUrl?: string
  }
}

export interface AutocompleteSearchProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  className?: string
  showRecentSearches?: boolean
  showTrending?: boolean
  maxSuggestions?: number
  minQueryLength?: number
  debounceMs?: number
}

export function AutocompleteSearch({
  placeholder = "Search politicians, parties, constituencies...",
  value = "",
  onChange,
  onSearch,
  onSuggestionSelect,
  className,
  showRecentSearches = true,
  showTrending = true,
  maxSuggestions = 8,
  minQueryLength = 2,
  debounceMs = 300
}: AutocompleteSearchProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, debounceMs)

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const stored = localStorage.getItem('recent_searches')
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading recent searches:', error)
        }
      }
    }
  }, [showRecentSearches])

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength) {
      fetchSuggestions(debouncedQuery)
    } else {
      setSuggestions([])
      setSelectedIndex(-1)
    }
  }, [debouncedQuery, minQueryLength])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }, [onChange])

  // Fetch suggestions from API
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=${maxSuggestions}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedSuggestions: SearchSuggestion[] = data.data.map((item: any) => ({
          id: `${item.type}_${item.text}`,
          text: item.text,
          type: item.type,
          frequency: item.frequency
        }))
        
        setSuggestions(formattedSuggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search submission
  const handleSearch = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    // Add to recent searches
    if (showRecentSearches) {
      const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem('recent_searches', JSON.stringify(updated))
    }

    onSearch?.(finalQuery)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }, [query, recentSearches, showRecentSearches, onSearch])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    onChange?.(suggestion.text)
    onSuggestionSelect?.(suggestion)
    handleSearch(suggestion.text)
  }, [onChange, onSuggestionSelect, handleSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalSuggestions = suggestions.length + (showRecentSearches && query.length < minQueryLength ? recentSearches.length : 0)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalSuggestions)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? totalSuggestions - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const allItems = [
            ...suggestions,
            ...(showRecentSearches && query.length < minQueryLength ? recentSearches.map(text => ({ id: text, text, type: 'recent' as const })) : [])
          ]
          const selected = allItems[selectedIndex]
          if (selected) {
            handleSuggestionSelect(selected)
          }
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, suggestions, recentSearches, showRecentSearches, query.length, minQueryLength, selectedIndex, handleSuggestionSelect, handleSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    onChange?.('')
    setIsOpen(false)
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [onChange])

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'politician':
        return <User className="w-4 h-4" />
      case 'party':
        return <TrendingUp className="w-4 h-4" />
      case 'constituency':
        return <MapPin className="w-4 h-4" />
      case 'position':
        return <Briefcase className="w-4 h-4" />
      case 'recent':
        return <Clock className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  // Get suggestion type label
  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'politician':
        return 'Politician'
      case 'party':
        return 'Party'
      case 'constituency':
        return 'Constituency'
      case 'position':
        return 'Position'
      case 'recent':
        return 'Recent'
      default:
        return 'Keyword'
    }
  }

  // Show suggestions or recent searches
  const showSuggestionsList = isOpen && (
    suggestions.length > 0 || 
    (showRecentSearches && query.length < minQueryLength && recentSearches.length > 0)
  )

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow for suggestion clicks
            setTimeout(() => setIsOpen(false), 150)
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showSuggestionsList && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Recent searches */}
            {showRecentSearches && query.length < minQueryLength && recentSearches.length > 0 && (
              <div className="border-b">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                  Recent Searches
                </div>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestionSelect({ id: search, text: search, type: 'recent' })}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2",
                      selectedIndex === suggestions.length + index && "bg-muted"
                    )}
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                {query.length >= minQueryLength && (
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                    Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2",
                      selectedIndex === index && "bg-muted"
                    )}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{suggestion.text}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getSuggestionTypeLabel(suggestion.type)}
                        </Badge>
                      </div>
                    </div>
                    {suggestion.frequency && suggestion.frequency > 1 && (
                      <span className="text-xs text-muted-foreground">
                        {suggestion.frequency}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="px-3 py-4 text-center text-muted-foreground">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mx-auto"></div>
                <span className="text-sm mt-2">Loading suggestions...</span>
              </div>
            )}

            {/* No suggestions */}
            {!isLoading && query.length >= minQueryLength && suggestions.length === 0 && (
              <div className="px-3 py-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}