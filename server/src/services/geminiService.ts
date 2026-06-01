import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const interpretReading = async (prompt: string): Promise<string> => {
  try {
    console.log("querying gemini...");
    //generateContent generates a text response from the model
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `${prompt}`,
    });

    console.log(geminiResponse.text);

    if (!geminiResponse.text) throw new Error("Gemini returned empty response");
    return geminiResponse.text;
  } catch (error) {
    //can throw anything in js so need to make sure that what was thrown was actually an error
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Gemini error: ${message}`);
  }
};

export default interpretReading;
