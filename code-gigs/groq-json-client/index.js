import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new Groq({ apiKey });
}

function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json/gim, "")
    .replace(/^```/gim, "")
    .replace(/```$/gim, "")
    .trim();
}

export async function analyzeProjectFromClientMessage(clientMessage) {
  const groq = getGroqClient();
  const model = getGroqModel();

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

  async function callOnce(activePrompt) {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Respond only with valid JSON. No markdown or explanation.",
        },
        {
          role: "user",
          content: activePrompt,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content || "";
    const cleaned = cleanJsonText(text);

    try {
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch {
      throw new Error("Failed to parse Groq JSON response");
    }
  }

  try {
    return await callOnce(prompt);
  } catch {
    const strictPrompt =
      prompt +
      "\n\nYour previous response was invalid JSON. Respond with ONLY valid JSON, no markdown or explanation.";
    return await callOnce(strictPrompt);
  }
}
