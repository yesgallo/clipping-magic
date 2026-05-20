
import fs from "fs";
import path from "path";

export interface Source {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  tier: number;
}

export interface TenantConfig {
  id: string;
  name: string;
  municipality: string;
  province: string;
  logoText: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sources: {
    local: Source[];
    regional: Source[];
    national: Source[];
  };
  searchTerms: string[];
  adminPassword: string;
}

// Cargar fuentes desde JSON (global o por tenant)
function loadSources(tenantId: string): { local: Source[]; regional: Source[]; national: Source[] } {
  // 1. Intentar cargar desde tenants/{id}/sources.json (multi-tenant)
  const tenantPath = path.join(process.cwd(), "tenants", tenantId, "sources.json");
  if (fs.existsSync(tenantPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tenantPath, "utf-8"));
      return mapSourcesFromTiers(data.tiers);
    } catch (e) {
      console.warn(`[TENANTS] Error loading ${tenantPath}:`, e);
    }
  }

  // 2. Fallback a app/api/config/sources.json (global)
  const globalPath = path.join(process.cwd(), "app/api/config/sources.json");
  if (fs.existsSync(globalPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(globalPath, "utf-8"));
      return mapSourcesFromTiers(data.tiers);
    } catch (e) {
      console.warn(`[TENANTS] Error loading ${globalPath}:`, e);
    }
  }

  // 3. Último fallback: fuentes hardcodeadas (para desarrollo)
  return getDefaultSources();
}

function mapSourcesFromTiers(tiers: any[]): { local: Source[]; regional: Source[]; national: Source[] } {
  const local = tiers.find((t: any) => t.level === 1)?.sources || [];
  const regional = tiers.find((t: any) => t.level === 2)?.sources || [];
  const national = tiers.find((t: any) => t.level === 3)?.sources || [];
  
  return {
    local: local.map((s: any) => ({ ...s, tier: 1 })),
    regional: regional.map((s: any) => ({ ...s, tier: 2 })),
    national: national.map((s: any) => ({ ...s, tier: 3 })),
  };
}

function getDefaultSources(): { local: Source[]; regional: Source[]; national: Source[] } {
  return {
    local: [
      { id: "presente", name: "Presente Noticias", url: "https://presentenoticias.com", enabled: true, tier: 1 },
      { id: "lamanana", name: "Diario La Mañana", url: "https://diariolamanana.com.ar", enabled: true, tier: 1 },
      { id: "quepasa", name: "Qué Pasa en Bolívar", url: "https://quepasaenbolivar.com.ar", enabled: true, tier: 1 },
      { id: "fm10", name: "FM 10 Bolívar", url: "https://fm10bolivar.com.ar", enabled: true, tier: 1 },
    ],
    regional: [
      { id: "septima", name: "Séptima Sección", url: "https://septimaseccion.com.ar", enabled: true, tier: 2 },
      { id: "infocielo", name: "Infocielo", url: "https://infocielo.com", enabled: true, tier: 2 },
    ],
    national: [
      { id: "infocampo", name: "InfoCampo", url: "https://infocampo.com.ar", enabled: true, tier: 3 },
    ],
  };
}

const TENANTS: Record<string, Omit<TenantConfig, "sources">> = {
  bolivar: {
    id: "bolivar",
    name: "Bolívar",
    municipality: "San Carlos de Bolívar",
    province: "Buenos Aires",
    logoText: "B",
    logoUrl: "/logos/bolivar.png",
    primaryColor: "#1B3A5C",
    secondaryColor: "#4A7FB5",
    accentColor: "#B5D4F4",
    searchTerms: ["Bolívar Buenos Aires", "Bali Bucca", "municipio Bolívar"],
    adminPassword: process.env.BOLIVAR_ADMIN_PASSWORD || "admin123",
  },
  // TEMPLATE para nuevo tenant:
  // junin: {
  //   id: "junin",
  //   name: "Junín",
  //   municipality: "Junín",
  //   province: "Buenos Aires",
  //   logoText: "J",
  //   logoUrl: "/logos/junin.png",
  //   primaryColor: "#2D5016",
  //   secondaryColor: "#5A8A30",
  //   accentColor: "#C5E8A0",
  //   searchTerms: ["Junín Buenos Aires"],
  //   adminPassword: process.env.JUNIN_ADMIN_PASSWORD || "admin123",
  // },
};

export function getTenant(id: string): TenantConfig | null {
  const base = TENANTS[id];
  if (!base) return null;
  
  // Cargar fuentes dinámicamente
  const sources = loadSources(id);
  
  return { ...base, sources };
}

export function getAllTenants(): TenantConfig[] {
  return Object.keys(TENANTS).map(id => getTenant(id)).filter((t): t is TenantConfig => t !== null);
}

export function resolveTenantId(
  hostname: string,
  searchParams?: URLSearchParams
): string {
  const override = searchParams?.get("tenant");
  if (override && TENANTS[override]) return override;
  
  const parts = hostname.split(".");
  if (parts.length >= 3 && TENANTS[parts[0]]) return parts[0];
  
  return "bolivar";
}