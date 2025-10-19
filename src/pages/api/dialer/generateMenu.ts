import type { APIRoute } from "astro";
import { GoogleGenAI, Type } from "@google/genai";
import * as lucideIcons from "lucide-react";
import { getCachedData, setCachedData } from "../../../services/cache";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// A helper to get a Lucide icon by name, or a default
const getIcon = (name: string) => {
  const icon = lucideIcons[name as keyof typeof lucideIcons];
  return icon || lucideIcons.Search;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { selections } = body;

    if (!Array.isArray(selections) || selections.length !== 2) {
      return new Response(
        JSON.stringify({ error: "Invalid selections provided." }),
        { status: 400 }
      );
    }

    const [first, second] = selections;

    const cacheKey = `dialer:${first}:${second}`;
    const cachedMenu = getCachedData(cacheKey);

    if (cachedMenu) {
      return new Response(JSON.stringify(cachedMenu), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `
      Given the user's interest in "${first}" and "${second}", generate a concise JSON array of up to 9 related sub-categories.
      Each item in the array should be an object with "label", "value", and "icon" properties.
      - "label" should be a user-friendly name for the sub-category.
      - "value" should be a URL-friendly slug for the sub-category.
      - "icon" should be the name of a relevant icon from the lucide-react library.
      Do not include any preamble or explanation in your response.
    `;

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

    // We need to send back something the client can render. Since we can't
    // serialize the icon components themselves, we'll just send the names
    // and let the client handle it. The client-side code will need to be
    // updated to map these names to the actual components.
    const menuItems = parsed.map((item: any) => ({
      ...item,
      // The client will need to map this icon name to the actual icon component
    }));

    setCachedData(cacheKey, menuItems);

    return new Response(JSON.stringify(menuItems), {
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
