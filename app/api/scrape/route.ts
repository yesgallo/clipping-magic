// app/api/scrape/route.ts
// Proxy endpoint: browser can't scrape directly (CORS), so it calls this.
import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  try {
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const result = await scrapeUrl(url);
  return NextResponse.json(result);
}
