/**
 * Provider layer for the founder AI tools.
 *
 *   AI_PROVIDER=groq (default) → Groq OpenAI-compatible API, GROQ_TOOLS_MODEL (default openai/gpt-oss-120b)
 *   AI_PROVIDER=anthropic      → Claude via @anthropic-ai/sdk, ANTHROPIC_MODEL (default claude-opus-5-5)
 *
 * Two operations:
 *   generateJSON({ system, prompt, schema, effort }) → parsed object matching `schema`
 *   chatComplete({ system, messages, effort })       → assistant reply text
 */
import Anthropic from "@anthropic-ai/sdk";

const httpError = (status, message) => Object.assign(new Error(message), { status });

export const getProviderInfo = () => {
  const wanted = String(process.env.AI_PROVIDER || "").trim().toLowerCase();
  if (wanted === "anthropic" || wanted === "claude") {
    return { provider: "anthropic", model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5" };
  }
  return { provider: "groq", model: process.env.GROQ_TOOLS_MODEL || "openai/gpt-oss-120b" };
};

/* ------------------------------------------------------------------ */
/* Anthropic (Claude)                                                  */
/* ------------------------------------------------------------------ */

let anthropicClient = null;
const getAnthropic = () => {
  if (!anthropicClient) anthropicClient = new Anthropic({ maxRetries: 2, timeout: 120_000 });
  return anthropicClient;
};

// Server-side refusal fallback (on by default; ANTHROPIC_FALLBACKS=off disables it).
const fallbackParams = () =>
  String(process.env.ANTHROPIC_FALLBACKS || "on").toLowerCase() === "off"
    ? {}
    : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };

const callClaude = async ({ model, system, messages, effort, schema }) => {
  let response;
  try {
    response = await getAnthropic().beta.messages.create({
      model,
      max_tokens: 16000,
      system,
      messages,
      output_config: {
        effort,
        ...(schema ? { format: { type: "json_schema", schema } } : {}),
      },
      ...fallbackParams(),
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw httpError(503, "AI provider is not configured correctly.");
    if (error instanceof Anthropic.RateLimitError) throw httpError(429, "The AI service is busy. Please try again in a minute.");
    if (error instanceof Anthropic.BadRequestError) throw httpError(400, "The AI request was rejected. Try shortening your input.");
    if (error instanceof Anthropic.APIError) throw httpError(502, "The AI service had a problem. Please try again.");
    throw error;
  }

  if (response.stop_reason === "refusal") {
    throw httpError(422, "The AI couldn't help with this request. Try rephrasing it.");
  }
  if (response.stop_reason === "max_tokens") {
    throw httpError(502, "The AI response was cut off. Try a shorter input.");
  }
  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
};

/* ------------------------------------------------------------------ */
/* Groq (OpenAI-compatible)                                            */
/* ------------------------------------------------------------------ */

const callGroq = async ({ model, system, messages, json }) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw httpError(503, "AI is not configured. Set GROQ_API_KEY or ANTHROPIC_API_KEY.");
  const url = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: json ? 0.4 : 0.6,
      max_tokens: 8000,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(120_000),
  }).catch(() => {
    throw httpError(502, "Could not reach the AI service. Please try again.");
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 429) throw httpError(429, "The AI service is busy. Please try again in a minute.");
  if (!res.ok) throw httpError(502, data?.error?.message ? `AI error: ${data.error.message}` : "The AI service had a problem.");
  return data?.choices?.[0]?.message?.content || "";
};

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

const parseJSON = (text) => {
  const trimmed = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw httpError(502, "The AI returned an unreadable response. Please try again.");
  }
};

export const generateJSON = async ({ system, prompt, schema, effort = "medium" }) => {
  const { provider, model } = getProviderInfo();
  let text;
  if (provider === "anthropic") {
    text = await callClaude({ model, system, messages: [{ role: "user", content: prompt }], effort, schema });
  } else {
    // Groq has no schema enforcement, so describe the exact shape in the prompt.
    const shaped = `${system}\n\nRespond with ONLY a JSON object that matches this JSON Schema exactly (all fields required):\n${JSON.stringify(schema)}`;
    text = await callGroq({ model, system: shaped, messages: [{ role: "user", content: prompt }], json: true });
  }
  return { data: parseJSON(text), provider, model };
};

export const chatComplete = async ({ system, messages, effort = "low" }) => {
  const { provider, model } = getProviderInfo();
  const text =
    provider === "anthropic"
      ? await callClaude({ model, system, messages, effort })
      : await callGroq({ model, system, messages, json: false });
  return { reply: text.trim(), provider, model };
};
