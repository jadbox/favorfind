import React, { useState, useEffect } from 'react';
import { LoadingUtils } from '../utils/loadingUtils';

interface LocationFilterProps {
  initialLocationString: string;
  onLocationChange: (locationString: string, enabled: boolean) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ initialLocationString, onLocationChange }) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(!!initialLocationString);
  const [locationDetected, setLocationDetected] = useState(!!initialLocationString);
  const [locationString, setLocationString] = useState(initialLocationString);

  useEffect(() => {
    setLocationString(initialLocationString);
    setLocationEnabled(!!initialLocationString);
    setLocationDetected(!!initialLocationString);
  }, [initialLocationString]);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: { 'User-Agent': 'FavorFind/1.0' },
        }
      );
      const data = await response.json();

      if (data.address) {
        const location = {
          cityName: data.address.city || data.address.town || data.address.village || '',
          stateName: data.address.state || '',
          countryName: data.address.country || '',
        };
        const settings = { location };
        localStorage.setItem('userSettings', JSON.stringify(settings));
        const locString = [location.cityName, location.stateName].filter(Boolean).join(', ');
        setLocationDetected(true);
        setLocationString(locString);
        onLocationChange(locString, true);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      alert('Unable to detect location. Please ensure location permissions are enabled.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleLocationEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setLocationEnabled(isEnabled);

    if (isEnabled) {
      if (!locationDetected) {
        handleDetectLocation();
      } else {
        onLocationChange(locationString, true);
      }
    } else {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        delete settings.location;
        localStorage.setItem('userSettings', JSON.stringify(settings));
      }
      onLocationChange('', false);
    }
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationString(e.target.value);
  };

  const handleSaveLocation = () => {
    const parts = locationString.split(',').map(p => p.trim());
    const cityName = parts[0] || '';
    const stateName = parts[1] || '';

    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const newLocation = { ...settings.location, cityName, stateName };
    localStorage.setItem('userSettings', JSON.stringify({ ...settings, location: newLocation }));
    
    onLocationChange(locationString, true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="location-toggle"
          checked={locationEnabled}
          onChange={handleLocationEnabledChange}
          className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 bg-gray-700 cursor-pointer"
        />
        <label 
          htmlFor="location-toggle"
          className="text-sm font-medium text-gray-200 cursor-pointer select-none"
        >
          Buy Local
        </label>
      </div>
      
      {locationEnabled && (
        <div className="ml-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {locationDetected ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={locationString}
                onChange={handleLocationInputChange}
                className="max-w-2xl flex-1 px-4 py-2.5 text-sm border border-purple-500/50 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="City, State"
              />
              {locationString !== initialLocationString && (
                <button
                  onClick={handleSaveLocation}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/20 whitespace-nowrap"
                >
                  Save Location
                </button>
              )}
            </div>
          ) : (
            isDetectingLocation ? (
              <p className="text-sm text-gray-400">Detecting location...</p>
            ) : (
              <button
                onClick={handleDetectLocation}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/20 whitespace-nowrap"
              >
                Detect My Location
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
