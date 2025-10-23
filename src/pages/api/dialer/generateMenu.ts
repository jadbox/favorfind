import type { APIRoute } from "astro";
import { GoogleGenAI, Type } from "@google/genai";
import { getCachedData, setCachedData } from "../../../services/cache";

const COMMON_ICONS = [
  "Home",
  "Search",
  "Settings",
  "User",
  "Bell",
  "Mail",
  "Star",
  "Heart",
  "Check",
  "Info",
  "HelpCircle",
  "Calendar",
  "Camera",
  "Image",
  "Video",
  "Book",
  "Briefcase",
  "MapPin",
  "Globe",
  "Monitor",
  "Car",
  "Plane",
  "ShoppingCart",
];
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { selections, exclude = [] } = body;

    if (!Array.isArray(selections) || selections.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid selections provided." }),
        { status: 400 }
      );
    }

    console.log("exclude:", exclude);

    const cacheKey = `dialer:${selections.join(":")}:${exclude.join(",")}`;
    const cachedMenu = getCachedData(cacheKey);

    if (cachedMenu) {
      return new Response(JSON.stringify(cachedMenu), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `
      Generate a JSON array of up to 9 STRICT sub-categories for "${selections.join(
        ", "
      )}".
      
      CRITICAL: Each suggestion MUST be a direct subcategory that falls UNDER the given category in a hierarchical relationship.
      
      Examples of correct subcategories:
      - For "tablet": iPad, Android Tablets, Windows Tablets, Gaming Tablets, Drawing Tablets (NOT Smartphones, NOT Laptops)
      - For "electronics": Computers, Smartphones, Tablets, Cameras (NOT Furniture, NOT Clothing)
      - For "clothing": Shirts, Pants, Dresses, Shoes (NOT Accessories unless it's "clothing accessories")
      
      FORBIDDEN: Do NOT include sibling categories, parent categories, or merely related items.
      - If the category is "tablet", do NOT suggest "Smartphones" (sibling category)
      - If the category is "clothing", do NOT suggest "Fashion" (parent category)
      - If the category is "laptop", do NOT suggest "Desktop" (sibling category)
      
      Each item must be an object with "label", "value", and "icon" properties:
      - "label": A user-friendly name for the subcategory (capitalize appropriately)
      - "value": A URL-friendly slug (lowercase, hyphenated)
      - "icon": A relevant icon from lucide-react that describes the subcategory. Choose from: ${COMMON_ICONS.join(
        ", "
      )}
      ${`\nDo not include any of these higher categories: ${exclude.join(
        ", "
      )}, ${selections.join(", ")}`}
      
      Return ONLY the JSON array with no preamble or explanation.
    `;

    console.log("Generated prompt for dialer menu:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              icon: { type: Type.STRING },
            },
            required: ["label", "value", "icon"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text.trim());

    setCachedData(cacheKey, parsed);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating dynamic menu:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate the dynamic menu.",
      }),
      { status: 500 }
    );
  }
};
