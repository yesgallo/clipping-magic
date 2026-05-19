// lib/cache.ts
// Simple KV cache using Vercel's built-in KV (or in-memory for dev).
// Cache key = tenantId + date. TTL = 24h.
// Manual refresh busts the cache via ?refresh=1

import { ClippingResult } from "./types";

// In-memory fallback for dev / when KV not configured
const memCache = new Map<string, { data: ClippingResult; ts: number }>();

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function todayKey(tenantId: string): string {
  const d = new Date();
  return `clip:${tenantId}:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function getCached(tenantId: string): Promise<ClippingResult | null> {
  const key = todayKey(tenantId);

  // Try Vercel KV if available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
      const { result } = await res.json();
      if (result) return JSON.parse(result) as ClippingResult;
    } catch {
      // fall through to memory
    }
  }

  // Memory cache
  const entry = memCache.get(key);
  if (entry && Date.now() - entry.ts < TTL_MS) return entry.data;
  return null;
}

export async function setCached(tenantId: string, data: ClippingResult): Promise<void> {
  const key = todayKey(tenantId);

  // Try Vercel KV
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: JSON.stringify(data), ex: TTL_MS / 1000 }),
      });
    } catch {
      // fall through
    }
  }

  memCache.set(key, { data, ts: Date.now() });
}

export async function bustCache(tenantId: string): Promise<void> {
  const key = todayKey(tenantId);
  memCache.delete(key);

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/del/${key}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
    } catch { /* ignore */ }
  }
}
