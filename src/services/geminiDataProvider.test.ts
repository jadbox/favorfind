import { GroundedGeminiDataProvider } from "./groundedGeminiDataProvider";
import { UngroundedGeminiDataProvider } from "./ungroundedGeminiDataProvider";
import { GoogleGenAI } from "@google/genai";
import type { SearchResult } from "../types";

// Mock the GoogleGenAI module
const mockGenerateContent = jest.fn(); // Declare and initialize mock function here

jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent, // Assign the mock function
        },
      };
    }),
    Type: {
      ARRAY: "ARRAY",
      OBJECT: "OBJECT",
      STRING: "STRING",
      INTEGER: "INTEGER",
    },
  };
});

describe("GroundedGeminiDataProvider", () => {
  let provider: GroundedGeminiDataProvider;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-api-key";
    provider = new GroundedGeminiDataProvider();
    mockGenerateContent.mockClear();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("should fetch results with grounding enabled and parse JSON from text block", async () => {
    const expectedPrompt = `Provide a concise JSON array of up to 1 most helpful article titles for "grounded search". Each item should have a "title" (article title), a "description" (brief explanation of why it's helpful), and a "url" (link to the article). No preamble.`;
    const mockResponseItem = {
      title: "Grounded Article",
      description: "A description from a grounded search.",
      url: "https://grounded.example.com/article",
    };

    mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ text: JSON.stringify([mockResponseItem]) }] } }],
    });

    const results = await provider.fetchPapers("grounded search", 1, "article");

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: "gemini-flash-latest",
      contents: expectedPrompt,
      tools: [{ googleSearch: {} }],
      responseMimeType: "text/plain",
    });
    expect(results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        title: "Grounded Article",
        source: "Gemini",
        publisher: "Google Gemini",
        publicationDate: String(new Date().getFullYear()),
        abstract: "A description from a grounded search.",
        citationCount: 0,
        url: "https://grounded.example.com/article",
        category: "article",
      }),
    ]));
  });
});

describe("UngroundedGeminiDataProvider", () => {
  let provider: UngroundedGeminiDataProvider;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-api-key";
    provider = new UngroundedGeminiDataProvider();
    mockGenerateContent.mockClear();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("should fetch product recommendations without grounding", async () => {
    const expectedPrompt = `Provide a concise JSON array of up to 1 top recommended products to buy for "gaming laptop". Each item should have a "title" (product name), a "description" (brief explanation of why it's recommended), and a "url" (Google Shopping link for the product). No preamble.`;
    const mockResponseItem = {
      title: "Gaming Laptop",
      description: "Powerful laptop for gaming.",
      url: `https://www.google.com/search?udm=28&q=${encodeURIComponent("Gaming Laptop")}&sjc=1`,
    };

    mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ text: JSON.stringify([mockResponseItem]) }] } }],
    });

    const results = await provider.fetchPapers("gaming laptop", 1, "product");

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: "gemini-flash-latest",
      contents: expectedPrompt,
      responseMimeType: "application/json",
      responseSchema: expect.any(Object),
    });
    expect(results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        title: "Gaming Laptop",
        source: "Gemini",
        publisher: "Google Gemini",
        publicationDate: String(new Date().getFullYear()),
        abstract: "Powerful laptop for gaming.",
        citationCount: 0,
        url: `https://www.google.com/search?udm=28&q=${encodeURIComponent("Gaming Laptop")}&sjc=1`,
        category: "product",
      }),
    ]));
  });

  it("should fetch article titles without grounding", async () => {
    const expectedPrompt = `Provide a concise JSON array of up to 1 most helpful article titles for "AI research". Each item should have a "title" (article title), a "description" (brief explanation of why it's helpful), and a "url" (link to the article). No preamble.`;
    const mockResponseItem = {
      title: "Latest in AI Research",
      description: "An article discussing recent advancements in AI.",
      url: "https://example.com/ai-research",
    };

    mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ text: JSON.stringify([mockResponseItem]) }] } }],
    });

    const results = await provider.fetchPapers("AI research", 1, "article");

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: "gemini-flash-latest",
      contents: expectedPrompt,
      responseMimeType: "application/json",
      responseSchema: expect.any(Object),
    });
    expect(results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        title: "Latest in AI Research",
        source: "Gemini",
        publisher: "Google Gemini",
        publicationDate: String(new Date().getFullYear()),
        abstract: "An article discussing recent advancements in AI.",
        citationCount: 0,
        url: "https://example.com/ai-research",
        category: "article",
      }),
    ]));
  });

  it("should return empty array if Gemini response is not valid JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ text: "This is not a JSON response." }] } }],
    });

    const results = await provider.fetchPapers("invalid json", 1, "article");
    expect(results).toEqual([]);
  });

  it("should handle API errors gracefully", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("API rate limit exceeded"));

    await expect(provider.fetchPapers("error query", 1, "article")).rejects.toThrow(
      "Failed to fetch results from Gemini: API rate limit exceeded"
    );
  });
});
