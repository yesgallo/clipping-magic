// lib/scraper.ts
// Proxy scraper: fetches HTML from portals, extracts text for LLM processing.
// Falls back gracefully when a site blocks or times out.

const USER_AGENT =
  "Mozilla/5.0 (compatible; ClippingMagicBot/1.0; +https://clipping.ar/bot)";

const TIMEOUT_MS = 8000;

export interface ScrapeResult {
  url: string;
  domain: string;
  title: string;
  text: string;       // Cleaned article text, max ~3000 chars
  ok: boolean;
  error?: string;
}

// Strip tags and condense whitespace
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 4000);
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
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
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    return {
      url,
      domain,
      title: extractTitle(html),
      text: extractText(html),
      ok: true,
    };
  } catch (e: unknown) {
    return {
      url,
      domain,
      title: "",
      text: "",
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// Scrape multiple URLs concurrently with a concurrency cap
export async function scrapeMany(
  urls: string[],
  concurrency = 4
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(scrapeUrl));
    results.push(...batchResults);
  }
  return results;
}

// Build candidate URLs to scrape for a given tenant
export function buildSearchUrls(
  municipality: string,
  sources: { local: string[]; regional: string[]; national: string[] },
  extraTerms: string[]
): string[] {
  const allDomains = [
    ...sources.local,
    ...sources.regional,
    ...sources.national,
  ];

  // For each source, try common article listing paths
  const paths = ["", "/noticias", "/noticias/", "/category/noticias/"];

  const urls: string[] = [];
  for (const domain of allDomains.slice(0, 8)) {
    // cap at 8 for speed
    urls.push(`https://${domain}${paths[0]}`);
  }

  // Add Google News search as a reliable fallback
  const query = encodeURIComponent(
    `${municipality} ${extraTerms[0] || ""} noticias`
  );
  urls.push(`https://news.google.com/search?q=${query}&hl=es-AR&gl=AR&ceid=AR:es`);

  return urls;
}
