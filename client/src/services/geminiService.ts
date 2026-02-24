
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Moved AI instance creation inside functions to ensure fresh client with correct API key handling.

export const askEveAssistant = async (question: string, siteData: any) => {
  // Fixed: Use standard initialization as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: User is building a website on SiteLaunch (Eve). Business: ${siteData.businessName}. Type: ${siteData.type}. 
      Question: ${question}`,
      config: {
        systemInstruction: `You are Eve, an AI expert assistant for SiteLaunch, a platform for SMBs to build sites in 15 mins.
        Answer in Hebrew. Be professional, friendly, and helpful. Know that you can guide them on domains, pixels, SEO, and the wizard.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "מצטערת, חלה שגיאה בתקשורת איתי. נסי שוב מאוחר יותר.";
  }
};

export const runVibeDesign = async (prompt: string, currentTokens: any) => {
  // Fixed: Use standard initialization as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `User wants to change design: "${prompt}". Current design: ${JSON.stringify(currentTokens)}`,
      config: {
        systemInstruction: `You are a world-class UI designer. Return ONLY a JSON object representing new design tokens.
        Tokens: backgroundColor (hex), textColor (hex), primaryColor (hex), borderRadius (tailwind e.g. '0.5rem'), shadow (tailwind e.g. 'shadow-lg'), spacing (rem string).
        Do not change the structure. Do not add text.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            backgroundColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            borderRadius: { type: Type.STRING },
            shadow: { type: Type.STRING },
            spacing: { type: Type.STRING },
          },
          required: ["backgroundColor", "textColor", "primaryColor", "borderRadius", "shadow", "spacing"]
        }
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Vibe Design Error:", error);
    return currentTokens;
  }
};
