"use client";

import { useState, useEffect, useRef } from "react";
import { getAddressSuggestions, AddressSuggestion } from "@/lib/addressService";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function AutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "",
  className = "",
  required = false
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Get suggestions as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Remove delay - fetch immediately
    setIsLoading(true);
    getAddressSuggestions(value)
      .then(suggestions => {
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      })
      .catch(error => {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    // Extract just the street address (number + street name)
    const addressComponents = suggestion.address_components || [];
    const streetNumber = addressComponents.find(c => c.types.includes("street_number"))?.long_name || "";
    const streetName = addressComponents.find(c => c.types.includes("route"))?.long_name || "";
    const streetAddress = `${streetNumber} ${streetName}`.trim();
    
    onChange(streetAddress);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${className}`}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 glass-strong border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const addressComponents = suggestion.address_components || [];
            const streetNumber = addressComponents.find(c => c.types.includes("street_number"))?.long_name || "";
            const streetName = addressComponents.find(c => c.types.includes("route"))?.long_name || "";
            const city = addressComponents.find(c => c.types.includes("locality"))?.long_name || "";
            const state = addressComponents.find(c => c.types.includes("administrative_area_level_1"))?.short_name || "";
            const zip = addressComponents.find(c => c.types.includes("postal_code"))?.long_name || "";
            
            return (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-card/60 focus:bg-card/60 focus:outline-none border-b border-border/30 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-700">
                    {streetNumber}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {streetNumber} {streetName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {city}, {state} {zip}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
