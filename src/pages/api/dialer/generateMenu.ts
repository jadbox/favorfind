import type { APIRoute } from "astro";
import { GoogleGenAI, Type } from "@google/genai";
import * as lucideIcons from "lucide-react";
import { getCachedData, setCachedData } from "../../../services/cache";
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

    const cacheKey = `dialer:${selections.join(":")}:${exclude.join(",")}`;
    const cachedMenu = getCachedData(cacheKey);

    if (cachedMenu) {
      return new Response(JSON.stringify(cachedMenu), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const availableIcons = Object.keys(lucideIcons);
    const prompt = `
      User has asked for specific sub-categories related to "${selections.join(
        ", "
      )}", generate a concise JSON array of up to 9 related sub-categories. All suggestions must be strictly a sub-category.
      Each item in the array should be an object with "label", "value", and "icon" properties.
      - "label" should be a user-friendly name for the sub-category.
      - "value" should be a URL-friendly slug for the sub-category.
      - "icon" should be the name of a relevant and *mostly unique* icon from the lucide-react library that *properly describes* the sub-category. Choose from this list: ${availableIcons.join(
        ", "
      )}.
      ${
        exclude.length > 0
          ? `Do not include any of the following items: ${exclude.join(", ")}.`
          : ""
      }
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
