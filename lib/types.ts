
export const CATEGORIES = [
  "Deportes",
  "Cultura", 
  "Comunidad",
  "Seguridad",
  "Infraestructura",
  "Salud",
  "Gestión",  
  "Educación",  
  "Política",   
  "Efemérides",
  "Servicios públicos",
  "Economía",   
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; icon: string }> = {
  Deportes: { bg: "#E6F1FB", text: "#0C447C", icon: "⚽" },
  Cultura: { bg: "#EEEDFE", text: "#3C3489", icon: "🎭" },
  Comunidad: { bg: "#FAEEDA", text: "#633806", icon: "🤝" },
  Seguridad: { bg: "#FCEBEB", text: "#A32D2D", icon: "🛡️" },
  Infraestructura: { bg: "#EAF3DE", text: "#27500A", icon: "🏗️" },
  Salud: { bg: "#E1F5EE", text: "#085041", icon: "🏥" },
  Gestión: { bg: "#E6F1FB", text: "#1B3A5C", icon: "🏛️" },  
  Educación: { bg: "#FEF3C7", text: "#92400E", icon: "🎓" },  
  Política: { bg: "#FCE7F3", text: "#9D174D", icon: "🗳️" },   
  Efemérides: { bg: "#FBEAF0", text: "#72243E", icon: "📅" },
  "Servicios públicos": { bg: "#F1EFE8", text: "#444441", icon: "🔧" },
  Economía: { bg: "#DCFCE7", text: "#166534", icon: "💰" },
};

export const SCOPE_STYLES = {
  local: { bg: "#DBEAFE", text: "#1E40AF" },
  provincial: { bg: "#FEF3C7", text: "#92400E" },
  nacional: { bg: "#FCE7F3", text: "#9D174D" },
} as const;

export type Scope = keyof typeof SCOPE_STYLES;

export interface ClippingResult {
  tenantId: string;
  generatedAt: string;
  mode: "auto" | "topic" | "url";
  queryTopic?: string;
  topics: Array<{ label: string; icon: string; scope: Scope }>;
  news: Array<{
    title: string;
    summary: string;
    source: string;
    date: string;
    url: string | null;
    category: Category;
    section?: string | null;  // ← Sección del portal (cintillo)
  }>;
  fromCache?: boolean;
}
