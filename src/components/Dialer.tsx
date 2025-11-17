import React, { useState, useEffect, useCallback } from "react";
import { dialerConfig, type MenuItem } from "../config/dialerConfig";
import { LoaderCircle, Search, PlusCircle, RotateCcw } from "lucide-react";
import * as lucideIcons from "lucide-react";
import { LoadingUtils } from "../utils/loadingUtils";
import StepSettings from "./StepSettings";

const TOTAL_STEPS = 3; // Define the total number of menu steps

const getIcon = (name: string) => {
  const icon = lucideIcons[name as keyof typeof lucideIcons];
  return icon || Search;
};

const Dialer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<string[]>([]);
  const [menuHistory, setMenuHistory] = useState<MenuItem[][]>([
    dialerConfig.topLevel,
  ]);
  const [excludedItems, setExcludedItems] = useState<Record<number, string[]>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userSettings, setUserSettings] = useState<{ location: { cityName: string; stateName: string; countryName: string; }; preferences: string; } | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }
  }, []);

  const fetchDynamicMenu = async (
    currentSelections: string[],
    currentStep: number,
    exclude: string[] = []
  ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/dialer/generateMenu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selections: currentSelections, exclude }),
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch menu for step ${currentStep}.`);
        }
        const data = await response.json();
        const menuItemsWithIcons = data.map((item: any) => ({
          ...item,
          icon: getIcon(item.icon),
        }));

        setMenuHistory((prev) => {
          const newHistory = [...prev];
          newHistory[currentStep - 1] = menuItemsWithIcons;
          return newHistory;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSelect = (item: MenuItem) => {
    // Set transitioning state to disable interactions and trigger fade-out via CSS
    setIsTransitioning(true);
    
    // Wait for fade-out animation before proceeding
    setTimeout(() => {
      const newSelections = [...selections, item.value];
      setSelections(newSelections);

      if (step < TOTAL_STEPS) {
        const nextStep = step + 1;
        let nextMenuItems: MenuItem[] = [];

        if (nextStep === 2) {
          const firstSelection = newSelections[0];
          if (firstSelection && dialerConfig.secondLevel[firstSelection]) {
            nextMenuItems = dialerConfig.secondLevel[firstSelection];
          }
        }

        setMenuHistory((prev) => [...prev.slice(0, nextStep - 1), nextMenuItems]);
        setStep(nextStep);
        setIsTransitioning(false);

        if (nextStep > 2) {
          fetchDynamicMenu(newSelections, nextStep);
        }
      } else {
        let query = newSelections.splice(1).join(" "); // use space to join selections
        // const removeTopLevel = newSelectionssplice(1).join(',').trim();
        
        // Append location if available
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const { location } = JSON.parse(savedSettings);
          if (location && location.cityName && location.stateName) {
            const locationString = [location.cityName, location.stateName].filter(Boolean).join(", ");
            if (locationString) {
              query = `${query} (in ${locationString})`;
            }
          }
        }

        // Append top-level category preferences
        const topLevelCategory = newSelections[0];
        const localStorageKey = topLevelCategory ? `${topLevelCategory}-preferences` : '';
        const categoryPreferences = localStorageKey ? localStorage.getItem(localStorageKey) : null;
        if (categoryPreferences) {

          
          query = `${query}. Preferences include ${categoryPreferences}`;
        }

        LoadingUtils.show();
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    }, 210);
  };

  const handleMore = () => {
    const currentMenuItems = menuHistory[step - 1] || [];
    const newExclusions = [
      ...(excludedItems[step] || []),
      ...currentMenuItems.map((i) => i.value),
    ];

    setExcludedItems((prev) => ({ ...prev, [step]: newExclusions }));

    fetchDynamicMenu(selections, step, newExclusions);
  };

  const handleRestart = () => {
    setStep(1);
    setSelections([]);
    setMenuHistory([dialerConfig.topLevel]);
    setExcludedItems({});
    setError(null);
  };

  const renderMenu = () => {
    const currentMenuItems = menuHistory[step - 1] || [];
    let title = "";

    switch (step) {
      case 1:
        title = "What do you need help deciding?";
        break;
      case 2:
        title = `Buying what kind of ${selections[0]}?`;
        break;
      case 3:
        title = `Buying what kind of ${selections[1]}?`;
        break;
      case 4:
        title = `Lastly, buying what kind of ${selections[1]} ${selections[2]}?`;
        break;
      default:
        return null;
    }

    return (
      <div>
        <div className="progress-indicator">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`progress-step ${step >= s ? "active" : ""}`}
            />
          ))}
        </div>
        <h2 className="text-2xl text-center font-bold mb-6">{title}</h2>
        {loading && (
          <div className="flex justify-center items-center">
            <LoaderCircle className="animate-spin h-12 w-12" />
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && (
          <div 
            key={step} 
            className={`grid grid-cols-2 md:grid-cols-3 gap-4 menu-grid ${isTransitioning ? 'transitioning' : ''}`}
          >
            {currentMenuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleSelect(item)}
                disabled={isTransitioning}
                className="menu-item flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-700 transition-all"
              >
                <item.icon className="h-10 w-10 mb-2" />
                <span className="text-center">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        <StepSettings selections={selections} />
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={handleRestart}
            className="flex items-center justify-center px-6 py-3 border-2 border-gray-600 rounded-lg hover:bg-purple-600/20 hover:border-purple-500 transition-all duration-200 text-lg font-semibold"
          >
            <RotateCcw className="h-6 w-6 mr-2" />
            <span>Restart</span>
          </button>
          {step > 1 && (
            <button
              onClick={handleMore}
              className="flex items-center justify-center px-6 py-3 border-2 border-purple-500 bg-purple-600/10 rounded-lg hover:bg-purple-600/30 hover:border-purple-400 transition-all duration-200 text-lg font-semibold"
            >
              <PlusCircle className="h-6 w-6 mr-2" />
              <span>More</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return <div className="w-full max-w-2xl mx-auto">{renderMenu()}</div>;
};

export default Dialer;
