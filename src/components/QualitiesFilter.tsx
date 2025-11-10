import React, { useState, useEffect } from 'react';

interface QualitiesFilterProps {
  initialPreferences: string[];
  onPreferencesChange: (preferences: string[]) => void;
}

const QualitiesFilter: React.FC<QualitiesFilterProps> = ({ initialPreferences, onPreferencesChange }) => {
  const [preferences, setPreferences] = useState<string[]>(initialPreferences);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const newPreferences = checked
      ? [...preferences, value]
      : preferences.filter(p => p !== value);
    setPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-200">
        Qualities:
      </label>
      <div className="flex flex-wrap gap-4">
        {['budget', 'newest', 'repairable', 'durable with great warranty', 'popular', 'eco-friendly', "all natural", "good employer", "locally made"].map(pref => (
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
  );
};

export default QualitiesFilter;
