// lib/llm.ts
import { TenantConfig } from "./tenants";
import { ClippingResult, CATEGORIES } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function buildSystemPrompt(tenant: TenantConfig, mode: string, queryTopic?: string): string {
  const categoryList = CATEGORIES.join(", ");

  return `Sos un editor de noticias local especializado en ${tenant.municipality}, ${tenant.province}, Argentina.
Tu tarea es generar un clipping de noticias en JSON estricto.

MODO: ${mode === "topic" ? `Temático — solo noticias de la sección/categoría: "${queryTopic}"` : "General — todas las noticias relevantes del día"}

CATEGORÍAS VÁLIDAS (exactas):
${categoryList}

INSTRUCCIONES OBLIGATORIAS:

1. TÓPICOS DEL DÍA (5 a 7):
   - Son los temas con mayor presencia editorial CRUZADA en todos los portales del contexto.
   - Pueden ser locales (de ${tenant.municipality}), provinciales (Buenos Aires) o nacionales (Argentina).
   - Regla: si un tema aparece en 2 o más fuentes → es tópico.
   - Formulá cada uno en 2-4 palabras concretas (ej: "Tarifas energía", "Seguridad rural", "Elecciones 2025").
   - NO limitarlos solo a noticias locales.

2. NOTICIAS (exactamente 20, o todas las disponibles si hay menos):
   - Para MODO TEMÁTICO: incluir SOLO noticias cuya sección/categoría coincida con "${queryTopic}". Si no hay suficientes, indicarlo en el campo title con "Sin resultados en esta sección".
   - Para cada noticia incluir url si está disponible en el contexto.
   - Título claro, resumen 1-2 párrafos, lenguaje neutral e institucional.
   - No inventar datos. Solo lo que esté en el contexto.

ESQUEMA JSON (responder SOLO esto, sin texto extra, sin backticks):
{
  "topics": [
    { "label": "string 2-4 palabras", "icon": "emoji", "scope": "local|provincial|nacional" }
  ],
  "news": [
    {
      "title": "string",
      "summary": "string párrafo 1\\n\\npárrafo 2 opcional",
      "source": "nombre del medio",
      "date": "DD de mes de YYYY",
      "url": "https://... o null",
      "category": "una de: ${categoryList}",
      "section": "sección del portal si se conoce"
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
  const userMessage = `Contenido scrapeado de los portales (${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}):\n\n${scrapedContent}\n\nGenerá el JSON del clipping ahora.`;

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

  let parsed: { topics?: unknown[]; news?: unknown[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (match) parsed = JSON.parse(match[1]);
    else throw new Error("LLM no devolvió JSON válido");
  }

  return {
    topics: (parsed.topics as ClippingResult["topics"]) ?? [],
    news: (parsed.news as ClippingResult["news"]) ?? [],
  };
}

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
        { role: "user", content: `Contenido:\n\n${scrapedContent}\n\nGenerá el JSON.` },
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
