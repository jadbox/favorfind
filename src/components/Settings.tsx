import React, { useState, useEffect } from 'react';
import LocationSelector from './LocationSelector';

interface LocationData {
  countryId: number;
  stateId: number;
  cityId: number;
  countryName: string;
  stateName: string;
  cityName: string;
}

const Settings = () => {
  const [location, setLocation] = useState<LocationData>({
    countryId: 0,
    stateId: 0,
    cityId: 0,
    countryName: '',
    stateName: '',
    cityName: '',
  });
  const [preferences, setPreferences] = useState('');
  const [initialLocation, setInitialLocation] = useState<LocationData | undefined>(undefined);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const { location, preferences } = JSON.parse(savedSettings);
      if (location) {
        setInitialLocation(location);
        setLocation(location);
      }
      setPreferences(preferences || '');
    }
  }, []);

  const handleSave = () => {
    const settings = {
      location,
      preferences,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white">Settings</h2>
      
      <LocationSelector
        initialLocation={initialLocation}
        onChange={setLocation}
        autoDetectOnLoad={true}
      />
      
      <div className="mb-6">
        <label htmlFor="preferences" className="block text-lg font-medium text-white mb-3">
          About my preferences
        </label>
        <textarea
          id="preferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          rows={4}
          placeholder="e.g., I prefer natural remedies, avoid certain ingredients, etc."
          className="w-full rounded-lg border-2 border-gray-600 bg-gray-800 text-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
        />
      </div>
      
      <button 
        onClick={handleSave}
        className="inline-flex justify-center px-8 py-3 border-2 border-purple-500 bg-purple-600/20 rounded-lg hover:bg-purple-600/40 hover:border-purple-400 transition-all duration-200 text-lg font-semibold text-white"
      >
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
