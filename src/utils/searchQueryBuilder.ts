export const buildSearchQuery = (
  baseQuery: string,
  location: string,
  locationEnabled: boolean,
  preferences: string[]
): string => {
  let finalQuery = baseQuery;

  // Remove "latest [YEAR]" pattern first to avoid partial matches later
  const latestYearRegex = /\blatest\s+\d{4}\b/gi;
  finalQuery = finalQuery.replace(latestYearRegex, "");

  // Remove all quality preference keywords from query to avoid duplicates
  const allQualityTerms = [
    "newest",
    "new",
    "latest",
    "budget",
    "repairable",
    "durable with great warranty",
    "durable",
    "warranty",
    "popular",
    "eco-friendly",
    "ecofriendly",
    "all natural",
    "natural",
    "good employer",
    "locally made",
  ];
  allQualityTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    finalQuery = finalQuery.replace(regex, "");
  });

  finalQuery = finalQuery.replace(/\s\s+/g, " ").trim();

  // Remove old location pattern "(in [location])" if it exists
  const locationPattern = /\s*\(in [^)]+\)\s*$/;
  finalQuery = finalQuery.replace(locationPattern, "").trim();

  if (locationEnabled && location) {
    finalQuery = `${finalQuery} (in ${location})`;
  }

  if (preferences.length > 0) {
    const processedPreferences = preferences.map((p) => {
      if (p === "newest") {
        const currentYear = new Date().getFullYear();
        return `latest ${currentYear}`;
      }
      return p;
    });
    finalQuery = `${finalQuery} ${processedPreferences.join(" ")}`;
  }

  return finalQuery.trim();
};
