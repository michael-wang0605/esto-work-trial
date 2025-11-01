"use client";

import { useState, useEffect, useRef } from "react";
import { validateAddress, getAddressSuggestions, AddressSuggestion } from "@/lib/addressService";

interface AddressInputProps {
  onAddressChange: (address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    fullAddress: string;
  }) => void;
  className?: string;
}

export default function AddressInput({
  onAddressChange,
  className = ""
}: AddressInputProps) {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Parse address components from OpenCage result
  const parseAddressComponents = (suggestion: AddressSuggestion) => {
    const components = suggestion.address_components;
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let zip = "";

    components.forEach(component => {
      const types = component.types;
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        streetName = component.long_name;
      } else if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      } else if (types.includes("postal_code")) {
        zip = component.long_name;
      }
    });

    return {
      street: `${streetNumber} ${streetName}`.trim(),
      city,
      state,
      zip
    };
  };

  // Get suggestions as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const query = `${street} ${city} ${state} ${zip}`.trim();
    
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const suggestions = await getAddressSuggestions(query);
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [street, city, state, zip]);

  // Validate address when all fields are filled
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const fullAddress = `${street} ${city} ${state} ${zip}`.trim();
    if (!fullAddress) {
      setIsValid(false);
      setValidationError(null);
      onAddressChange({ street, city, state, zip, fullAddress: "" });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const result = await validateAddress(fullAddress);
        
        if (result.isValid) {
          setIsValid(true);
          setValidationError(null);
          onAddressChange({ street, city, state, zip, fullAddress: result.formattedAddress || fullAddress });
        } else {
          setIsValid(false);
          setValidationError(result.error || 'Invalid address');
          onAddressChange({ street, city, state, zip, fullAddress });
        }
      } catch (error) {
        setIsValid(false);
        setValidationError('Unable to validate address');
        onAddressChange({ street, city, state, zip, fullAddress });
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [street, city, state, zip, onAddressChange]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const parsed = parseAddressComponents(suggestion);
    setStreet(parsed.street);
    setCity(parsed.city);
    setState(parsed.state);
    setZip(parsed.zip);
    setShowSuggestions(false);
    setIsValid(true);
    setValidationError(null);
    onAddressChange({
      street: parsed.street,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      fullAddress: suggestion.formatted_address
    });
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input change for any field
  const handleFieldChange = (field: string, value: string) => {
    if (field === 'street') setStreet(value);
    else if (field === 'city') setCity(value);
    else if (field === 'state') setState(value);
    else if (field === 'zip') setZip(value);
    
    // Show suggestions if we have any
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
    <div className={`space-y-4 relative ${className}`}>
      {/* Street Address */}
      <div className="relative">
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Street Address *
        </label>
        <input
          ref={inputRef}
          type="text"
          value={street}
          onChange={(e) => handleFieldChange('street', e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="123 Main Street"
          className={`w-full px-4 py-3 glass rounded-[19px] border text-sm text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${
            validationError ? 'border-destructive/50 bg-destructive/5' : 
            isValid ? 'border-green-400/50 bg-green-400/5' : 
            'border-border/50 bg-input'
          }`}
        />
      </div>

      {/* City, State, Zip Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            City *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Atlanta"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationError ? 'border-red-300 bg-red-50' : 
              isValid ? 'border-green-300 bg-green-50' : 
              'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            State *
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="GA"
            maxLength={2}
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationError ? 'border-red-300 bg-red-50' : 
              isValid ? 'border-green-300 bg-green-50' : 
              'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            value={zip}
            onChange={(e) => handleFieldChange('zip', e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="30309"
            maxLength={5}
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationError ? 'border-red-300 bg-red-50' : 
              isValid ? 'border-green-300 bg-green-50' : 
              'border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 glass-strong border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto"
          style={{ top: '100%', left: 0 }}
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

      {/* Validation status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValidating && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Validating address...</span>
            </div>
          )}
          
          {!isValidating && street && city && state && zip && (
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-green-600">Address validated</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-xs text-red-600">Invalid address</span>
                </>
              )}
            </div>
          )}
        </div>

        {validationError && (
          <div className="text-xs text-red-600">
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
}
