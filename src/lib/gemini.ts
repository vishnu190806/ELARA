import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Gemini generation will fail.");
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const MODEL = 'gemini-2.5-flash';
