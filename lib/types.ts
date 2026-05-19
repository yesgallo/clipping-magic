// lib/types.ts

export const CATEGORIES = [
  "Deportes",
  "Cultura",
  "Comunidad",
  "Seguridad",
  "Infraestructura",
  "Salud",
  "Gestión municipal",
  "Efemérides",
  "Servicios públicos",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string | null;
  category: Category;
  section?: string; // ← sección del portal (política, deportes, locales, etc.)
}

export interface Topic {
  label: string;
  icon: string;
  scope?: "local" | "provincial" | "nacional"; // ← ámbito del tópico
}

export interface ClippingResult {
  tenantId: string;
  generatedAt: string;
  mode: "auto" | "topic" | "url";
  queryTopic?: string;
  topics: Topic[];
  news: NewsItem[];
  error?: string;
}

export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; icon: string }> = {
  Deportes:             { bg: "#E6F1FB", text: "#0C447C", icon: "🏆" },
  Cultura:              { bg: "#EEEDFE", text: "#3C3489", icon: "🎭" },
  Comunidad:            { bg: "#FAEEDA", text: "#633806", icon: "🤝" },
  Seguridad:            { bg: "#FCEBEB", text: "#A32D2D", icon: "🛡️" },
  Infraestructura:      { bg: "#EAF3DE", text: "#27500A", icon: "🔧" },
  Salud:                { bg: "#E1F5EE", text: "#085041", icon: "🏥" },
  "Gestión municipal":  { bg: "#E6F1FB", text: "#1B3A5C", icon: "🏛️" },
  Efemérides:           { bg: "#FBEAF0", text: "#72243E", icon: "📅" },
  "Servicios públicos": { bg: "#F1EFE8", text: "#444441", icon: "⚡" },
};

export const SCOPE_STYLES: Record<string, { bg: string; text: string }> = {
  local:      { bg: "#E6F1FB", text: "#0C447C" },
  provincial: { bg: "#EAF3DE", text: "#27500A" },
  nacional:   { bg: "#FAEEDA", text: "#633806" },
};
