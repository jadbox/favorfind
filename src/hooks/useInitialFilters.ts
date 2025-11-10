import { useState, useEffect } from "react";

export const useInitialFilters = () => {
  const [locationString, setLocationString] = useState("");
  const [initialLocationString, setInitialLocationString] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [initialPreferences, setInitialPreferences] = useState<string[]>([]);

  useEffect(() => {
    // Check localStorage for location
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const { location } = JSON.parse(savedSettings);
      if (location && location.cityName) {
        const locString = [location.cityName, location.stateName]
          .filter(Boolean)
          .join(", ");
        setLocationEnabled(true);
        setLocationString(locString);
        setInitialLocationString(locString);
      }
    }

    // Check current URL query for existing preferences
    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get("q") || "";
    const queryLower = query.toLowerCase();

    const qualityMap: { [key: string]: string[] } = {
      newest: ["newest", "new", "latest \\d{4}"],
      budget: ["budget"],
      repairable: ["repairable"],
      "durable with great warranty": ["durable with great warranty"],
      popular: ["popular"],
      "eco-friendly": ["eco-friendly", "ecofriendly"],
      "all natural": ["all natural", "natural"],
      "good employer": ["good employer"],
      "locally made": ["locally made"],
    };

    const existingPreferences: string[] = [];
    for (const pref in qualityMap) {
      const terms = qualityMap[pref];
      if (
        terms &&
        terms.some((term) => {
          const regex = new RegExp(`\\b${term}\\b`, "i");
          return regex.test(queryLower);
        })
      ) {
        existingPreferences.push(pref);
      }
    }

    if (existingPreferences.length > 0) {
      setPreferences(existingPreferences);
      setInitialPreferences(existingPreferences);
    }
  }, []);

  return {
    locationString,
    setLocationString,
    initialLocationString,
    locationEnabled,
    setLocationEnabled,
    preferences,
    setPreferences,
    initialPreferences,
  };
};
