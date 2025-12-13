import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.js"; // Make sure GOOGLE_API_KEY is in ENV

// Initialize client with your Gemini API key
const ai = new GoogleGenAI({ apiKey: ENV.GOOGLE_API_KEY });

export const generateEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001", // Gemini embedding model
      contents: [text],               // Must be an array
    });

    // Return the first embedding vector
    return response.embeddings?.[0]?.values || [];
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
};
