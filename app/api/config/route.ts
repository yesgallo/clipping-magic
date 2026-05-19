// app/api/config/route.ts
// Returns public tenant config (no secrets).
import { NextRequest, NextResponse } from "next/server";
import { getTenant, resolveTenantId } from "@/lib/tenants";

export async function GET(req: NextRequest) {
  const { searchParams, hostname } = new URL(req.url);
  const tenantId = resolveTenantId(hostname, searchParams);
  const tenant = getTenant(tenantId);
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip sensitive fields
  const { adminPassword: _, ...publicConfig } = tenant;
  return NextResponse.json(publicConfig);
}
