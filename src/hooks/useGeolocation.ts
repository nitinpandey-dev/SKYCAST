import { useState, useCallback } from 'react';
import { LocationInfo } from '../types/weather';
import { reverseGeocode } from '../services/weatherService';

interface GeolocationState {
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(async (): Promise<LocationInfo | null> => {
    setState({ loading: true, error: null });

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setState({ loading: false, error: 'Geolocation is not supported by your browser' });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const loc = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            setState({ loading: false, error: null });
            resolve(loc);
          } catch (e) {
            // Fallback if reverse geocoding fails but we have coords
            const loc: LocationInfo = {
              id: 'current',
              name: 'Current Location',
              country: '',
              countryCode: '',
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            setState({ loading: false, error: null });
            resolve(loc);
          }
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access or search for a city.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          setState({ loading: false, error: errorMessage });
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { ...state, requestLocation };
}
