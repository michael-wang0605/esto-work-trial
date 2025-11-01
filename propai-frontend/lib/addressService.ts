// Address validation and autocomplete service
export interface AddressSuggestion {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface AddressValidationResult {
  isValid: boolean;
  formattedAddress?: string;
  suggestions?: AddressSuggestion[];
  error?: string;
}

// Using OpenCage Geocoding API (free tier: 2500 requests/day)
const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

export async function validateAddress(address: string): Promise<AddressValidationResult> {
  if (!address.trim()) {
    return { isValid: false, error: 'Address is required' };
  }

  // If no API key is provided, use simple validation
  if (!OPENCAGE_API_KEY) {
    return simpleAddressValidation(address);
  }

  try {
    const response = await fetch(
      `${OPENCAGE_BASE_URL}?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}&limit=5&countrycode=us`
    );
    
    if (!response.ok) {
      throw new Error('Address validation service unavailable');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        isValid: true,
        formattedAddress: result.formatted,
        suggestions: data.results.map((item: any) => ({
          formatted_address: item.formatted,
          place_id: item.annotations?.geohash || Math.random().toString(),
          geometry: {
            location: {
              lat: item.geometry.lat,
              lng: item.geometry.lng
            }
          },
          address_components: item.components || []
        }))
      };
    } else {
      return {
        isValid: false,
        error: 'Address not found',
        suggestions: []
      };
    }
  } catch (error) {
    console.error('Address validation error:', error);
    // Fallback to simple validation if API fails
    return simpleAddressValidation(address);
  }
}

// Sort suggestions by street number relevance
function sortSuggestionsByStreetNumber(suggestions: AddressSuggestion[], query: string): AddressSuggestion[] {
  // First, filter out suggestions without street numbers
  const suggestionsWithStreetNumbers = suggestions.filter(suggestion => {
    const streetNumber = suggestion.address_components.find(c => c.types.includes("street_number"))?.long_name;
    return streetNumber && streetNumber.trim() !== "";
  });

  // Extract numbers from the query
  const queryNumbers = query.match(/\d+/g) || [];
  const queryNumber = queryNumbers[0]; // Get the first number found
  
  // Check if query starts with a number
  const queryStartsWithNumber = /^\d/.test(query.trim());
  
  if (!queryStartsWithNumber || !queryNumber) {
    // If query doesn't start with a number, sort by street name relevance
    return sortByStreetNameRelevance(suggestionsWithStreetNumbers, query);
  }

  // If query starts with a number, prioritize exact street number matches
  return suggestionsWithStreetNumbers.sort((a, b) => {
    const aStreetNumber = a.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
    const bStreetNumber = b.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
    
    // Check if street numbers start with the query number
    const aStartsWithQuery = aStreetNumber.startsWith(queryNumber);
    const bStartsWithQuery = bStreetNumber.startsWith(queryNumber);
    
    // Prioritize addresses that start with the query number
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;
    
    // If both or neither start with query number, sort by street number
    if (aStartsWithQuery && bStartsWithQuery) {
      const numA = parseInt(aStreetNumber) || 0;
      const numB = parseInt(bStreetNumber) || 0;
      return numA - numB;
    }
    
    // For non-matching addresses, sort by street number
    const numA = parseInt(aStreetNumber) || 0;
    const numB = parseInt(bStreetNumber) || 0;
    return numA - numB;
  });
}

// Sort by street name relevance when query doesn't start with numbers
function sortByStreetNameRelevance(suggestions: AddressSuggestion[], query: string): AddressSuggestion[] {
  const queryLower = query.toLowerCase().trim();
  
  return suggestions.sort((a, b) => {
    const aStreetName = a.address_components.find(c => c.types.includes("route"))?.long_name || "";
    const bStreetName = b.address_components.find(c => c.types.includes("route"))?.long_name || "";
    
    const aStreetLower = aStreetName.toLowerCase();
    const bStreetLower = bStreetName.toLowerCase();
    
    // Check if street names start with the query
    const aStartsWithQuery = aStreetLower.startsWith(queryLower);
    const bStartsWithQuery = bStreetLower.startsWith(queryLower);
    
    // Prioritize addresses that start with the query
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;
    
    // If both or neither start with query, sort by street number
    const aStreetNumber = a.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
    const bStreetNumber = b.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
    
    const numA = parseInt(aStreetNumber) || 0;
    const numB = parseInt(bStreetNumber) || 0;
    return numA - numB;
  });
}

export async function getAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  if (!query.trim()) {
    return [];
  }

  // If no API key is provided, return mock suggestions for testing
  if (!OPENCAGE_API_KEY) {
    return getMockSuggestions(query);
  }

  try {
    const response = await fetch(
      `${OPENCAGE_BASE_URL}?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=5&countrycode=us`
    );
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.results) {
      const suggestions = data.results.map((item: any) => {
        // Parse OpenCage components into our expected format
        const components = item.components || {};
        const addressComponents = [];
        
        // Map OpenCage components to our expected structure
        if (components.house_number) {
          addressComponents.push({
            long_name: components.house_number,
            short_name: components.house_number,
            types: ["street_number"]
          });
        }
        
        if (components.road) {
          addressComponents.push({
            long_name: components.road,
            short_name: components.road,
            types: ["route"]
          });
        }
        
        if (components.city || components.town || components.village) {
          const city = components.city || components.town || components.village;
          addressComponents.push({
            long_name: city,
            short_name: city,
            types: ["locality"]
          });
        }
        
        if (components.state) {
          addressComponents.push({
            long_name: components.state,
            short_name: components.state_code || components.state,
            types: ["administrative_area_level_1"]
          });
        }
        
        if (components.postcode) {
          addressComponents.push({
            long_name: components.postcode,
            short_name: components.postcode,
            types: ["postal_code"]
          });
        }
        
        return {
          formatted_address: item.formatted,
          place_id: item.annotations?.geohash || Math.random().toString(),
          geometry: {
            location: {
              lat: item.geometry.lat,
              lng: item.geometry.lng
            }
          },
          address_components: addressComponents
        };
      });

      // Sort suggestions by street number relevance
      return sortSuggestionsByStreetNumber(suggestions, query);
    }
    
    return [];
  } catch (error) {
    console.error('Address suggestions error:', error);
    return [];
  }
}

// Mock suggestions for testing when no API key is provided
function getMockSuggestions(query: string): AddressSuggestion[] {
  const mockSuggestions: AddressSuggestion[] = [
    {
      formatted_address: "123 Main St, Atlanta, GA 30309, USA",
      place_id: "mock-1",
      geometry: {
        location: {
          lat: 33.7490,
          lng: -84.3880
        }
      },
      address_components: [
        { long_name: "123", short_name: "123", types: ["street_number"] },
        { long_name: "Main St", short_name: "Main St", types: ["route"] },
        { long_name: "Atlanta", short_name: "Atlanta", types: ["locality"] },
        { long_name: "Georgia", short_name: "GA", types: ["administrative_area_level_1"] },
        { long_name: "30309", short_name: "30309", types: ["postal_code"] }
      ]
    },
    {
      formatted_address: "456 Oak Ave, Marietta, GA 30060, USA",
      place_id: "mock-2",
      geometry: {
        location: {
          lat: 33.9526,
          lng: -84.5499
        }
      },
      address_components: [
        { long_name: "456", short_name: "456", types: ["street_number"] },
        { long_name: "Oak Ave", short_name: "Oak Ave", types: ["route"] },
        { long_name: "Marietta", short_name: "Marietta", types: ["locality"] },
        { long_name: "Georgia", short_name: "GA", types: ["administrative_area_level_1"] },
        { long_name: "30060", short_name: "30060", types: ["postal_code"] }
      ]
    },
    {
      formatted_address: "789 Pine St, Alpharetta, GA 30004, USA",
      place_id: "mock-3",
      geometry: {
        location: {
          lat: 34.0754,
          lng: -84.2941
        }
      },
      address_components: [
        { long_name: "789", short_name: "789", types: ["street_number"] },
        { long_name: "Pine St", short_name: "Pine St", types: ["route"] },
        { long_name: "Alpharetta", short_name: "Alpharetta", types: ["locality"] },
        { long_name: "Georgia", short_name: "GA", types: ["administrative_area_level_1"] },
        { long_name: "30004", short_name: "30004", types: ["postal_code"] }
      ]
    },
    {
      formatted_address: "1000 Peachtree St, Atlanta, GA 30309, USA",
      place_id: "mock-4",
      geometry: {
        location: {
          lat: 33.7880,
          lng: -84.3840
        }
      },
      address_components: [
        { long_name: "1000", short_name: "1000", types: ["street_number"] },
        { long_name: "Peachtree St", short_name: "Peachtree St", types: ["route"] },
        { long_name: "Atlanta", short_name: "Atlanta", types: ["locality"] },
        { long_name: "Georgia", short_name: "GA", types: ["administrative_area_level_1"] },
        { long_name: "30309", short_name: "30309", types: ["postal_code"] }
      ]
    },
    {
      formatted_address: "2500 Piedmont Rd, Atlanta, GA 30324, USA",
      place_id: "mock-5",
      geometry: {
        location: {
          lat: 33.7900,
          lng: -84.3800
        }
      },
      address_components: [
        { long_name: "2500", short_name: "2500", types: ["street_number"] },
        { long_name: "Piedmont Rd", short_name: "Piedmont Rd", types: ["route"] },
        { long_name: "Atlanta", short_name: "Atlanta", types: ["locality"] },
        { long_name: "Georgia", short_name: "GA", types: ["administrative_area_level_1"] },
        { long_name: "30324", short_name: "30324", types: ["postal_code"] }
      ]
    },
    {
      formatted_address: "5000 Roswell Rd, Sandy Springs, GA 30342, USA",
      place_id: "mock-6",
      geometry: {
        location: {
          lat: 33.9200,
          lng: -84.3800
        }
      },
      address_components: [
        { long_name: "5000", short_name: "5000", types: ["street_number"] },
        { long_name: "Roswell Rd", short_name: "Roswell Rd", types: ["route"] },
        { long_name: "Sandy Springs", short_name: "Sandy Springs", types: ["locality"] },
        { long_name: "Georgia", short_name: "GA", types: ["administrative_area_level_1"] },
        { long_name: "30342", short_name: "30342", types: ["postal_code"] }
      ]
    }
  ];

  // Filter suggestions based on query and ensure they have street numbers
  const filtered = mockSuggestions.filter(suggestion => {
    const hasStreetNumber = suggestion.address_components.some(c => c.types.includes("street_number"));
    const matchesQuery = suggestion.formatted_address.toLowerCase().includes(query.toLowerCase());
    return hasStreetNumber && matchesQuery;
  });

  // Sort by street number relevance
  return sortSuggestionsByStreetNumber(filtered, query);
}

// Fallback to a simple validation if API is not available
export function simpleAddressValidation(address: string): AddressValidationResult {
  const trimmed = address.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Address is required' };
  }
  
  // Basic validation - check for common address patterns
  const hasNumber = /\d/.test(trimmed);
  const hasStreet = /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|cir|circle)\b/i.test(trimmed);
  const hasCity = /\b(atlanta|marietta|sandy springs|roswell|alpharetta|dunwoody|chamblee|brookhaven|decatur|stone mountain|tucker|duluth|norcross|lawrenceville|snellville|lilburn|dacula|suwanee|buford|flowery branch|gainesville|oakwood|winder|jefferson|athens|augusta|columbus|macon|savannah|valdosta|albany|rome|dalton|hinesville|warner robins|brunswick|college park|east point|hapeville|union city|fairburn|palmetto|peachtree city|fayetteville|newnan|carrollton|douglasville|villa rica|hiram|powder springs|dallas|cedartown|calhoun|adairsville|cartersville|acworth|kennesaw|woodstock|canton|ball ground|jasper|ellijay|blue ridge|dahlonega|cleveland|clarkesville|cornelia|toccoa|lavonia|hartwell|elberton|washington|greensboro|eatonton|milledgeville|gordon|fort valley|perry|warner robins|byron|centerville|roberta|knoxville|butler|reynolds|oakland|montezuma|vienna|cordele|ashburn|sylvester|leary|arlington|blakely|donalsonville|colquitt|bainbridge|cairo|thomasville|moultrie|tifton|fitzgerald|douglas|nicholls|alma|hazlehurst|jeffersonville|danville|dublin|wrightsville|sandersville|washington|sandersville|swainsboro|metter|reidsville|glennville|lyons|vidalia|clax|soperton|mount vernon|alamo|mcrae|helena|eastman|hawkinsville|unadilla|byron|fort valley|perry|warner robins|centerville|roberta|knoxville|butler|reynolds|oakland|montezuma|vienna|cordele|ashburn|sylvester|leary|arlington|blakely|donalsonville|colquitt|bainbridge|cairo|thomasville|moultrie|tifton|fitzgerald|douglas|nicholls|alma|hazlehurst|jeffersonville|danville|dublin|wrightsville|sandersville|washington|sandersville|swainsboro|metter|reidsville|glennville|lyons|vidalia|clax|soperton|mount vernon|alamo|mcrae|helena|eastman|hawkinsville|unadilla)\b/i.test(trimmed);
  
  if (hasNumber && hasStreet) {
    return { isValid: true, formattedAddress: trimmed };
  } else if (hasNumber && hasCity) {
    return { isValid: true, formattedAddress: trimmed };
  } else {
    return { 
      isValid: false, 
      error: 'Please enter a complete address with street number and name',
      suggestions: []
    };
  }
}
