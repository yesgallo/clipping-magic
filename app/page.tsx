
"use client";
import { useState, useEffect, useCallback } from "react";
import { ClippingResult, CATEGORY_STYLES, SCOPE_STYLES, Category } from "@/lib/types";

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
      <p style={{ fontSize: 13, color: "#888" }}>Generando clipping…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BADGE COMPONENT (con soporte para categorías nuevas)
// ─────────────────────────────────────────────────────────────
function Badge({ category }: { category: Category }) {
  const s = CATEGORY_STYLES[category] ?? { bg: "#F1EFE8", text: "#444441", icon: "📌" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 9px", borderRadius: 20,
      background: s.bg, color: s.text,
      whiteSpace: "nowrap",
    }}>
      {s.icon} {category}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// NEWS CARD COMPONENT (con validación robusta de URLs)
// ─────────────────────────────────────────────────────────────
function NewsCard({ item, primary }: { item: ClippingResult["news"][0]; primary: string }) {
  const [copied, setCopied] = useState(false);
  
  // ✅ Validación robusta de URL: debe ser http/https y no demasiado larga
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
    if (url.length > 500) return false; // Evitar URLs corruptas
    try {
      new URL(url); // Validar que sea URL parseable
      return true;
    } catch {
      return false;
    }
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
      transition: "border-color .15s",
    }}>
      <div style={{ marginBottom: 8 }}>
        <Badge category={item.category as Category} />
      </div>

      {/* Título — clickeable SOLO si hay URL válida */}
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

      {/* Resumen con párrafos */}
      {item.summary.split("\n\n").map((p, i) => (
        <p key={i} style={{
          fontSize: 13, color: "#4B5563", lineHeight: 1.65,
          marginBottom: i < item.summary.split("\n\n").length - 1 ? 8 : 0,
        }}>{p}</p>
      ))}

      {/* Footer */}
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
          {item.section && item.section.trim().length > 0 && (
            <>
              <span>·</span>
              <span style={{
                background: "#F3F4F6", color: "#6B7280",
                padding: "1px 7px", borderRadius: 10, fontSize: 10,
              }}>#{item.section}</span>
            </>
          )}
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
  const [data, setData] = useState<ClippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [config, setConfig] = useState<{
    name: string; primaryColor: string; logoText: string;
    logoUrl?: string; municipality: string;
  } | null>(null);

  const primary = config?.primaryColor ?? "#1B3A5C";

  function getTenant() {
    if (typeof window === "undefined") return "bolivar";
    return new URLSearchParams(window.location.search).get("tenant") ?? "bolivar";
  }

  useEffect(() => {
    fetch(`/api/config?tenant=${getTenant()}`)
      .then(r => r.json()).then(setConfig).catch(console.error);
  }, []);

  const fetchClipping = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    setActiveCategory("Todas");
    const tenant = getTenant();
    
    // Solo dos modos: auto (sin input) o url (con input)
    let url = `/api/clip?tenant=${tenant}&mode=${input && input.startsWith('http') ? 'url' : 'auto'}`;
    
    if (input && input.startsWith('http')) {
      url += `&url=${encodeURIComponent(input)}`;
    }
    if (refresh) url += "&refresh=1";

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [input]); 

  useEffect(() => { fetchClipping(); }, []); // eslint-disable-line

  // ✅ Filtrar noticias no válidas:
  // - Títulos con "sin resultados"
  // - Títulos muy cortos (< 10 chars)
  // - Categorías no reconocidas (fallback a "Comunidad")
  const validNews = (data?.news ?? []).filter(n => {
    const title = n.title?.toLowerCase() || "";
    if (title.includes("sin resultados")) return false;
    if (!n.title || n.title.trim().length < 10) return false;
    return true;
  }).map(n => ({
    ...n,
    // ✅ Normalizar categoría: "Gestión municipal" → "Gestión"
    category: ((n.category as string) === "Gestión municipal" ? "Gestión" : n.category) as Category,
  }));

  // Agrupar por categoría (solo noticias válidas)
  const groupedNews = validNews.reduce((acc, item) => {
    const cat = item.category || 'Comunidad';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof validNews>);

  // Categories para el filtro (basado en noticias válidas)
  const categories = ["Todas", ...Array.from(new Set(validNews.map(n => n.category).filter(Boolean)))];
  
  const filtered = activeCategory === "Todas"
    ? validNews
    : validNews.filter(n => n.category === activeCategory);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 48, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: primary,
        padding: "0.875rem 1.25rem",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Logo del municipio */}
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
              }}>{config?.logoText?.charAt(0) ?? "C"}</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: 0.2 }}>
                {config?.name ?? "Clipping"}
              </span>
            </div>
          )}

          {/* Clipping Magic badge */}
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

        {/* Subline con fecha y contador */}
        {data && (
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.6)",
            marginTop: 5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          }}>
            <span>📅 {new Date(data.generatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>{validNews.length} noticias</span>
            {"fromCache" in data && data.fromCache && (
              <button onClick={() => fetchClipping(true)} style={{
                marginLeft: 4, fontSize: 10, color: "rgba(255,255,255,0.75)",
                background: "rgba(255,255,255,0.12)", border: "none",
                borderRadius: 4, padding: "2px 7px", cursor: "pointer",
              }}>↻ Actualizar</button>
            )}
          </div>
        )}
      </header>

      {/* ── SEARCH BAR SIMPLIFICADA ── */}
      <div style={{ padding: "0.875rem 1rem", background: "#F4F5F7" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchClipping()}
            placeholder="https://portal.com/nota (opcional) — dejá vacío para clipping automático"
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
            transition: "opacity .15s",
          }}>
            {loading ? "⏳" : "🔍"}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 6, paddingLeft: 2, lineHeight: 1.4 }}>
          💡 Dejá el campo vacío y presioná 🔍 para generar el clipping automático del día
        </p>
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
            display: "flex", alignItems: "center", gap: 5,
          }}>
            🔥 Tópicos del día
            <span style={{ fontSize: 9, fontWeight: 400, color: "#9CA3AF", textTransform: "none", letterSpacing: 0 }}>
              — local · provincial · nacional
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.topics.map((t, i) => {
              const scopeStyle = SCOPE_STYLES[t.scope ?? "local"] ?? SCOPE_STYLES.local;
              return (
                <span key={i} style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 20,
                  background: `${primary}10`, color: primary,
                  border: `0.5px solid ${primary}30`,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {t.icon} {t.label}
                  {t.scope && (
                    <span style={{
                      fontSize: 9, padding: "1px 5px", borderRadius: 8,
                      background: scopeStyle.bg, color: scopeStyle.text,
                      marginLeft: 2,
                    }}>{t.scope}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FILTRO POR CATEGORÍA ── */}
      {validNews.length > 0 && (
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          padding: "0.75rem 1rem 0", scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              flexShrink: 0, fontSize: 11, padding: "4px 12px", borderRadius: 20,
              fontWeight: 500, cursor: "pointer",
              background: activeCategory === cat ? primary : "#fff",
              color: activeCategory === cat ? "#fff" : "#6B7280",
              border: `0.5px solid ${activeCategory === cat ? primary : "#E2E6ED"}`,
              transition: "all .15s",
            }}>
              {cat}
            </button>
          ))}
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
            border: "0.5px solid #FECACA", color: "#991B1B", fontSize: 13, marginTop: 12,
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
        
        {!loading && filtered.map((item, i) => (
          <NewsCard key={`${item.title}-${i}`} item={item} primary={primary} />
        ))}
        
        {!loading && data && filtered.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "32px 0", fontSize: 13, color: "#9CA3AF",
          }}>
            {activeCategory === "Todas" 
              ? "No se encontraron noticias válidas. Intentá actualizar." 
              : `No hay noticias en "${activeCategory}".`
            }
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      {data && (
        <div style={{
          margin: "1.5rem 1.25rem 0", paddingTop: "1rem",
          borderTop: "0.5px solid #E2E6ED",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>
            ✂ Clipping magic · {config?.name} Municipio
          </span>
          <a href="/admin" style={{ fontSize: 10, color: "#9CA3AF", textDecoration: "underline" }}>
            Admin
          </a>
        </div>
      )}
    </div>
  );
}
