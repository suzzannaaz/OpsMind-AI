import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const testApiKey = async () => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: ["Test key"],
    });
    console.log("API key valid! Embedding output:", response);
  } catch (err) {
    console.error("API key invalid or request failed:", err);
  }
};

testApiKey();
