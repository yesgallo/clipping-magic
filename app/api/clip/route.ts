// app/api/clip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenant, resolveTenantId } from "@/lib/tenants";
import { scrapeMany, buildSearchUrls } from "@/lib/scraper";
import { generateClipping, generateClippingOpenRouter } from "@/lib/llm";
import { getCached, setCached, bustCache } from "@/lib/cache";
import { ClippingResult } from "@/lib/types";

export const maxDuration = 60;

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
  const forceRefresh = searchParams.get("refresh") === "1" || searchParams.get("cron") === "1";

  // Check cache (skip for url mode and forced refresh)
  if (mode !== "url" && !forceRefresh) {
    const cached = await getCached(tenantId);
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }
  }

  // If cache busted, delete it
  if (forceRefresh) await bustCache(tenantId);

  // --- Scrape phase ---
  let urlsToScrape: string[];

  if (mode === "url" && targetUrl) {
    urlsToScrape = [targetUrl];
  } else {
    urlsToScrape = buildSearchUrls(
      tenant.municipality,
      tenant.sources,
      tenant.searchTerms
    );
  }

  const scraped = await scrapeMany(urlsToScrape, 4);
  const successfulScrapes = scraped.filter((s) => s.ok);

  // Build context string for LLM
  let scrapedContent: string;
  if (successfulScrapes.length > 0) {
    scrapedContent = successfulScrapes
      .map((s) => `=== ${s.domain} ===\nTítulo: ${s.title}\n${s.text}`)
      .join("\n\n---\n\n")
      .slice(0, 28000); // stay within token limits
  } else {
    // Scraping failed entirely — give LLM a hint to use its knowledge
    scrapedContent = `No se pudo acceder a los portales. Usar conocimiento general sobre ${tenant.municipality}, ${tenant.province} y Argentina para la fecha actual.`;
  }

  // --- LLM phase ---
  let llmResult: Partial<ClippingResult>;
  try {
    llmResult = await generateClipping(tenant, scrapedContent, mode, queryTopic);
  } catch (groqErr) {
    console.warn("Groq failed, trying OpenRouter:", groqErr);
    try {
      llmResult = await generateClippingOpenRouter(tenant, scrapedContent, mode, queryTopic);
    } catch (orErr) {
      console.error("Both LLMs failed:", orErr);
      return NextResponse.json(
        { error: "No se pudo generar el clipping. Intentá de nuevo en unos minutos." },
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

  // Cache only auto and topic modes
  if (mode !== "url") {
    await setCached(tenantId, result);
  }

  return NextResponse.json(result);
}
