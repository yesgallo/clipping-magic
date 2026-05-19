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
  summary: string;        // 1-2 paragraphs, neutral language
  source: string;         // Portal name
  date: string;           // "DD de mes de YYYY" or "may 2026"
  url?: string;
  category: Category;
}

export interface Topic {
  label: string;          // 2-4 words
  icon: string;           // emoji
}

export interface ClippingResult {
  tenantId: string;
  generatedAt: string;    // ISO timestamp
  mode: "auto" | "topic" | "url";
  queryTopic?: string;
  topics: Topic[];        // 5-7 trending topics
  news: NewsItem[];       // 10-20 items
  error?: string;
}

export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; icon: string }> = {
  Deportes:           { bg: "#E6F1FB", text: "#0C447C", icon: "🏆" },
  Cultura:            { bg: "#EEEDFE", text: "#3C3489", icon: "🎭" },
  Comunidad:          { bg: "#FAEEDA", text: "#633806", icon: "🤝" },
  Seguridad:          { bg: "#FCEBEB", text: "#A32D2D", icon: "🛡️" },
  Infraestructura:    { bg: "#EAF3DE", text: "#27500A", icon: "🔧" },
  Salud:              { bg: "#E1F5EE", text: "#085041", icon: "🏥" },
  "Gestión municipal":{ bg: "#E6F1FB", text: "#1B3A5C", icon: "🏛️" },
  Efemérides:         { bg: "#FBEAF0", text: "#72243E", icon: "📅" },
  "Servicios públicos":{ bg: "#F1EFE8", text: "#444441", icon: "⚡" },
};
