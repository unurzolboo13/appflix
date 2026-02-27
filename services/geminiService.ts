import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiRecommendations = async (query: string, availableMovies: Movie[]): Promise<string[]> => {
  try {
    const moviesContext = availableMovies.map(m => 
      `ID: ${m.id}, Title: ${m.title}, Description: ${m.description}, Genre: ${m.genre.join(', ')}`
    ).join('\n');

    const prompt = `
      You are an AI movie recommendation assistant for a streaming app.
      Here is the list of available movies in our database:
      ${moviesContext}

      The user is asking: "${query}"

      Based on the user's request, select the IDs of the movies that best match.
      Return strictly a JSON array of movie IDs (strings). 
      If no movies match perfectly, return the closest matches.
      Limit to 3 recommendations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const movieIds = JSON.parse(jsonText) as string[];
    return movieIds;
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return [];
  }
};