import { GoogleGenAI, Type } from '@google/genai';

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

export async function askEveAssistant(question: string, siteContext: Record<string, unknown>): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Context: User is building a website on HelloEve. Business: ${siteContext.businessName || 'Unknown'}. Type: ${siteContext.type || 'Unknown'}.\nQuestion: ${question}`,
      config: {
        systemInstruction: `You are Eve, an AI expert assistant for HelloEve, a platform for Israeli SMBs to build professional websites in under 15 minutes.
Answer in Hebrew. Be professional, friendly, and helpful. You can guide users on domains, pixels, SEO, the wizard, design tokens, and all platform features.
Keep answers concise but thorough. Use simple Hebrew, avoiding overly technical jargon unless the user asks for details.`,
        temperature: 0.7,
      },
    });
    return response.text || 'מצטערת, לא הצלחתי לייצר תשובה. נסה שוב.';
  } catch (error) {
    console.error('Eve Assistant Error:', error);
    return 'מצטערת, חלה שגיאה בתקשורת. נסה שוב מאוחר יותר.';
  }
}

export async function generateVibeDesign(prompt: string, currentTokens: Record<string, string>): Promise<Record<string, string>> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `User wants to change design: "${prompt}". Current design tokens: ${JSON.stringify(currentTokens)}`,
      config: {
        systemInstruction: `You are a world-class UI designer specializing in modern web design. Return ONLY a JSON object with updated design tokens.
Available tokens: backgroundColor (hex), textColor (hex), primaryColor (hex), borderRadius (e.g. '0.5rem', '1rem', '2rem'), shadow (tailwind class e.g. 'shadow-lg', 'shadow-2xl'), spacing (rem string e.g. '2rem', '4rem').
Ensure high contrast between text and background for accessibility (WCAG AA minimum 4.5:1 ratio).
Do not change the structure. Only return the JSON object.`,
        responseMimeType: 'application/json',
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
          required: ['backgroundColor', 'textColor', 'primaryColor', 'borderRadius', 'shadow', 'spacing'],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Vibe Design Error:', error);
    return currentTokens;
  }
}

export async function generateSeoContent(pageContent: string, businessInfo: Record<string, string>): Promise<Record<string, string>> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Generate SEO metadata for this page.\nBusiness: ${businessInfo.name} (${businessInfo.field}), Location: ${businessInfo.location}\nPage content: ${pageContent}`,
      config: {
        systemInstruction: `Generate SEO metadata in Hebrew. Return JSON with: metaTitle (max 60 chars, include business name and city), metaDescription (max 160 chars, include CTA), slug (lowercase english, hyphens), focusKeyword, altTexts (array of strings for images).
Optimize for local Israeli search. Include city name when relevant.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            slug: { type: Type.STRING },
            focusKeyword: { type: Type.STRING },
            altTexts: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['metaTitle', 'metaDescription', 'slug', 'focusKeyword'],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('SEO AI Error:', error);
    return {};
  }
}
