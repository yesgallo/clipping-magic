// lib/tenants.ts
// Each tenant is a municipality or local news client.
// Add new clients here — no code changes needed elsewhere.

export interface TenantConfig {
  id: string;
  name: string;               // Display name
  municipality: string;       // Full name for searches
  province: string;
  logoText: string;           // Short name for logo badge
  primaryColor: string;       // Hex
  secondaryColor: string;
  accentColor: string;
  sources: {
    local: string[];          // Domain list, local portals
    regional: string[];       // Regional portals
    national: string[];       // National portals with local coverage
  };
  searchTerms: string[];      // Extra terms beyond municipality name
  adminPassword: string;      // Set per-tenant via env or here
}

// ─── TENANT REGISTRY ────────────────────────────────────────────────────────

const TENANTS: Record<string, TenantConfig> = {
  bolivar: {
    id: "bolivar",
    name: "Bolívar",
    municipality: "San Carlos de Bolívar",
    province: "Buenos Aires",
    logoText: "B",
    primaryColor: "#1B3A5C",
    secondaryColor: "#4A7FB5",
    accentColor: "#B5D4F4",
    sources: {
      local: [
        "presentenoticias.com",
        "diariolamanana.com.ar",
        "quepasaenbolivar.com.ar",
        "fm10bolivar.com.ar",
      ],
      regional: [
        "septimaseccion.com.ar",
        "lapoliticaonline.com",
        "infocielo.com",
        "latecla.info",
        "lanoticia1.com",
        "grupolaprovincia.com",
        "0221.com.ar",
      ],
      national: ["infocampo.com.ar"],
    },
    searchTerms: ["Bolívar Buenos Aires", "Bali Bucca", "municipio Bolívar"],
    adminPassword: process.env.BOLIVAR_ADMIN_PASSWORD || "admin123",
  },

  // ── TEMPLATE: duplicate and fill to add a new client ───────────────────
  // olavarria: {
  //   id: "olavarria",
  //   name: "Olavarría",
  //   municipality: "Olavarría",
  //   province: "Buenos Aires",
  //   logoText: "O",
  //   primaryColor: "#2D5016",
  //   secondaryColor: "#5A8A30",
  //   accentColor: "#C5E8A0",
  //   sources: {
  //     local: ["elpopular.com.ar", "infolavarria.com"],
  //     regional: ["septimaseccion.com.ar", "infocielo.com"],
  //     national: ["infocampo.com.ar"],
  //   },
  //   searchTerms: ["Olavarría Buenos Aires", "intendente Wesner"],
  //   adminPassword: process.env.OLAVARRIA_ADMIN_PASSWORD || "admin123",
  // },
};

export function getTenant(id: string): TenantConfig | null {
  return TENANTS[id] ?? null;
}

export function getAllTenants(): TenantConfig[] {
  return Object.values(TENANTS);
}

// Resolve tenant from hostname: bolivar.clipping.ar → "bolivar"
// or from ?tenant=bolivar query param (dev mode)
export function resolveTenantId(
  hostname: string,
  searchParams?: URLSearchParams
): string {
  // Dev override
  const override = searchParams?.get("tenant");
  if (override && TENANTS[override]) return override;

  // Subdomain: bolivar.yourdomain.com
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const sub = parts[0];
    if (TENANTS[sub]) return sub;
  }

  // Default fallback
  return "bolivar";
}
