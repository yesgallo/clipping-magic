
const USER_AGENT =
  "Mozilla/5.0 (compatible; ClippingMagicBot/1.0; +https://clipping.ar/bot)";
const TIMEOUT_MS = 7000;
const MAX_CHARS_PER_SOURCE = 1800;

export interface ScrapeResult {
  url: string;
  domain: string;
  title: string;
  text: string;
  section?: string; // ← sección/categoría detectada del portal
  ok: boolean;
  error?: string;
}

// Detecta la sección de la URL: /noticias/seguridad/ → "seguridad"
function extractSection(url: string): string | undefined {
  try {
    const path = new URL(url).pathname;
    const parts = path.split("/").filter(Boolean);
    // Busca segmentos que parezcan categorías (no IDs ni slugs con números)
    const sectionWords = parts.find(
      (p) => p.length > 3 && !/\d{4,}/.test(p) && p !== "noticias" && p !== "nota"
    );
    return sectionWords;
  } catch {
    return undefined;
  }
}

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_CHARS_PER_SOURCE);
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim().slice(0, 120) : "";
}

// Extrae links de artículos del HTML del portal (hrefs con texto)
function extractArticleLinks(html: string, baseUrl: string): Array<{ url: string; title: string; section?: string }> {
  const base = new URL(baseUrl);
  const links: Array<{ url: string; title: string; section?: string }> = [];
  const seen = new Set<string>();

  // Busca <a href="...">texto</a> con texto de más de 20 chars (titulares)
  const linkRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null && links.length < 30) {
    const href = m[1].trim();
    const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

    if (text.length < 25 || text.length > 200) continue;
    if (/javascript:|mailto:|#/.test(href)) continue;

    let fullUrl: string;
    try {
      fullUrl = href.startsWith("http") ? href : new URL(href, base).href;
    } catch { continue; }

    // Solo links del mismo dominio
    if (!fullUrl.includes(base.hostname)) continue;
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    links.push({ url: fullUrl, title: text, section: extractSection(fullUrl) });
  }
  return links;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult & { links?: Array<{ url: string; title: string; section?: string }> }> {
  const domain = new URL(url).hostname.replace("www.", "");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-AR,es;q=0.9",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No body reader");

    let html = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    while (bytes < 200_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      bytes += value.byteLength;
    }
    reader.cancel();

    const links = extractArticleLinks(html, url);

    return {
      url,
      domain,
      title: extractTitle(html),
      text: extractText(html),
      section: extractSection(url),
      links,
      ok: true,
    };
  } catch (e: unknown) {
    return {
      url, domain, title: "", text: "", ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export interface SearchUrlOptions {
  maxLocal?: number;
  maxProvincial?: number;
  maxNational?: number;
  timeFilter?: string; // Ej: "qdr:d2" para últimas 48hs
}

export function buildSearchUrls(
  municipality: string,
  sources: Array<{ url: string; searchQuery?: string; tier?: number; enabled?: boolean }>,
  options: SearchUrlOptions = {}
): string[] {
  const {
    maxLocal = 6,
    maxProvincial = 4,
    maxNational = 2,
    timeFilter = "qdr:d2",
  } = options;

  const urls: string[] = [];
  const province = "Buenos Aires"; // ← Personalizar según tenant si es necesario

  // Helper para construir query de Google News
  const buildGoogleNewsUrl = (query: string) => 
    `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws&tbs=${timeFilter}`;

  // Tier 1: Locales
  const local = sources.filter(s => s.tier === 1 && s.enabled !== false).slice(0, maxLocal);
  for (const src of local) {
    const q = (src.searchQuery || `"${municipality}"`)
      .replace("{city}", municipality)
      .replace("{province}", province);
    urls.push(buildGoogleNewsUrl(q));
  }

  // Tier 2: Provinciales
  const provincial = sources.filter(s => s.tier === 2 && s.enabled !== false).slice(0, maxProvincial);
  for (const src of provincial) {
    const q = (src.searchQuery || `"${municipality}" OR "${province}"`)
      .replace("{city}", municipality)
      .replace("{province}", province);
    urls.push(buildGoogleNewsUrl(q));
  }

  // Tier 3: Nacionales
  const national = sources.filter(s => s.tier === 3 && s.enabled !== false).slice(0, maxNational);
  for (const src of national) {
    const q = (src.searchQuery || `"${municipality}" AND (gestión OR política OR economía)`)
      .replace("{city}", municipality)
      .replace("{province}", province);
    urls.push(buildGoogleNewsUrl(q));
  }

  return urls;
}

export async function scrapeMany(
  urls: string[],
  concurrency = 3
): Promise<ReturnType<typeof scrapeUrl> extends Promise<infer T> ? T[] : never> {
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(scrapeUrl));
    results.push(...batchResults);
  }
  return results as ReturnType<typeof scrapeUrl> extends Promise<infer T> ? T[] : never;
}

// Note: simplified legacy buildSearchUrls removed to avoid duplicate export.
