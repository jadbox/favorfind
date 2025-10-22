import React, { useState, useEffect } from "react";
import { Filter, MapPin } from "lucide-react";
import { LoadingUtils } from "../utils/loadingUtils";

interface SearchResultsFiltersProps {
  contentType: string;
  sourceType: string;
  datePublished: string;
  sortBy: "relevance" | "popular" | "date";
}

const SearchResultsFilters: React.FC<SearchResultsFiltersProps> = (props) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationString, setLocationString] = useState('');
  const [initialLocationString, setInitialLocationString] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    // Check localStorage for location
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const { location } = JSON.parse(savedSettings);
      if (location && location.cityName) {
        const locString = [location.cityName, location.stateName].filter(Boolean).join(', ');
        setLocationEnabled(true);
        setLocationDetected(true);
        setLocationString(locString);
        setInitialLocationString(locString);
      }
    }

    // Check current URL query for existing preferences
    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get("q") || '';
    const queryLower = query.toLowerCase();
    
    const existingPreferences: string[] = [];
    const qualityTerms = ['budget', 'repairable', 'long lasting', 'popular'];
    
    qualityTerms.forEach(term => {
      if (queryLower.includes(term.toLowerCase())) {
        existingPreferences.push(term);
      }
    });
    
    if (existingPreferences.length > 0) {
      setPreferences(existingPreferences);
    }
  }, []);

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
        setInitialLocationString(locString);
        
        // Redirect to updated query with the detected location
        redirectToUpdatedQuery(locString, true);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      alert('Unable to detect location. Please ensure location permissions are enabled.');
      setIsDetectingLocation(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationString(e.target.value);
  };

  const redirectToUpdatedQuery = (newLocationString: string, enableLocation: boolean) => {
    LoadingUtils.show();

    const currentUrl = new URL(window.location.href);
    let query = currentUrl.searchParams.get("q") || '';

    // Remove preference keywords from query
    const queryParts = query.split(' ').filter(part => !['budget', 'repairable', 'long', 'lasting', 'popular'].includes(part));
    let baseQuery = queryParts.join(' ');

    // Remove old location pattern "(in [location])" if it exists
    const locationPattern = /\s*\(in [^)]+\)\s*$/;
    baseQuery = baseQuery.replace(locationPattern, '').trim();

    // Build new query with updated location
    let finalQuery = baseQuery;
    if (enableLocation && newLocationString) {
      finalQuery = `${baseQuery} (in ${newLocationString})`;
    }

    // Only redirect if query has actually changed
    const currentQuery = currentUrl.searchParams.get("q") || '';
    if (finalQuery.trim() !== currentQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(finalQuery.trim())}`;
    } else {
      LoadingUtils.hide();
    }
  };

  const handleSaveLocation = () => {
    const parts = locationString.split(',').map(p => p.trim());
    const cityName = parts[0] || '';
    const stateName = parts[1] || '';

    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const newLocation = { ...settings.location, cityName, stateName };
    localStorage.setItem('userSettings', JSON.stringify({ ...settings, location: newLocation }));
    setInitialLocationString(locationString);

    // Redirect to updated query
    redirectToUpdatedQuery(locationString, true);
  };

  const handleLocationEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    const previousLocationString = locationString;
    
    setLocationEnabled(isEnabled);

    if (isEnabled) {
      if (!locationDetected) {
        handleDetectLocation();
      }
    } else {
      setLocationDetected(false);
      setLocationString('');
      setInitialLocationString('');
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        delete settings.location;
        localStorage.setItem('userSettings', JSON.stringify(settings));
      }

      // Redirect to query without location if location was previously set
      if (previousLocationString) {
        redirectToUpdatedQuery('', false);
      }
    }
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const newPreferences = checked 
      ? [...preferences, value] 
      : preferences.filter(p => p !== value);
    
    setPreferences(newPreferences);
    
    // If unchecking, immediately update the query
    if (!checked) {
      LoadingUtils.show();
      
      const currentUrl = new URL(window.location.href);
      let query = currentUrl.searchParams.get("q") || '';
      
      // Remove all preference keywords from query
      const queryParts = query.split(' ').filter(part => 
        !['budget', 'repairable', 'long', 'lasting', 'popular'].includes(part)
      );
      let baseQuery = queryParts.join(' ');
      
      // Remove old location pattern if exists
      const locationPattern = /\s*\(in [^)]+\)\s*$/;
      baseQuery = baseQuery.replace(locationPattern, '').trim();
      
      // Rebuild query with remaining preferences
      let finalQuery = baseQuery;
      if (locationEnabled && locationString) {
        finalQuery = `${baseQuery} (in ${locationString})`;
      }
      if (newPreferences.length > 0) {
        finalQuery = `${finalQuery} ${newPreferences.join(' ')}`;
      }
      
      window.location.href = `/search?q=${encodeURIComponent(finalQuery.trim())}`;
    }
  };

  const hasChanges = locationString !== initialLocationString || preferences.length > 0;

  const handleUpdateFilters = () => {
    LoadingUtils.show();

    const createHiddenInput = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      return input;
    };

    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/search";
    form.style.display = "none";

    const currentUrl = new URL(window.location.href);
    let query = currentUrl.searchParams.get("q") || '';

    // Remove preference keywords from query
    const queryParts = query.split(' ').filter(part => !['budget', 'repairable', 'long', 'lasting', 'popular'].includes(part));
    let baseQuery = queryParts.join(' ');

    // Remove old location pattern "(in [location])" if it exists
    const locationPattern = /\s*\(in [^)]+\)\s*$/;
    baseQuery = baseQuery.replace(locationPattern, '').trim();
    
    let finalQuery = baseQuery;
    if (locationEnabled && locationString) {
        finalQuery = `${baseQuery} (in ${locationString})`;
    }
    if (preferences.length > 0) {
        finalQuery = `${finalQuery} ${preferences.join(' ')}`;
    }

    form.appendChild(createHiddenInput("q", finalQuery.trim()));
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Filters</h2>
      </div>

      {/* Filter Panel */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-6">
        {/* Buy Local Section */}
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
                    onChange={handleLocationChange}
                    className="max-w-2xl flex-1 px-4 py-2.5 text-sm border border-purple-500/50 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="City, State"
                  />
                  {locationString === initialLocationString ? (
                    <span/>
                  ) : (
                    <button
                      onClick={handleSaveLocation}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/20 whitespace-nowrap"
                    >
                      Save Location
                    </button>
                  )}
                </div>
              ) : (
                <span/>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-200">
            Qualities:
          </label>
          <div className="flex flex-wrap gap-4">
            {['budget', 'repairable', 'long lasting', 'popular'].map(pref => (
              <label 
                key={pref} 
                className="flex items-center gap-2.5 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  value={pref}
                  checked={preferences.includes(pref)}
                  onChange={handlePreferenceChange}
                  className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 bg-gray-800 cursor-pointer"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors select-none">
                  {pref.charAt(0).toUpperCase() + pref.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Update Button */}
      {hasChanges && (
        <div className="flex justify-end mt-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={handleUpdateFilters}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsFilters;
