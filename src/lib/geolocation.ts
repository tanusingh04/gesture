// Geolocation utility for automatic location detection

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Please enter address manually.'));
      return;
    }

    // Request location with better error handling
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('Location obtained:', { latitude, longitude });
        
        try {
          // Reverse geocoding to get address from coordinates
          const address = await reverseGeocode(latitude, longitude);
          console.log('Reverse geocoded address:', address);
          
          resolve({
            latitude,
            longitude,
            ...address
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          // Return coordinates even if reverse geocoding fails
          resolve({
            latitude,
            longitude
          });
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings, or enter address manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please enter address manually.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter address manually.';
            break;
          default:
            errorMessage += 'Please enter address manually.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000 // Accept cached location up to 1 minute old
      }
    );
  });
};

// Reverse geocoding using a free API (Nominatim OpenStreetMap)
const reverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
  try {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GSGroceryShop/1.0 (contact@gsgrocery.com)',
          'Accept': 'application/json'
        },
        // Add timeout
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error('No address data returned');
    }
    
    const address = data.address || {};

    // Extract address components
    const city = address.city || address.town || address.village || address.county || address.district || '';
    const state = address.state || address.region || '';
    const pincode = address.postcode || '';

    console.log('Geocoded data:', { city, state, pincode, fullAddress: data.display_name });

    return {
      address: data.display_name || `${city}, ${state}`,
      city,
      state,
      pincode
    };
  } catch (error: any) {
    console.error('Reverse geocoding error:', error);
    
    // If it's a timeout or network error, return empty but don't fail
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      console.warn('Geocoding service unavailable, using coordinates only');
      return {};
    }
    
    throw error;
  }
};

// Get pincode from coordinates (for validation)
export const getPincodeFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const location = await reverseGeocode(lat, lng);
    return location.pincode || null;
  } catch {
    return null;
  }
};

