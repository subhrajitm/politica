'use client'

import React, { useState, useEffect } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface SearchFilters {
  parties?: string[]
  constituencies?: string[]
  positions?: string[]
  genders?: string[]
  languages?: string[]
  committees?: string[]
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterGroup {
  key: keyof SearchFilters
  label: string
  options: FilterOption[]
  maxVisible?: number
}

export interface AdvancedSearchFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  filterGroups: FilterGroup[]
  className?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

export function AdvancedSearchFilters({
  filters,
  onChange,
  filterGroups,
  className,
  isOpen = false,
  onToggle
}: AdvancedSearchFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showAllOptions, setShowAllOptions] = useState<Set<string>>(new Set())

  // Count total active filters
  const activeFilterCount = Object.values(filters).reduce(
    (count, filterArray) => count + (filterArray?.length || 0),
    0
  )

  // Toggle filter group expansion
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  // Toggle show all options for a group
  const toggleShowAll = (groupKey: string) => {
    const newShowAll = new Set(showAllOptions)
    if (newShowAll.has(groupKey)) {
      newShowAll.delete(groupKey)
    } else {
      newShowAll.add(groupKey)
    }
    setShowAllOptions(newShowAll)
  }

  // Handle filter change
  const handleFilterChange = (groupKey: keyof SearchFilters, value: string, checked: boolean) => {
    const currentValues = filters[groupKey] || []
    let newValues: string[]

    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter(v => v !== value)
    }

    onChange({
      ...filters,
      [groupKey]: newValues.length > 0 ? newValues : undefined
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    onChange({})
  }

  // Clear specific filter group
  const clearFilterGroup = (groupKey: keyof SearchFilters) => {
    onChange({
      ...filters,
      [groupKey]: undefined
    })
  }

  // Remove specific filter
  const removeFilter = (groupKey: keyof SearchFilters, value: string) => {
    const currentValues = filters[groupKey] || []
    const newValues = currentValues.filter(v => v !== value)
    
    onChange({
      ...filters,
      [groupKey]: newValues.length > 0 ? newValues : undefined
    })
  }

  // Get visible options for a group
  const getVisibleOptions = (group: FilterGroup) => {
    const maxVisible = group.maxVisible || 5
    const showAll = showAllOptions.has(group.key)
    return showAll ? group.options : group.options.slice(0, maxVisible)
  }

  if (!isOpen) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggle?.(true)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {filterGroups.map(group => {
              const activeFilters = filters[group.key] || []
              return activeFilters.map(value => (
                <Badge
                  key={`${group.key}-${value}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {value}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(group.key, value)}
                    className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))
            })}
            {activeFilterCount > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle?.(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ScrollArea className="max-h-96">
          {filterGroups.map((group, index) => (
            <div key={group.key}>
              <Collapsible
                open={expandedGroups.has(group.key)}
                onOpenChange={() => toggleGroup(group.key)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span>{group.label}</span>
                      {filters[group.key] && filters[group.key]!.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {filters[group.key]!.length}
                        </Badge>
                      )}
                    </div>
                    {expandedGroups.has(group.key) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-2 space-y-2">
                  {filters[group.key] && filters[group.key]!.length > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        {filters[group.key]!.map(value => (
                          <Badge
                            key={value}
                            variant="secondary"
                            className="flex items-center gap-1 text-xs"
                          >
                            {value}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilter(group.key, value)}
                              className="h-auto p-0 w-3 h-3 hover:bg-transparent"
                            >
                              <X className="w-2 h-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilterGroup(group.key)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2 pl-4">
                    {getVisibleOptions(group).map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${group.key}-${option.value}`}
                          checked={filters[group.key]?.includes(option.value) || false}
                          onCheckedChange={(checked) =>
                            handleFilterChange(group.key, option.value, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`${group.key}-${option.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {option.count && (
                              <span className="text-xs text-muted-foreground">
                                ({option.count})
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                    
                    {group.options.length > (group.maxVisible || 5) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleShowAll(group.key)}
                        className="text-xs text-muted-foreground hover:text-foreground w-full"
                      >
                        {showAllOptions.has(group.key)
                          ? `Show less`
                          : `Show ${group.options.length - (group.maxVisible || 5)} more`
                        }
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {index < filterGroups.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}