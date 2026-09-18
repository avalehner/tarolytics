import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

const interpretReading = async (prompt: string): Promise<string> => {
  const startedAt = Date.now();

  try {
    console.log("querying gemini...");
    //generateContent generates a text response from the model
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `${prompt}`,
      config: {
        httpOptions: {
          timeout: 45_000, //in milliseconds
        },
      },
    });

    console.log(geminiResponse.text);

    if (!geminiResponse.text) throw new Error("Gemini returned empty response");

    console.log("Gemini completed", {
      elapsedMS: Date.now() - startedAt,
    });
    return geminiResponse.text;
  } catch (error) {
    //can throw anything in js so need to make sure that what was thrown was actually an error
    const message = error instanceof Error ? error.message : "Unknown error";

    const status =
      typeof error === "object" && error !== null && "status" in error
        ? error.status
        : undefined;
    console.error("Gemini failed", {
      status,
      elapsedMs: Date.now() - startedAt,
      message,
    });

    throw new GeminiError(message, status as number);
  }
};

export default interpretReading;
