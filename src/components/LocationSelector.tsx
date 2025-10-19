import React, { useState, useEffect } from 'react';
import { CountrySelect, StateSelect, CitySelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

// Inline styles to override library defaults with very high specificity
const styleOverrides = `
  /* Force dark styling on inputs */
  .location-select-wrapper input,
  .location-select-wrapper input[type="text"] {
    background-color: rgb(55, 65, 81) !important;
    border: 2px solid rgb(75, 85, 99) !important;
    border-radius: 0.5rem !important;
    color: white !important;
    padding: 0.2rem 1rem !important;
  }
  
  /* Dropdown menus - target all possible containers */
  .location-select-wrapper div[class*="menu"],
  .location-select-wrapper ul,
  .location-select-wrapper [role="listbox"] {
    background-color: rgb(31, 41, 55) !important;
    border: 2px solid rgb(75, 85, 99) !important;
    border-radius: 0.5rem !important;
  }
  
  /* Dropdown options */
  .location-select-wrapper li,
  .location-select-wrapper [role="option"],
  .location-select-wrapper div[class*="option"] {
    background-color: rgb(31, 41, 55) !important;
    color: white !important;
    padding: 0.5rem 1rem !important;
  }
  
  .location-select-wrapper li:hover,
  .location-select-wrapper [role="option"]:hover {
    background-color: rgb(55, 65, 81) !important;
  }
`;

interface LocationData {
  countryId: number;
  stateId: number;
  cityId: number;
  countryName: string;
  stateName: string;
  cityName: string;
}

interface LocationSelectorProps {
  initialLocation?: LocationData;
  onChange: (location: LocationData) => void;
  autoDetectOnLoad?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  initialLocation, 
  onChange,
  autoDetectOnLoad = false
}) => {
  const [countryId, setCountryId] = useState(initialLocation?.countryId || 0);
  const [stateId, setStateId] = useState(initialLocation?.stateId || 0);
  const [cityId, setCityId] = useState(initialLocation?.cityId || 0);
  const [countryName, setCountryName] = useState(initialLocation?.countryName || '');
  const [stateName, setStateName] = useState(initialLocation?.stateName || '');
  const [cityName, setCityName] = useState(initialLocation?.cityName || '');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationKey, setLocationKey] = useState(0);

  useEffect(() => {
    // Auto-detect location on mount if enabled and no initial location
    if (autoDetectOnLoad && !initialLocation?.countryName && !initialLocation?.stateName && !initialLocation?.cityName) {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    // Notify parent of location changes
    onChange({
      countryId,
      stateId,
      cityId,
      countryName,
      stateName,
      cityName,
    });
  }, [countryId, stateId, cityId, countryName, stateName, cityName]);

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      // Get browser geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;

      // Use reverse geocoding to get location details
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FavorFind/1.0',
          },
        }
      );
      const data = await response.json();

      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || '';
        const country = data.address.country || '';

        // Set the names and force component remount with new key
        setCityName(city);
        setStateName(state);
        setCountryName(country);
        setCountryId(0);
        setStateId(0);
        setCityId(0);
        setLocationKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      // Only show alert if user manually clicked the button
      if (!autoDetectOnLoad) {
        alert('Unable to detect location. Please ensure location permissions are enabled.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleCountryChange = (e: any) => {
    setCountryId(e.id);
    setCountryName(e.name);
    setStateId(0);
    setStateName('');
    setCityId(0);
    setCityName('');
  };

  const handleStateChange = (e: any) => {
    setStateId(e.id);
    setStateName(e.name);
    setCityId(0);
    setCityName('');
  };

  const handleCityChange = (e: any) => {
    setCityId(e.id);
    setCityName(e.name);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleOverrides }} />
      <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-lg font-medium text-white">Location</label>
        <button
          onClick={detectLocation}
          disabled={isDetectingLocation}
          className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDetectingLocation ? 'Detecting...' : 'Auto-detect Location'}
        </button>
      </div>
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          {countryName && !countryId ? (
            <input
              type="text"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="Country"
              autoComplete="off"
              className="w-full rounded-lg border-2 border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer hover:border-gray-500 transition-colors"
            />
          ) : (
            <div className="cursor-pointer location-select-wrapper">
              <CountrySelect
                key={`country-${locationKey}`}
                onChange={handleCountryChange}
                placeHolder="Select Country"
                defaultValue={countryId > 0 ? { id: countryId, name: countryName } as any : undefined}
                containerClassName="location-select-wrapper"
                inputClassName="location-select-input"
              />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          {stateName && !stateId ? (
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="State"
              autoComplete="off"
              className="w-full rounded-lg border-2 border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer hover:border-gray-500 transition-colors"
            />
          ) : (
            <div className="cursor-pointer location-select-wrapper">
              <StateSelect
                key={`state-${locationKey}`}
                countryid={countryId}
                onChange={handleStateChange}
                placeHolder="Select State"
                defaultValue={stateId > 0 ? { id: stateId, name: stateName } as any : undefined}
                containerClassName="location-select-wrapper"
                inputClassName="location-select-input"
              />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          {cityName && !cityId ? (
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="City"
              autoComplete="off"
              className="w-full rounded-lg border-2 border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer hover:border-gray-500 transition-colors"
            />
          ) : (
            <div className="cursor-pointer location-select-wrapper">
              <CitySelect
                key={`city-${locationKey}`}
                countryid={countryId}
                stateid={stateId}
                onChange={handleCityChange}
                placeHolder="Select City"
                defaultValue={cityId > 0 ? { id: cityId, name: cityName } as any : undefined}
                containerClassName="location-select-wrapper"
                inputClassName="location-select-input"
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default LocationSelector;
