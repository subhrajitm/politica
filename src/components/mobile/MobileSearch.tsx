/**
 * Mobile-optimized Search Component
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Mic, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useDebounce } from '@/hooks/use-debounce';

interface MobileSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  filters?: {
    party?: string[];
    state?: string[];
    position?: string[];
  };
  onFiltersChange?: (filters: any) => void;
  showVoiceSearch?: boolean;
  showImageSearch?: boolean;
}

export function MobileSearch({
  value,
  onChange,
  onSubmit,
  placeholder = "Search politicians...",
  suggestions = [],
  filters,
  onFiltersChange,
  showVoiceSearch = true,
  showImageSearch = false,
}: MobileSearchProps) {
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 300);

  const searchRef = useTouchGestures({
    onSwipeDown: () => {
      if (isFocused) {
        inputRef.current?.blur();
      }
    },
  });

  useEffect(() => {
    if (debouncedValue && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedValue, suggestions.length]);

  if (!isMobile) {
    return null;
  }

  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      if (onSubmit) {
        onSubmit(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageSearch = () => {
    // Placeholder for image search functionality
    alert('Image search coming soon!');
  };

  const activeFiltersCount = filters ? 
    Object.values(filters).reduce((count, filterArray) => count + (filterArray?.length || 0), 0) : 0;

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'shadow-lg' : 'shadow-md'
      }`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 150);
              setShowSuggestions(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSubmit) {
                onSubmit(value);
                inputRef.current?.blur();
              }
            }}
            placeholder={placeholder}
            className="pl-10 pr-20 py-3 text-base rounded-full border-0 bg-white focus:ring-2 focus:ring-blue-500"
          />

          {/* Action Buttons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {showVoiceSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className={`h-8 w-8 p-0 rounded-full ${
                  isListening ? 'bg-red-100 text-red-600' : ''
                }`}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
              </Button>
            )}

            {showImageSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageSearch}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}

            {/* Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full relative"
                >
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <MobileSearchFilters 
                filters={filters} 
                onFiltersChange={onFiltersChange} 
              />
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(suggestion);
                if (onSubmit) {
                  onSubmit(suggestion);
                }
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3"
            >
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Voice Search Indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <Mic className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Listening...</span>
          </div>
          <p className="text-xs text-red-500 mt-1">Speak now to search</p>
        </div>
      )}
    </div>
  );
}

function MobileSearchFilters({ 
  filters, 
  onFiltersChange 
}: {
  filters?: any;
  onFiltersChange?: (filters: any) => void;
}) {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const filterOptions = {
    party: ['BJP', 'Congress', 'AAP', 'TMC', 'DMK', 'AIADMK', 'SP', 'BSP'],
    state: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Uttar Pradesh'],
    position: ['Chief Minister', 'Minister', 'MLA', 'MP', 'Mayor', 'Councillor'],
  };

  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    const newFilters = { ...localFilters };
    
    if (!newFilters[category]) {
      newFilters[category] = [];
    }

    if (checked) {
      newFilters[category] = [...newFilters[category], value];
    } else {
      newFilters[category] = newFilters[category].filter((item: string) => item !== value);
    }

    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
  };

  const clearFilters = () => {
    setLocalFilters({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  return (
    <SheetContent side="bottom" className="h-[80vh]">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(filterOptions).map(([category, options]) => (
            <div key={category}>
              <h3 className="font-medium text-sm text-gray-900 mb-3 capitalize">
                {category}
              </h3>
              <div className="space-y-2">
                {options.map((option) => (
                  <label key={option} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters[category]?.includes(option) || false}
                      onChange={(e) => handleFilterChange(category, option, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}