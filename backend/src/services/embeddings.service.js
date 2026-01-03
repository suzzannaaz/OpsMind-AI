import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: ENV.GOOGLE_API_KEY });

export const getEmbedding = async (text) => {
  const resp = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [text]
  });
  return resp.embeddings?.[0]?.values || [];
};
