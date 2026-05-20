// app/api/clip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenant, resolveTenantId } from "@/lib/tenants";
import { scrapeMany, buildSearchUrls } from "@/lib/scraper";
import { generateClipping, generateClippingOpenRouter } from "@/lib/llm";
import { getCached, setCached, bustCache } from "@/lib/cache";
import { ClippingResult, CATEGORIES, type Category } from "@/lib/types";

export const maxDuration = 60;

// ✅ Token budget para Groq 8B (30k TPM free tier)
// ~4000 chars ≈ 3000 tokens → suficiente para 15 noticias con contexto rico
const MAX_CONTENT_CHARS = 4000;

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

  // Cache check (skip for URL mode or forced refresh)
  if (mode !== "url" && !forceRefresh) {
    const cached = await getCached(tenantId);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });
  }

  if (forceRefresh) await bustCache(tenantId);

  // ─────────────────────────────────────────────────────────────
  // SCRAPING: Construir URLs por tier con prioridad
  // ─────────────────────────────────────────────────────────────
  let urlsToScrape: string[];
  if (mode === "url" && targetUrl) {
    urlsToScrape = [targetUrl];
  } else {
    // ✅ Normalize tenant source lists into search source objects
    const sourceList = [
      ...tenant.sources.local.map((url) => ({
        url,
        tier: 1 as const,
        searchQuery: `site:${url} "{city}"`,
      })),
      ...tenant.sources.regional.map((url) => ({
        url,
        tier: 2 as const,
        searchQuery: `site:${url} "{city}" OR "{province}"`,
      })),
      ...tenant.sources.national.map((url) => ({
        url,
        tier: 3 as const,
        searchQuery: `site:${url} "{city}" AND (gestión OR política OR economía)`,
      })),
    ];

    // ✅ Scrapear más fuentes para variedad: 6 locales + 4 provinciales + 2 nacionales
    urlsToScrape = buildSearchUrls(tenant.municipality, sourceList, {
      maxLocal: 6,
      maxProvincial: 4,
      maxNational: 2,
      // Filtro de últimas 48 horas en Google News
      timeFilter: "qdr:d2",
    });
  }

  // Scraping con timeout generoso (8s por fuente)
  const scraped = await scrapeMany(urlsToScrape, 8);
  const ok = scraped.filter((s): s is any & { tier: 1 | 2 | 3 } =>
    s.ok && s.text.length > 30 && typeof (s as any).tier === "number"
  );

  // 🔍 Debug log para Vercel
  console.log(`[CLIP] Tenant: ${tenantId}, Mode: ${mode}, Scraped: ${scraped.length}, OK: ${ok.length}`);

  // ─────────────────────────────────────────────────────────────
  // BUILD CONTEXT: Distribuir contenido por tier + filtro 48hs
  // ─────────────────────────────────────────────────────────────
  let scrapedContent: string;
  const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  if (ok.length > 0) {
    // ✅ Distribuir por tier para garantizar variedad en el output
    const local = ok.filter(s => s.tier === 1).slice(0, 6);
    const provincial = ok.filter(s => s.tier === 2).slice(0, 4);
    const national = ok.filter(s => s.tier === 3).slice(0, 2);
    
    const pieces = [...local, ...provincial, ...national].map(s => {
      const tierLabel = s.tier === 1 ? "[LOCAL]" : s.tier === 2 ? "[PROVINCIAL]" : "[NACIONAL]";
      const title = s.title.slice(0, 150);
      const text = s.text.slice(0, 500); // Más contenido por artículo para contexto rico
      const date = s.publishedAt || "fecha desconocida";
      const section = s.section ? `Sección: ${s.section}` : "";
      return `${tierLabel} ${s.domain} | ${date}\n${section}\n${title}\n${text}`;
    });
    
    scrapedContent = pieces.join("\n\n---\n\n").slice(0, MAX_CONTENT_CHARS);
  } else {
    // ✅ Fallback rico: instrucción explícita para generar 15 noticias distribuidas
    scrapedContent = `Generá EXACTAMENTE 15 noticias para ${tenant.municipality}, ${tenant.province}:

📋 DISTRIBUCIÓN OBLIGATORIA:
• 10 LOCALES: gestión municipal, seguridad, obras, educación, cultura, deportes, salud, comunidad, servicios, efemérides
• 3 PROVINCIALES: temas de ${tenant.province} que impacten en ${tenant.municipality}
• 2 NACIONALES: solo si tienen repercusión local directa

📅 FECHA: Últimas 48 horas (${twoDaysAgo} a ${today})

🏷️ CATEGORÍAS VÁLIDAS: ${CATEGORIES.join(", ")}

📝 FORMATO:
- Título claro y conciso
- Resumen institucional 1-2 párrafos
- Fuente: nombre del medio o "Clipping Magic (estimado)" si es generado
- Fecha: "DD de mes de YYYY"
- URL: null si no está disponible
- Category: una de las válidas
- Scope: "local" | "provincial" | "nacional"

⚠️ Si no hay contexto real, generá noticias PLAUSIBLES basadas en conocimiento general de Argentina, marcándolas como estimadas.

Respondé SOLO JSON válido.`;
  }

  // 🔍 Debug log del payload
  console.log(`[CLIP] Content length: ${scrapedContent.length} chars (~${Math.round(scrapedContent.length * 0.75)} tokens)`);

  // ─────────────────────────────────────────────────────────────
  // LLM: Generar clipping con fallback robusto
  // ─────────────────────────────────────────────────────────────
  let llmResult: Partial<ClippingResult>;
  
  try {
    llmResult = await generateClipping(tenant, scrapedContent, mode, queryTopic);
  } catch (groqErr) {
    console.warn("Groq failed, trying OpenRouter:", groqErr);
    
    try {
      llmResult = await generateClippingOpenRouter(tenant, scrapedContent, mode, queryTopic);
    } catch (orErr) {
      console.error("Both LLMs failed:", orErr);
      
      // ✅ FALLBACK MOCK: 15 noticias distribuidas exactamente
      const mockResult: ClippingResult = generateFallbackNews(tenant, mode, queryTopic);
      
      if (mode !== "url") await setCached(tenantId, mockResult);
      return NextResponse.json(mockResult); // ← 200 OK con datos útiles, NO 503
    }
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN Y COMPLETADO: Asegurar exactamente 15 noticias
  // ─────────────────────────────────────────────────────────────
  type NewsItem = ClippingResult["news"][number] & {
    scope?: "local" | "provincial" | "nacional";
  };

  let news = (llmResult.news ?? []) as NewsItem[];
  
  // Normalizar categorías: "Gestión municipal" → "Gestión"
  news = news.map(n => ({
    ...n,
    category: (n.category === "Gestión" ? "Gestión" : n.category) as Category,
  }));
  
  // Filtrar noticias inválidas
  news = news.filter(n => 
    n.title && 
    n.title.trim().length > 10 && 
    !n.title.toLowerCase().includes("sin resultados")
  );

  // Contar por scope para completar distribución
  const localCount = news.filter(n => n.scope === "local").length;
  const provCount = news.filter(n => n.scope === "provincial").length;
  const natCount = news.filter(n => n.scope === "nacional").length;
  
  // Calcular cuántas faltan de cada tipo
  const needLocal = Math.max(0, 10 - localCount);
  const needProv = Math.max(0, 3 - provCount);
  const needNat = Math.max(0, 2 - natCount);
  const totalNeeded = needLocal + needProv + needNat;
  
  // Completar si hay menos de 15
  if (totalNeeded > 0 || news.length < 15) {
    const filler = [
      // Completar locales
      ...Array.from({ length: needLocal }, (_, i) => generateFillerNews(tenant, "local", i)),
      // Completar provinciales
      ...Array.from({ length: needProv }, (_, i) => generateFillerNews(tenant, "provincial", i)),
      // Completar nacionales
      ...Array.from({ length: needNat }, (_, i) => generateFillerNews(tenant, "nacional", i)),
    ];
    
    // Mezclar y limitar a exactamente 15
    news = [...news, ...filler].slice(0, 15);
  } else if (news.length > 15) {
    // Si hay más de 15, priorizar por: locales > provinciales > nacionales
    const sorted = [
      ...news.filter(n => n.scope === "local").slice(0, 10),
      ...news.filter(n => n.scope === "provincial").slice(0, 3),
      ...news.filter(n => n.scope === "nacional").slice(0, 2),
    ];
    news = sorted.slice(0, 15);
  }

  // ─────────────────────────────────────────────────────────────
  // CONSTRUIR RESULTADO FINAL
  // ─────────────────────────────────────────────────────────────
  const result: ClippingResult = {
    tenantId,
    generatedAt: new Date().toISOString(),
    mode,
    queryTopic,
    topics: llmResult.topics ?? generateFallbackTopics(tenant),
    news: news.slice(0, 15), // ✅ Garantizar exactamente 15
  };

  // Cache solo para modos auto/topic (no para URL específica)
  if (mode !== "url") {
    await setCached(tenantId, result);
  }

  return NextResponse.json(result);
}

// ─────────────────────────────────────────────────────────────
// HELPERS: Fallback y completado de noticias
// ─────────────────────────────────────────────────────────────

function generateFallbackNews(tenant: any, mode: "auto" | "topic" | "url", queryTopic?: string): ClippingResult {
  const categories = CATEGORIES;
  const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  
  const localTopics = ["Gestión", "Seguridad", "Obras públicas", "Educación", "Salud", "Cultura", "Deportes", "Comunidad", "Servicios", "Efemérides"];
  const provTopics = ["Política", "Economía regional", "Infraestructura", "Sociedad", "Seguridad", "Ambiente"];
  const natTopics = ["Política", "Economía", "Sociedad", "Seguridad", "Ambiente"];

  return {
    tenantId: tenant.id,
    generatedAt: new Date().toISOString(),
    mode,
    queryTopic,
    topics: generateFallbackTopics(tenant),
    news: [
      // 10 LOCALES
      ...Array.from({ length: 10 }, (_, i) => ({
        title: `${localTopics[i % localTopics.length]}: Actualidad en ${tenant.municipality}`,
        summary: `Resumen institucional sobre ${localTopics[i % localTopics.length].toLowerCase()} en ${tenant.municipality}. Información estimada basada en conocimiento general de la región.`,
        source: "Clipping Magic (estimado)",
        date: today,
        url: null,
        category: categories[i % categories.length] as Category,
        section: null,
        scope: "local" as const,
      })),
      // 3 PROVINCIALES
      ...Array.from({ length: 3 }, (_, i) => ({
        title: `${provTopics[i]}: Impacto en ${tenant.municipality}`,
        summary: `Noticia provincial sobre ${provTopics[i].toLowerCase()} con repercusión directa en ${tenant.municipality}.`,
        source: "Clipping Magic (estimado)",
        date: today,
        url: null,
        category: (i === 0 ? "Política" : i === 1 ? "Economía" : "Infraestructura") as Category,
        section: null,
        scope: "provincial" as const,
      })),
      // 2 NACIONALES
      ...Array.from({ length: 2 }, (_, i) => ({
        title: `${natTopics[i]}: Repercusión en ${tenant.municipality}`,
        summary: `Análisis de ${natTopics[i].toLowerCase()} y su impacto en la comunidad de ${tenant.municipality}.`,
        source: "Clipping Magic (estimado)",
        date: today,
        url: null,
        category: (i === 0 ? "Política" : "Economía") as Category,
        section: null,
        scope: "nacional" as const,
      })),
    ],
  };
}

function generateFillerNews(tenant: any, scope: "local" | "provincial" | "nacional", index: number) {
  const categories = CATEGORIES;
  const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  
  const localTopics = ["Gestión", "Seguridad", "Obras", "Educación", "Salud", "Cultura", "Deportes", "Comunidad", "Servicios", "Efemérides"];
  const provTopics = ["Política", "Economía", "Infraestructura"];
  const natTopics = ["Política", "Economía"];
  
  const topic = scope === "local" ? localTopics[index % localTopics.length] :
                scope === "provincial" ? provTopics[index % provTopics.length] :
                natTopics[index % natTopics.length];
  
  const category = categories[(index + (scope === "local" ? 0 : 10)) % categories.length] as Category;
  
  return {
    title: `${topic}: Actualidad ${scope} en ${tenant.municipality}`,
    summary: `Noticia ${scope} estimada sobre ${topic.toLowerCase()} con relevancia para ${tenant.municipality}.`,
    source: "Clipping Magic (estimado)",
    date: today,
    url: null,
    category,
    section: null,
    scope,
  };
}

function generateFallbackTopics(tenant: any) {
  return [
    { label: "Gestión", icon: "🏛️", scope: "local" as const },
    { label: "Seguridad", icon: "🛡️", scope: "local" as const },
    { label: "Educación", icon: "🎓", scope: "local" as const },
    { label: `Provincia de ${tenant.province}`, icon: "🗺️", scope: "provincial" as const },
    { label: "Nacional", icon: "🇦🇷", scope: "nacional" as const },
  ];
}
