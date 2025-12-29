import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMarketingInsight = async (customerData: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Cannot generate insight.";

  try {
    const prompt = `
      Analyze this hotel customer profile (RFM data) and suggest a personalized marketing strategy.
      Keep it concise (max 3 sentences).
      Customer Data: ${customerData}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insight due to an error.";
  }
};

export const chatWithHotelAssistant = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "System Offline (API Key Missing)";

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful, professional AI assistant for a luxury hotel management platform. You assist front desk staff and managers with operations, pricing strategy, and guest inquiries. Be concise and polite.",
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I didn't understand that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am currently experiencing connection issues.";
  }
};