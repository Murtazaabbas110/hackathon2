import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

function getGeminiModel(genAI) {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  });
}

function cleanJsonText(text) {
  return text
    .replace(/^```json/gim, "")
    .replace(/^```/gim, "")
    .replace(/```$/gim, "")
    .trim();
}

function validateWorkItem(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.title !== "string" || !item.title.trim()) return false;
  if (typeof item.epic !== "string" || !item.epic.trim()) return false;
  if (typeof item.description !== "string" || !item.description.trim())
    return false;
  if (!["HIGH", "MEDIUM", "LOW"].includes(item.priority)) return false;
  if (!Array.isArray(item.acceptanceCriteria)) return false;
  if (!Array.isArray(item.dependencies)) return false;
  return true;
}

function normalizeWorkItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  const epic = String(raw.epic || "General").trim();
  const title = String(raw.title || raw.name || epic).trim();
  const description = String(raw.description || "").trim();
  const priorityRaw = String(raw.priority || "MEDIUM").toUpperCase();
  const priority = ["HIGH", "MEDIUM", "LOW"].includes(priorityRaw)
    ? priorityRaw
    : "MEDIUM";
  const acceptanceCriteria = Array.isArray(raw.acceptanceCriteria)
    ? raw.acceptanceCriteria.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const dependencies = Array.isArray(raw.dependencies)
    ? raw.dependencies.map((d) => String(d).trim()).filter(Boolean)
    : [];

  const item = {
    epic,
    title,
    description,
    priority,
    acceptanceCriteria,
    dependencies,
  };
  return validateWorkItem(item) ? item : null;
}

export async function generateWorkItemsFromAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") {
    throw new Error("Valid analysis object is required");
  }

  const genAI = getGeminiClient();
  const model = getGeminiModel(genAI);

  const basePrompt = `You are an expert software project planner.
Based ONLY on the provided project analysis JSON, generate between 8 and 20 concrete implementation work items.

Return ONLY valid JSON with this exact shape (no markdown, no comments, no extra properties):
[
  {
    "epic": "string", // short epic or theme this task belongs to
    "title": "string", // concise, actionable work item title
    "description": "string", // 1–3 sentences describing the work in practical terms
    "priority": "HIGH" | "MEDIUM" | "LOW", // delivery priority
    "acceptanceCriteria": ["string"], // bullet-style criteria a developer can use to know this is done
    "dependencies": ["string"] // other work items or external dependencies that must be in place
  }
]

Guidelines:
- Use the objectives, requirements, risks, and dependencies from the analysis.
- Do not invent technologies, vendors, payment gateways, or deadlines not supported by the analysis.
- Make each work item independently understandable.
- Prefer smaller, implementation-focused items over huge epics.
- If information is missing, omit related work items instead of guessing.
- If you cannot reasonably create 8 work items, return as many as are justified.

Project analysis JSON:
"""${JSON.stringify(analysis)}"""`;

  async function callOnce(prompt) {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = cleanJsonText(text);
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error("Failed to parse Gemini work item JSON");
    }
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini work item response must be a JSON array");
    }
    const normalized = parsed.map(normalizeWorkItem).filter(Boolean);
    if (!normalized.length) {
      throw new Error("Gemini returned no valid work items");
    }
    return normalized;
  }

  try {
    return await callOnce(basePrompt);
  } catch (e) {
    const strictPrompt =
      basePrompt +
      "\n\nYour previous response was invalid. Respond again with ONLY a JSON array of work item objects, no markdown, no explanation.";
    return await callOnce(strictPrompt);
  }
}
