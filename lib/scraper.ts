
import * as cheerio from "cheerio";

export interface RawArticle {
  title: string;
  summary: string;
  url: string | null;
  sourceName: string;
  sourceId: string;
  sourceTier: number;
  publishedAt: string;
  timestamp: number;
}

export interface GroupedArticle {
  title: string;
  summary: string;
  url: string | null;
  sources: string[]; // Nombres de fuentes que cubren esta noticia
  sourceIds: string[]; // IDs de fuentes
  sourceTier: number;
  publishedAt: string;
  timestamp: number;
  crossSourceCount: number;
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function parseSpanishDate(dateStr: string): number {
  if (!dateStr) return 0;
  const clean = dateStr.replace(/\./g, "").trim();
  const months: Record<string, number> = {
    enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5,
    julio:6, agosto:7, septiembre:8, setiembre:8, octubre:9, noviembre:10, diciembre:11
  };
  
  if (clean.includes("Hace")) {
    const match = clean.match(/Hace\s+(\d+)\s+(hora|minuto|día)/i);
    if (match) {
      const val = parseInt(match[1]);
      if (match[2].includes("hora")) return Date.now() - val * 60 * 60 * 1000;
      if (match[2].includes("minuto")) return Date.now() - val * 60 * 1000;
      if (match[2].includes("día")) return Date.now() - val * 24 * 60 * 60 * 1000;
    }
    return Date.now();
  }
  
  const parts = clean.split(/\s+/);
  const day = parseInt(parts[0]);
  const monthStr = parts[2]?.toLowerCase();
  const year = parseInt(parts[4]) || new Date().getFullYear();
  const month = months[monthStr as keyof typeof months] ?? 0;
  
  if (!isNaN(day) && !isNaN(year) && month >= 0) {
    return new Date(year, month, day).getTime();
  }
  return 0;
}

function titleSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  let matches = 0;
  setA.forEach(w => { if (setB.has(w)) matches++; });
  return matches / Math.max(setA.size, setB.size, 1);
}

export async function scrapeSources(
  sources: { local: Array<{url:string;name:string;id:string;enabled:boolean;tier:number}>; regional: Array<{url:string;name:string;id:string;enabled:boolean;tier:number}>; national: Array<{url:string;name:string;id:string;enabled:boolean;tier:number}> }
): Promise<GroupedArticle[]> {
  const raw: RawArticle[] = [];
  const now = Date.now();
  const HOURS_48 = 48 * 60 * 60 * 1000;

  // Combinar todas las fuentes por tier
  const allSources = [
    ...sources.local.filter(s => s.enabled),
    ...sources.regional.filter(s => s.enabled),
    ...sources.national.filter(s => s.enabled),
  ];

  // Extraer artículos de cada fuente
  for (const src of allSources) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(6000),
        cache: "no-store"
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $("article, .post, .nota, .entry, [class*='article'], [class*='post']").each((_, el) => {
        const $el = $(el);
        const title = $el.find("h1, h2, h3, [class*='title'], [class*='titulo']").first().text().trim();
        const summary = $el.find("p, .summary, .excerpt, .content").first().text().trim();
        const link = $el.find("a[href]").first().attr("href");
        const dateStr = $el.find("time, [class*='date'], [class*='fecha'], .meta").first().text().trim();
        
        if (title.length > 15 && summary.length > 20) {
          let finalUrl = link;
          if (finalUrl && !finalUrl.startsWith("http")) {
            try { finalUrl = new URL(finalUrl, src.url).href; } catch { finalUrl = src.url; }
          }
          const ts = parseSpanishDate(dateStr);
          
          // Filtrar estrictamente últimas 48h
          if (ts > 0 && (now - ts) <= HOURS_48) {
            raw.push({
              title, 
              summary: summary.slice(0, 300), 
              url: finalUrl || src.url,
              sourceName: src.name,
              sourceId: src.id,
              sourceTier: src.tier,
              publishedAt: dateStr || new Date(ts).toLocaleDateString("es-AR"),
              timestamp: ts || now
            });
          }
        }
      });
    } catch (e) {
      console.warn(`[SCRAPER] Error en ${src.name} (${src.url}):`, e);
    }
  }

  // Agrupar noticias similares (cross-source)
  const grouped: GroupedArticle[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < raw.length; i++) {
    if (usedIndices.has(i)) continue;
    const main = raw[i];
    const similar = [main];
    const similarSources = [main.sourceName];
    const similarIds = [main.sourceId];

    for (let j = i + 1; j < raw.length; j++) {
      if (usedIndices.has(j)) continue;
      if (titleSimilarity(main.title, raw[j].title) > 0.65) {
        similar.push(raw[j]);
        similarSources.push(raw[j].sourceName);
        similarIds.push(raw[j].sourceId);
        usedIndices.add(j);
      }
    }
    usedIndices.add(i);

    const avgTs = Math.round(similar.reduce((sum, a) => sum + a.timestamp, 0) / similar.length);
    grouped.push({
      title: similar[0].title,
      summary: similar[0].summary,
      url: similar[0].url,
      sources: [...new Set(similarSources)],
      sourceIds: [...new Set(similarIds)],
      sourceTier: similar[0].sourceTier,
      publishedAt: similar[0].publishedAt,
      timestamp: avgTs,
      crossSourceCount: similarSources.length
    });
  }

  // Priorizar: crossSource > recencia > tier local
  return grouped.sort((a, b) => {
    if (b.crossSourceCount !== a.crossSourceCount) return b.crossSourceCount - a.crossSourceCount;
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return a.sourceTier - b.sourceTier;
  });
}