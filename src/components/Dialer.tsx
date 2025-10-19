import React, { useState, useEffect } from "react";
import { dialerConfig, type MenuItem } from "../config/dialerConfig";
import { LoaderCircle, Search } from "lucide-react";
import * as lucideIcons from "lucide-react";

const getIcon = (name: string) => {
  const icon = lucideIcons[name as keyof typeof lucideIcons];
  return icon || Search;
};

const Dialer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<string[]>([]);
  const [thirdLevelMenu, setThirdLevelMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === 3 && selections.length === 2) {
      const fetchThirdLevelMenu = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch("/api/dialer/generateMenu", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ selections }),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch the third menu.");
          }
          const data = await response.json();
          const menuItemsWithIcons = data.map((item: any) => ({
            ...item,
            icon: getIcon(item.icon),
          }));
          setThirdLevelMenu(menuItemsWithIcons);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchThirdLevelMenu();
    }
  }, [step, selections]);

  const handleSelect = (item: MenuItem) => {
    const newSelections = [...selections, item.value];
    setSelections(newSelections);

    if (step < 3) {
      setStep(step + 1);
    } else {
      const query = newSelections.join("+");
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const renderMenu = () => {
    let menuItems: MenuItem[] = [];
    let title = "";

    switch (step) {
      case 1:
        menuItems = dialerConfig.topLevel;
        title = "What do you want to do?";
        break;
      case 2:
        const firstSelection = selections[0];
        if (firstSelection && dialerConfig.secondLevel[firstSelection]) {
          menuItems = dialerConfig.secondLevel[firstSelection];
          title = `What kind of "${firstSelection}"?`;
        }
        break;
      case 3:
        menuItems = thirdLevelMenu;
        title = `What about "${selections[1]}"?`;
        break;
      default:
        return null;
    }

    return (
      <div>
        <h2 className="text-2xl text-center font-bold mb-6">{title}</h2>
        {loading && (
          <div className="flex justify-center items-center">
            <LoaderCircle className="animate-spin h-12 w-12" />
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleSelect(item)}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-700 transition-colors"
              >
                <item.icon className="h-10 w-10 mb-2" />
                <span className="text-center">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return <div className="w-full max-w-2xl mx-auto">{renderMenu()}</div>;
};

export default Dialer;
