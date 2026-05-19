// lib/tenants.ts
export interface TenantConfig {
  id: string;
  name: string;
  municipality: string;
  province: string;
  logoText: string;
  logoUrl?: string;         // ← NUEVO: URL/path al logo SVG o PNG
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sources: {
    local: string[];
    regional: string[];
    national: string[];
  };
  searchTerms: string[];
  adminPassword: string;
}

const TENANTS: Record<string, TenantConfig> = {
  bolivar: {
    id: "bolivar",
    name: "Bolívar",
    municipality: "San Carlos de Bolívar",
    province: "Buenos Aires",
    logoText: "B",
    logoUrl: "/logos/bolivar.png",   // ← ponés el archivo en public/logos/bolivar.png
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

  // ── TEMPLATE ──────────────────────────────────────────────────────────────
  // olavarria: {
  //   id: "olavarria",
  //   name: "Olavarría",
  //   municipality: "Olavarría",
  //   province: "Buenos Aires",
  //   logoText: "O",
  //   logoUrl: "/logos/olavarria.png",
  //   primaryColor: "#2D5016",
  //   secondaryColor: "#5A8A30",
  //   accentColor: "#C5E8A0",
  //   sources: {
  //     local: ["elpopular.com.ar"],
  //     regional: ["septimaseccion.com.ar", "infocielo.com"],
  //     national: ["infocampo.com.ar"],
  //   },
  //   searchTerms: ["Olavarría Buenos Aires"],
  //   adminPassword: process.env.OLAVARRIA_ADMIN_PASSWORD || "admin123",
  // },
};

export function getTenant(id: string): TenantConfig | null {
  return TENANTS[id] ?? null;
}

export function getAllTenants(): TenantConfig[] {
  return Object.values(TENANTS);
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
