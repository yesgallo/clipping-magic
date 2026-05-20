// app/api/clip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenant, resolveTenantId } from "@/lib/tenants";
import { scrapeSources, type GroupedArticle } from "@/lib/scraper";
import { generateClipping } from "@/lib/llm";
import { getCached, setCached, bustCache } from "@/lib/cache";
import { ClippingResult, CATEGORIES, type Category } from "@/lib/types";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { searchParams, hostname } = new URL(req.url);
  const tenantId = resolveTenantId(hostname, searchParams);
  const tenant = getTenant(tenantId);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const mode = (searchParams.get("mode") as "auto" | "url") ?? "auto";
  const targetUrl = searchParams.get("url") ?? undefined;
  const forceRefresh = searchParams.get("refresh") === "1" || searchParams.get("cron") === "1";

  // Cache
  if (mode !== "url" && !forceRefresh) {
    const cached = await getCached(tenantId);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });
  }
  if (forceRefresh) await bustCache(tenantId);

  // 1. SCRAPING REAL desde fuentes del tenant
  let groupedArticles: GroupedArticle[] = [];
  if (mode === "url" && targetUrl) {
    groupedArticles = [{
      title: "Análisis de URL específica",
      summary: "Procesando contenido de la URL proporcionada...",
      url: targetUrl,
      sources: ["URL directa"],
      sourceIds: ["direct"],
      sourceTier: 1,
      publishedAt: new Date().toLocaleDateString("es-AR"),
      timestamp: Date.now(),
      crossSourceCount: 1
    }];
  } else {
    groupedArticles = await scrapeSources(tenant.sources);
  }

  if (groupedArticles.length === 0) {
    return NextResponse.json({ 
      error: `No se encontraron noticias recientes (24-48h) en las fuentes configuradas para ${tenant.municipality}.` 
    }, { status: 404 });
  }

  // 2. LLM FORMATEADOR (CERO INVENCIÓN)
  let result: any;
  try {
    result = await generateClipping(groupedArticles, tenant.municipality, tenant.province);
  } catch (err) {
    console.error("LLM failed:", err);
    return NextResponse.json({ error: "Error al procesar noticias. Reintentá en unos minutos." }, { status: 503 });
  }

  // 3. POST-PROCESAMIENTO: Normalizar + Ordenar
  const news = (result.news || []).map((n: any) => ({
    ...n,
    date: n.date || new Date().toLocaleDateString("es-AR"),
    category: (n.category === "Gestión municipal" ? "Gestión" : n.category) as Category,
    scope: n.scope || (n.sourceTier === 1 ? "local" : n.sourceTier === 2 ? "provincial" : "nacional") as "local" | "provincial" | "nacional",
    source: Array.isArray(n.sources) ? n.sources.join(", ") : (n.source || tenant.name)
  }));

  // Ordenamiento: Fecha DESC > Local primero > CrossSource
  news.sort((a: any, b: any) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    const scopeOrder: Record<string, number> = { local: 3, provincial: 2, nacional: 1 };
    if (scopeOrder[b.scope] !== scopeOrder[a.scope]) {
      return (scopeOrder[b.scope] || 0) - (scopeOrder[a.scope] || 0);
    }
    return (b.crossSourceCount || 0) - (a.crossSourceCount || 0);
  });

  // Tomar hasta 15 (o las que haya)
  const finalNews = news.slice(0, 15);

  const clippingResult: ClippingResult = {
    tenantId,
    generatedAt: new Date().toISOString(),
    mode,
    topics: result.topics || [],
    news: finalNews,
  };

  if (mode !== "url") await setCached(tenantId, clippingResult);
  return NextResponse.json(clippingResult);
}
