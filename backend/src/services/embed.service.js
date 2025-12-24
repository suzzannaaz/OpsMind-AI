import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: ENV.GOOGLE_API_KEY });

export const generateEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [text],
    });

    return response.embeddings?.[0]?.values || [];
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
};
