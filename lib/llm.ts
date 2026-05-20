
import { CATEGORIES, type Category } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

console.log(`[LLM] Modelo configurado: ${GROQ_MODEL}`);

export async function generateClipping(
  groupedArticles: Array<{
    title: string; summary: string; url: string | null;
    sources: string[]; sourceIds: string[]; sourceTier: number; publishedAt: string;
    crossSourceCount: number; timestamp: number;
  }>,
  municipality: string,
  province: string
): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada");

  const context = groupedArticles.map((a, i) => 
    `${i+1}. [${a.crossSourceCount > 1 ? `REPETIDA EN ${a.crossSourceCount} FUENTES: ${a.sources.join(", ")}` : a.sources[0]}] ${a.title} | Fecha: ${a.publishedAt} | Resumen: ${a.summary}`
  ).join("\n");

  const systemPrompt = `Sos un editor de noticias local de ${municipality}, ${province}.
TU TAREA: Formatear EXACTAMENTE las noticias reales proporcionadas en el contexto.
REGLAS ABSOLUTAS:
1. NO INVENTES, NO ESTIMES. Solo usá lo que está en el contexto.
2. Devolvé las noticias disponibles (máx 15). Si hay menos, devolvé todas.
3. Categorizá según: ${CATEGORIES.join(", ")}
4. Scope: "local" (tier 1), "provincial" (tier 2), "nacional" (tier 3)
5. Mantené el orden: primero las más repetidas y recientes.
6. Formato JSON estricto. Sin markdown. Sin texto extra.

ESQUEMA:
{
  "topics": ["string", "string", "string"],
  "news": [
    {
      "title": "string",
      "summary": "string",
      "source": "string (fuentes separadas por comas)",
      "date": "DD de mes de YYYY",
      "url": "string o null",
      "category": "una de: ${CATEGORIES.join(", ")}",
      "scope": "local|provincial|nacional",
      "crossSourceCount": number,
      "timestamp": number
    }
  ]
}`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Contexto real:\n${context}\n\nGenerá el JSON.` }
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("LLM devolvió JSON inválido");
  }
}
