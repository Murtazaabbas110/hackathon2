import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeProjectFromClientMessage(clientMessage) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `You are an expert project analyst. Analyze the following client message and return JSON with this exact structure:
{
  "summary": "string",
  "objectives": ["string"],
  "targetUsers": ["string"],
  "requirements": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "priority": "MUST_HAVE" | "SHOULD_HAVE" | "COULD_HAVE",
      "confidence": "HIGH" | "MEDIUM",
      "sourceText": "string"
    }
  ],
  "ambiguities": ["string"],
  "risks": ["string"],
  "assumptions": ["string"],
  "dependencies": ["string"]
}

Rules:
- Only include requirements directly supported by the client message.
- For each requirement, set confidence to HIGH when explicitly stated, MEDIUM when it is a strong but implicit inference.
- For sourceText, copy the shortest relevant excerpt from the original client message.
- If something is not specified, leave the array empty rather than inventing.

Client message:
"""${clientMessage}"""`;

  async function callOnce() {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const cleaned = text
        .replace(/^```json/gim, "")
        .replace(/^```/gim, "")
        .replace(/```$/gim, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (e) {
      throw new Error("Failed to parse Gemini JSON response");
    }
  }

  // First attempt
  try {
    const parsed = await callOnce();
    return parsed;
  } catch (e) {
    // Retry once with a stricter instruction
    const strictPrompt = prompt + "\n\nYour previous response was invalid JSON. Respond with ONLY valid JSON, no markdown or explanation.";
    const result = await model.generateContent(strictPrompt);
    const text = result.response.text();
    const cleaned = text
      .replace(/^```json/gim, "")
      .replace(/^```/gim, "")
      .replace(/```$/gim, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  }
}
