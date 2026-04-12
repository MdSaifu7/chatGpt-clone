import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash", // ✅ FIXED
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  return response.candidates[0].content.parts[0].text;
}

export { generateResponse };
