// lib/llm.ts
// Groq integration — llama-3.3-70b-versatile is free tier, fast, and multilingual.
// Fallback: OpenRouter (also free tier with some models).

import { TenantConfig } from "./tenants";
import { ClippingResult, CATEGORIES } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function buildSystemPrompt(tenant: TenantConfig, mode: string, queryTopic?: string): string {
  const sourceList = [
    ...tenant.sources.local,
    ...tenant.sources.regional,
    ...tenant.sources.national,
  ].join(", ");

  const categoryList = CATEGORIES.join(", ");

  return `Sos un editor de noticias local especializado en ${tenant.municipality}, ${tenant.province}, Argentina.
Tu tarea es generar un clipping de noticias estructurado en formato JSON estricto.

MODO ACTUAL: ${mode === "topic" ? `Temático — foco en: "${queryTopic}"` : "General — todas las noticias relevantes"}

FUENTES A CUBRIR (en orden de prioridad):
${sourceList}

CATEGORÍAS VÁLIDAS (usar exactamente estas):
${categoryList}

INSTRUCCIONES:
1. Identificar 5-7 TÓPICOS DEL DÍA: temas con mayor presencia editorial cruzada en los portales (locales, provinciales y nacionales). Pueden ser locales, provinciales o nacionales con impacto local. Formular en 2-4 palabras concretas.
2. Extraer entre 10 y 20 NOTICIAS relevantes para ${tenant.municipality} y su región.
3. Para cada noticia: título claro, resumen de 1-2 párrafos en lenguaje neutral e institucional, fuente, fecha y categoría.
4. NO inventar datos. Si algo no está en el contexto provisto, no incluirlo.
5. Lenguaje neutral, voz activa, oraciones cortas. Sin sensacionalismo.

RESPONDER ÚNICAMENTE con JSON válido. Sin texto antes ni después. Sin backticks. Sin comentarios.

ESQUEMA JSON EXACTO:
{
  "topics": [
    { "label": "string (2-4 palabras)", "icon": "emoji" }
  ],
  "news": [
    {
      "title": "string",
      "summary": "string (1-2 párrafos separados por \\n\\n)",
      "source": "string (nombre del medio)",
      "date": "string (ej: 19 de mayo de 2026)",
      "url": "string o null",
      "category": "una de: ${categoryList}"
    }
  ]
}`;
}

export async function generateClipping(
  tenant: TenantConfig,
  scrapedContent: string,
  mode: "auto" | "topic" | "url",
  queryTopic?: string
): Promise<Partial<ClippingResult>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada");

  const systemPrompt = buildSystemPrompt(tenant, mode, queryTopic);

  const userMessage = `Aquí está el contenido scrapeado de los portales de noticias para ${tenant.municipality}:

${scrapedContent}

Fecha actual: ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}

Generá el clipping completo siguiendo las instrucciones del sistema. Respondé SOLO con JSON.`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  // Strict JSON parse with fallback
  let parsed: { topics?: unknown[]; news?: unknown[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Try to extract JSON from markdown fences
    const match = raw.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (match) {
      parsed = JSON.parse(match[1]);
    } else {
      throw new Error("LLM no devolvió JSON válido");
    }
  }

  return {
    topics: (parsed.topics as ClippingResult["topics"]) ?? [],
    news: (parsed.news as ClippingResult["news"]) ?? [],
  };
}

// OpenRouter fallback (free models: mistralai/mistral-7b-instruct, etc.)
export async function generateClippingOpenRouter(
  tenant: TenantConfig,
  scrapedContent: string,
  mode: "auto" | "topic" | "url",
  queryTopic?: string
): Promise<Partial<ClippingResult>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurada");

  const systemPrompt = buildSystemPrompt(tenant, mode, queryTopic);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://clipping.ar",
      "X-Title": "Clipping Magic",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Contenido de portales:\n\n${scrapedContent}\n\nGenerá el clipping en JSON.` },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const clean = raw.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}
