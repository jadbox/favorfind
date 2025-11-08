import React, { useState, useEffect } from 'react';

interface StepSettingsProps {
  selections: string[];
}

const StepSettings: React.FC<StepSettingsProps> = ({ selections }) => {
  const [preferences, setPreferences] = useState('');
  // Use only the top-level category (first selection) for localStorage key
  const topLevelCategory = selections.length > 0 ? selections[0] : '';
  const localStorageKey = topLevelCategory ? `${topLevelCategory}-preferences` : '';

  useEffect(() => {
    if (localStorageKey) {
      const savedPreferences = localStorage.getItem(localStorageKey);
      if (savedPreferences) {
        setPreferences(savedPreferences);
      } else {
        setPreferences('');
      }
    }
  }, [localStorageKey]);

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPreferences = e.target.value;
    setPreferences(newPreferences);
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, newPreferences);
    }
  };

  const handleClear = () => {
    setPreferences('');
    if (localStorageKey) {
      localStorage.removeItem(localStorageKey);
    }
  };

  if (selections.length === 0) {
    return null;
  }

  if (!topLevelCategory) {
    return null;
  }

  return (
    <div className="mt-6">
      <label htmlFor="preferences" className="block text-lg font-medium text-white mb-3">
        {topLevelCategory.charAt(0).toUpperCase() + topLevelCategory.slice(1)} Preferences:
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          id="preferences"
          value={preferences}
          onChange={handlePreferencesChange}
          placeholder={`e.g., repairable, open source, trendy`}
          className="flex-1 rounded-lg border-2 border-gray-600 bg-gray-800 text-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
        />
        {preferences && (
          <button
            onClick={handleClear}
            className="px-4 py-3 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex-shrink-0"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default StepSettings;
