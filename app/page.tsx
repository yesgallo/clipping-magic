// app/page.tsx - Versión corregida y lista para producción
"use client";
import { useState, useEffect, useCallback } from "react";
import { ClippingResult, CATEGORY_STYLES, SCOPE_STYLES, type Category } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// SPINNER COMPONENT
// ─────────────────────────────────────────────────────────────
function Spinner({ primary }: { primary: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "48px 0" }}>
      <div style={{
        width: 32, height: 32,
        border: `3px solid #E0E4EA`,
        borderTopColor: primary,
        borderRadius: "50%",
        animation: "spin .8s linear infinite",
      }} />
      <p style={{ fontSize: 13, color: "#888" }}>Cargando noticias…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BADGE COMPONENT
// ─────────────────────────────────────────────────────────────
function Badge({ category }: { category: Category | string }) {
  const cat = category as Category;
  const s = CATEGORY_STYLES[cat] ?? { bg: "#F1EFE8", text: "#444441", icon: "📰" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 9px", borderRadius: 20,
      background: s.bg, color: s.text,
      whiteSpace: "nowrap",
    }}>
      {s.icon} {cat}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// NEWS CARD COMPONENT
// ─────────────────────────────────────────────────────────────
function NewsCard({ item, primary }: { item: any; primary: string }) {
  const [copied, setCopied] = useState(false);
  
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
    try { new URL(url); return true; } catch { return false; }
  };
  
  const hasValidUrl = isValidUrl(item.url);

  const copy = async () => {
    const text = `${item.title}\n\n${item.summary}\n\nFuente: ${item.source} · ${item.date}${hasValidUrl ? `\n${item.url}` : ""}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article style={{
      background: "#fff", borderRadius: 14, padding: "1rem 1.125rem",
      border: "0.5px solid #E2E6ED", marginBottom: 10,
    }}>
      <div style={{ marginBottom: 8 }}>
        <Badge category={item.category || "Comunidad"} />
      </div>

      {hasValidUrl ? (
        <a href={item.url!} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <h3 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 16, fontWeight: 400, lineHeight: 1.35,
            color: primary, marginBottom: 8,
            textDecoration: "underline", textDecorationColor: `${primary}40`,
            textUnderlineOffset: 3,
            cursor: "pointer",
          }}>{item.title} ↗</h3>
        </a>
      ) : (
        <h3 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 16, fontWeight: 400, lineHeight: 1.35,
          color: "#111827", marginBottom: 8,
        }}>{item.title}</h3>
      )}

      {item.summary?.split("\n\n").map((p: string, i: number) => (
        <p key={i} style={{
          fontSize: 13, color: "#4B5563", lineHeight: 1.65,
          marginBottom: i < (item.summary?.split("\n\n").length || 1) - 1 ? 8 : 0,
        }}>{p}</p>
      ))}

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "0.5px solid #F0F2F5", marginTop: 12, paddingTop: 10,
        gap: 8, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#9CA3AF", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          {hasValidUrl ? (
            <a href={item.url!} target="_blank" rel="noopener noreferrer"
              style={{ color: primary, fontWeight: 500, textDecoration: "none" }}>
              {item.source}
            </a>
          ) : (
            <span style={{ fontWeight: 500, color: "#6B7280" }}>{item.source}</span>
          )}
          <span>·</span>
          <span>{item.date}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {hasValidUrl && (
            <a href={item.url!} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 6,
              border: `0.5px solid ${primary}40`,
              color: primary, background: `${primary}08`,
              display: "flex", alignItems: "center", gap: 3,
              textDecoration: "none",
            }}>Ver nota</a>
          )}
          <button onClick={copy} style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 6,
            border: `0.5px solid ${copied ? primary : "#E2E6ED"}`,
            color: copied ? primary : "#6B7280",
            background: copied ? `${primary}10` : "transparent",
            display: "flex", alignItems: "center", gap: 3,
            transition: "all .15s", cursor: "pointer",
          }}>
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [config, setConfig] = useState<any>(null);

  // ✅ Validar color primary con fallback seguro
  const primary = config?.primaryColor && /^#([0-9A-F]{3}){1,2}$/i.test(config.primaryColor)
    ? config.primaryColor
    : "#1B3A5C";

  function getTenant() {
    if (typeof window === "undefined") return "bolivar";
    return new URLSearchParams(window.location.search).get("tenant") ?? "bolivar";
  }

  // Cargar config del tenant
  useEffect(() => {
    fetch(`/api/config?tenant=${getTenant()}`)
      .then(r => r.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  const fetchClipping = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    setActiveCategory("Todas");
    const tenant = getTenant();
    let url = `/api/clip?tenant=${tenant}&mode=${input && input.startsWith('http') ? 'url' : 'auto'}`;
    if (input && input.startsWith('http')) url += `&url=${encodeURIComponent(input)}`;
    if (refresh) url += "&refresh=1";

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [input]);

  // Cargar clipping al montar
  useEffect(() => { fetchClipping(); }, []); // eslint-disable-line

  // ✅ Filtrar solo noticias inválidas (títulos vacíos o "sin resultados")
  const validNews = (data?.news ?? []).filter((n: any) => {
    if (!n?.title) return false;
    const title = String(n.title).toLowerCase();
    return !title.includes("sin resultados") && title.length > 5;
  });

  // ✅ Calcular categorías de TODAS las noticias (data?.news) para que no desaparezcan al filtrar
  const allCategories = Array.from(
    new Set(
      (data?.news || [])
        .map((n: any) => n?.category)
        .filter((cat): cat is string => !!cat && cat !== "undefined")
    )
  );
  const categories = ["Todas", ...allCategories];

  // ✅ Filtrar por categoría activa (solo para render)
  const filtered = activeCategory === "Todas"
    ? validNews
    : validNews.filter((n: any) => n.category === activeCategory);

  // Formato de fecha seguro
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
    try {
      return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 48, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: primary,
        padding: "0.875rem 1.25rem",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.name}
              style={{ height: 36, maxWidth: 140, objectFit: "contain", filter: "brightness(0) invert(1)" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 30, height: 30, background: "rgba(255,255,255,0.18)",
                borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.25)",
              }}>{config?.logoText?.charAt(0) ?? "B"}</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: 0.2 }}>
                {config?.name ?? "Clipping"}
              </span>
            </div>
          )}

          <div style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8, padding: "4px 10px",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 13 }}>✂</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: 0.3 }}>
              Clipping <span style={{ fontStyle: "italic", fontWeight: 300 }}>magic</span>
            </span>
          </div>
        </div>

        {data && (
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.6)",
            marginTop: 5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          }}>
            <span>📅 {formatDate(data.generatedAt)}</span>
            <span>·</span>
            <span>{validNews.length} noticias</span>
            {data.fromCache && (
              <button onClick={() => fetchClipping(true)} style={{
                marginLeft: 4, fontSize: 10, color: "rgba(255,255,255,0.75)",
                background: "rgba(255,255,255,0.12)", border: "none",
                borderRadius: 4, padding: "2px 7px", cursor: "pointer",
              }}>↻ Actualizar</button>
            )}
          </div>
        )}
      </header>

      {/* ── SEARCH BAR ── */}
      <div style={{ padding: "0.875rem 1rem", background: "#F4F5F7" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchClipping()}
            placeholder="https://portal.com/nota (opcional)"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 8, fontSize: 13,
              border: "1px solid #E2E6ED", background: "#fff", color: "#111",
              outline: "none",
            }}
          />
          <button onClick={() => fetchClipping()} disabled={loading} style={{
            padding: "9px 16px", borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: primary, color: "#fff", 
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.8 : 1,
          }}>
            {loading ? "⏳" : "🔍"}
          </button>
        </div>
      </div>

      {/* ── TÓPICOS DEL DÍA ── */}
      {data?.topics && data.topics.length > 0 && (
        <div style={{
          margin: "0.75rem 1rem 0",
          background: "#fff", borderRadius: 12,
          border: "0.5px solid #E2E6ED",
          padding: "0.875rem 1rem",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.7px",
            textTransform: "uppercase", color: primary, marginBottom: 10,
          }}>
            🔥 Tópicos del día
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.topics.map((t: any, i: number) => (
              <span key={i} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                background: `${primary}10`, color: primary,
                border: `1px solid ${primary}30`,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTRO POR CATEGORÍA - VERSIÓN CORREGIDA ── */}
      {categories.length > 1 && (
        <div style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "0.75rem 1rem 0",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {categories.map((cat: unknown) => {
            const category = cat as string;
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: isActive ? primary : "#fff",
                  color: isActive ? "#fff" : "#6B7280",
                  border: `1px solid ${isActive ? primary : "#E2E6ED"}`, // ✅ 1px visible
                  transition: "all .15s",
                  whiteSpace: "nowrap", // ✅ Evita saltos de línea
                  minHeight: "32px", // ✅ Mejor para touch
                  opacity: isActive ? 1 : 0.9,
                }}
                aria-pressed={isActive}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SECCIÓN LABEL ── */}
      {data && filtered.length > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.7px",
          textTransform: "uppercase", color: "#9CA3AF",
          padding: "0.875rem 1.25rem 0.5rem",
        }}>
          📰 Noticias · {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "Todas" && ` en ${activeCategory}`}
        </div>
      )}

      {/* ── CARDS ── */}
      <div style={{ padding: "0 1rem" }}>
        {loading && <Spinner primary={primary} />}
        
        {error && (
          <div style={{
            padding: "1rem", borderRadius: 12, background: "#FEF2F2",
            border: "1px solid #FECACA", color: "#991B1B", fontSize: 13, marginTop: 12,
          }}>
            ⚠️ {error}
            <button 
              onClick={() => fetchClipping()} 
              style={{ marginLeft: 8, background: "none", border: "none", color: "#991B1B", textDecoration: "underline", cursor: "pointer", fontSize: 13 }}
            >
              Reintentar
            </button>
          </div>
        )}
        
        {!loading && filtered.map((item: any, i: number) => (
          <NewsCard key={`${item.title}-${i}`} item={item} primary={primary} />
        ))}
        
        {!loading && data && filtered.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "32px 0", fontSize: 13, color: "#9CA3AF",
          }}>
            {data?.message || "No hay noticias en esta categoría."}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      {data && (
        <div style={{
          margin: "1.5rem 1.25rem 0", paddingTop: "1rem",
          borderTop: "1px solid #E2E6ED",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>
            ✂ Clipping magic · {config?.name} Municipio
          </span>
        </div>
      )}
    </div>
  );
}
