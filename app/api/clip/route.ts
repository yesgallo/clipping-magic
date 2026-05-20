
import { NextRequest, NextResponse } from "next/server";
import { getTenant, resolveTenantId } from "@/lib/tenants";
import { scrapeMany, buildSearchUrls } from "@/lib/scraper";
import { generateClipping, generateClippingOpenRouter } from "@/lib/llm";
import { getCached, setCached, bustCache } from "@/lib/cache";
import { ClippingResult } from "@/lib/types";

export const maxDuration = 60;

// ← Token budget: Groq free tier = 12k TPM. System prompt ≈ 800 tokens.
// Leave 10k for user content → ~1000 chars (1 char ≈ 0.75 tokens avg Spanish)
const MAX_CONTENT_CHARS = 1000;

export async function GET(req: NextRequest) {
  const { searchParams, hostname } = new URL(req.url);

  const tenantId = resolveTenantId(hostname, searchParams);
  const tenant = getTenant(tenantId);
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const mode = (searchParams.get("mode") as "auto" | "topic" | "url") ?? "auto";
  const queryTopic = searchParams.get("topic") ?? undefined;
  const targetUrl = searchParams.get("url") ?? undefined;
  const forceRefresh =
    searchParams.get("refresh") === "1" || searchParams.get("cron") === "1";

  // Cache check
  if (mode !== "url" && !forceRefresh) {
    const cached = await getCached(tenantId);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });
  }

  if (forceRefresh) await bustCache(tenantId);

  // --- Scrape ---
  let urlsToScrape: string[];
  if (mode === "url" && targetUrl) {
    urlsToScrape = [targetUrl];
  } else {
    urlsToScrape = buildSearchUrls(tenant.municipality, tenant.sources);
  }

  const scraped = await scrapeMany(urlsToScrape, 3);
  const ok = scraped.filter((s) => s.ok && s.text.length > 80);

  // Build context with strict char budget
  let scrapedContent: string;
  if (ok.length > 0) {
    const pieces = ok.map(
      (s) => `=== ${s.domain} ===\n${s.title}\n${s.text}`
    );
    // Trim to token budget
    scrapedContent = pieces.join("\n\n---\n\n").slice(0, MAX_CONTENT_CHARS);
  } else {
    scrapedContent = `No se pudo acceder a los portales. Generá noticias ficticias plausibles sobre ${tenant.municipality}, ${tenant.province} para hoy ${new Date().toLocaleDateString("es-AR")} usando conocimiento general de Argentina.`;
  }

  // --- LLM ---
  let llmResult: Partial<ClippingResult>;
  try {
    llmResult = await generateClipping(tenant, scrapedContent, mode, queryTopic);
  } catch (groqErr) {
    console.warn("Groq failed, trying OpenRouter:", groqErr);
    try {
      llmResult = await generateClippingOpenRouter(
        tenant,
        scrapedContent,
        mode,
        queryTopic
      );
    } catch (orErr) {
      console.error("Both LLMs failed:", orErr);
      return NextResponse.json(
        {
          error:
            "No se pudo generar el clipping. Revisá las API keys en .env.local",
        },
        { status: 503 }
      );
    }
  }

  const result: ClippingResult = {
    tenantId,
    generatedAt: new Date().toISOString(),
    mode,
    queryTopic,
    topics: llmResult.topics ?? [],
    news: llmResult.news ?? [],
  };

  if (mode !== "url") await setCached(tenantId, result);

  return NextResponse.json(result);
}
