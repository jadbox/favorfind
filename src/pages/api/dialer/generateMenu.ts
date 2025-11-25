import type { APIRoute } from "astro";
import { GoogleGenAI, Type } from "@google/genai";
import { getCachedData, setCachedData } from "../../../services/cache";
import {
  getClientIP,
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
} from "../../../services/rateLimiter";

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
    // Rate limit check
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

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
      return addRateLimitHeaders(
        new Response(JSON.stringify(cachedMenu), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
        rateLimitResult.remaining
      );
    }

    console.log("selections:", selections);

    const mainSelection = selections[selections.length - 1];
    const otherSelections = selections.slice(1, -1); // ignore top level selection;

    const prompt = `
      Generate a JSON array of up to 9 STRICT sub-categories of strictly "${mainSelection}", which is under the broader category of ${otherSelections.join(
      ", "
    )}.
      
      CRITICAL: Each suggestion MUST be a direct subcategory of desirable purchase features UNDER the given category in a hierarchical relationship. A TV should include OLED, QLED, LED projectors. Answers should NOT include a non-feature words "refresh rate".
      
      Examples of correct subcategories:
      - For "projectors", suggest "Home Theater Projectors", "Business Projectors", "Portable Projectors" (NOT "Electronics", NOT "TVs", NOT "OLED")
      - For "tablet": iPad, Android Tablets, Windows Tablets, Gaming Tablets, Drawing Tablets (NOT Smartphones, NOT Laptops)
      - For "electronics": Computers, Smartphones, Tablets, Cameras (NOT Furniture, NOT Clothing)
      - For "clothing": Shirts, Pants, Dresses, Shoes (NOT Accessories unless it's "clothing accessories")
      
      FORBIDDEN: Do NOT include sibling categories, parent categories, or merely related items.
      - If the category is "tablet", do NOT suggest "Smartphones" (sibling category)
      - If the category is "clothing", do NOT suggest "Fashion" (parent category)
      - If the category is "laptop", do NOT suggest "Desktop" (sibling category)
      
      Each item must be an object with "label", "value", and "icon" properties:
      - "label": A user-friendly name for the subcategory (capitalize appropriately) and be concise in 1-2 words. Example, say Projector instead of Projector Screens.
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

    return addRateLimitHeaders(
      new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      rateLimitResult.remaining
    );
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
