# Address Validation Setup

## Overview
The property creation form now includes comprehensive address validation and autocomplete powered by OpenCage Geocoding API.

## Features
- **Separate Address Fields**: Street, City, State, ZIP Code
- **Real-time Validation**: Validates addresses as you type
- **Autocomplete Suggestions**: Shows address suggestions from OpenCage API
- **Smart Parsing**: Automatically fills all fields when selecting a suggestion
- **Fallback Validation**: Basic validation when API is unavailable

## Setup Instructions

### 1. Get OpenCage API Key (Optional but Recommended)
1. Visit [OpenCage Data](https://opencagedata.com/api)
2. Sign up for a free account (2,500 requests/day)
3. Get your API key from the dashboard

### 2. Configure Environment Variables
Create a `.env.local` file in the frontend directory:

```bash
# OpenCage Geocoding API Key
NEXT_PUBLIC_OPENCAGE_API_KEY=your_api_key_here

# Backend URL
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### 3. How It Works

#### Without API Key
- Uses basic pattern-based validation
- Checks for street numbers, street names, and city names
- No autocomplete suggestions
- Still validates address format

#### With API Key
- Real-time address validation
- Autocomplete suggestions as you type
- Parses address components automatically
- Validates against real addresses

## Usage Examples

### Typing "7524 Man" will show suggestions like:
- 7524 Manheim Rd, Johns Creek, GA 30097
- 7524 Manchester St, Atlanta, GA 30309
- 7524 Mansfield Ave, Decatur, GA 30030

### Selecting a suggestion automatically fills:
- **Street**: 7524 Manheim Rd
- **City**: Johns Creek
- **State**: GA
- **ZIP**: 30097

## Technical Details

### AddressInput Component
- Debounced API calls (300ms delay)
- Handles keyboard navigation
- Shows loading states
- Graceful error handling

### Address Service
- OpenCage Geocoding API integration
- Fallback validation system
- Component parsing for US addresses
- Error handling and retry logic

## Troubleshooting

### No Suggestions Appearing
1. Check if API key is set correctly
2. Verify internet connection
3. Check browser console for errors
4. Ensure address has at least 3 characters

### Validation Not Working
1. Check API key validity
2. Verify address format
3. Check network connectivity
4. Review console for error messages

### Performance Issues
- API calls are debounced to prevent excessive requests
- Suggestions are limited to 5 results
- Caching is handled by the browser

## Cost Considerations
- Free tier: 2,500 requests/day
- Paid plans start at $0.001 per request
- Consider implementing caching for production use
