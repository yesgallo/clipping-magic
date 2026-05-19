"use client";
// app/page.tsx
import { useState, useEffect, useCallback } from "react";
import { ClippingResult, CATEGORY_STYLES, Category } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function getTenantParam() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("tenant") ?? "bolivar";
}

// ─── Components ──────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "48px 0" }}>
      <div className="spinner" />
      <p style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>Generando clipping…</p>
      <style>{`.spinner{width:32px;height:32px;border:3px solid #E0E4EA;border-top-color:var(--primary,#1B3A5C);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Badge({ category }: { category: Category }) {
  const s = CATEGORY_STYLES[category] ?? { bg: "#eee", text: "#555", icon: "📌" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 9px", borderRadius: 20,
      background: s.bg, color: s.text,
    }}>
      {s.icon} {category}
    </span>
  );
}

function NewsCard({ item, primary }: { item: ClippingResult["news"][0]; primary: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\nFuente: ${item.source} · ${item.date}`);
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

      <h3 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 16, fontWeight: 400, lineHeight: 1.35,
        color: "#111827", marginBottom: 8,
      }}>{item.title}</h3>

      {item.summary.split("\n\n").map((p, i) => (
        <p key={i} style={{
          fontSize: 13, color: "#4B5563", lineHeight: 1.65,
          marginBottom: i < item.summary.split("\n\n").length - 1 ? 8 : 0,
        }}>{p}</p>
      ))}

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "0.5px solid #F0F2F5", marginTop: 12, paddingTop: 10,
      }}>
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#9CA3AF", alignItems: "center" }}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ color: primary, fontWeight: 500 }}>{item.source}</a>
          ) : (
            <span style={{ fontWeight: 500, color: "#6B7280" }}>{item.source}</span>
          )}
          <span>·</span>
          <span>{item.date}</span>
        </div>
        <button onClick={copy} style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 6,
          border: `0.5px solid ${copied ? primary : "#E2E6ED"}`,
          color: copied ? primary : "#6B7280",
          background: copied ? `${primary}10` : "transparent",
          display: "flex", alignItems: "center", gap: 4,
          transition: "all .15s",
        }}>
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<ClippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"auto" | "topic" | "url">("auto");
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [config, setConfig] = useState<{ name: string; primaryColor: string; logoText: string; municipality: string } | null>(null);

  const primary = config?.primaryColor ?? "#1B3A5C";

  // Load tenant config
  useEffect(() => {
    const tenant = getTenantParam();
    fetch(`/api/config?tenant=${tenant}`)
      .then(r => r.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  const fetchClipping = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    const tenant = getTenantParam();

    let url = `/api/clip?tenant=${tenant}&mode=${mode}`;
    if (mode === "topic" && input) url += `&topic=${encodeURIComponent(input)}`;
    if (mode === "url" && input) url += `&url=${encodeURIComponent(input)}`;
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
  }, [mode, input]);

  // Auto-load on mount
  useEffect(() => { fetchClipping(); }, []); // eslint-disable-line

  const filtered = data?.news.filter(n =>
    activeCategory === "Todas" || n.category === activeCategory
  ) ?? [];

  const categories = ["Todas", ...Array.from(new Set(data?.news.map(n => n.category) ?? []))];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      {/* ── Header ── */}
      <header style={{
        background: primary, padding: "1rem 1.25rem 0.875rem",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 30, height: 30, background: "rgba(255,255,255,0.15)",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)",
          }}>
            {config?.logoText ?? "C"}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: 0.3 }}>
              {config?.name ?? "Clipping"}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, textTransform: "uppercase" }}>
              Municipio
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 6,
              padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.9)",
            }}>✂ Clipping</span>
          </div>
        </div>
        {data && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", paddingLeft: 40 }}>
            {formatDate(data.generatedAt)} · {data.news.length} noticias
            {"fromCache" in data && (
              <button onClick={() => fetchClipping(true)} style={{
                marginLeft: 8, fontSize: 10, color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.1)", border: "none",
                borderRadius: 4, padding: "1px 6px", cursor: "pointer",
              }}>↻ Actualizar</button>
            )}
          </div>
        )}
      </header>

      {/* ── Search bar ── */}
      <div style={{ padding: "0.875rem 1rem 0", background: "#F4F5F7" }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {(["auto", "topic", "url"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: mode === m ? primary : "#fff",
              color: mode === m ? "#fff" : "#6B7280",
              border: `1px solid ${mode === m ? primary : "#E2E6ED"}`,
              transition: "all .15s",
            }}>
              {m === "auto" ? "🗞 General" : m === "topic" ? "🔍 Temático" : "🔗 URL"}
            </button>
          ))}
        </div>

        {mode !== "auto" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchClipping()}
              placeholder={mode === "topic" ? "ej: seguridad, obras, salud…" : "https://…"}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 13,
                border: "1px solid #E2E6ED", background: "#fff", color: "#111",
                outline: "none",
              }}
            />
            <button onClick={() => fetchClipping()} style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: primary, color: "#fff",
            }}>Buscar</button>
          </div>
        )}

        {mode === "auto" && (
          <button onClick={() => fetchClipping()} style={{
            width: "100%", padding: "8px 0", borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: primary, color: "#fff", marginBottom: 8,
          }}>
            {loading ? "Generando…" : "Generar Clipping"}
          </button>
        )}
      </div>

      {/* ── Topics ── */}
      {data?.topics && data.topics.length > 0 && (
        <div style={{
          margin: "0 1rem 0", padding: "0.875rem 1rem",
          background: "#fff", borderRadius: 12, border: "0.5px solid #E2E6ED",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.7px",
            textTransform: "uppercase", color: primary, marginBottom: 8,
          }}>
            🔥 Tópicos del día
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.topics.map((t, i) => (
              <span key={i} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                background: `${primary}12`, color: primary,
                border: `0.5px solid ${primary}30`, display: "flex", alignItems: "center", gap: 4,
              }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Category filter ── */}
      {data && data.news.length > 0 && (
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", padding: "0.75rem 1rem 0",
          scrollbarWidth: "none",
        }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              flexShrink: 0, fontSize: 11, padding: "4px 12px", borderRadius: 20,
              fontWeight: 500,
              background: activeCategory === cat ? primary : "#fff",
              color: activeCategory === cat ? "#fff" : "#6B7280",
              border: `0.5px solid ${activeCategory === cat ? primary : "#E2E6ED"}`,
            }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── News section label ── */}
      {data && filtered.length > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.7px",
          textTransform: "uppercase", color: "#9CA3AF",
          padding: "0.875rem 1.25rem 0.5rem",
        }}>
          📰 Noticias · {filtered.length} resultados
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: "0 1rem" }}>
        {loading && <Spinner />}
        {error && (
          <div style={{
            padding: "1rem", borderRadius: 12, background: "#FEF2F2",
            border: "0.5px solid #FECACA", color: "#991B1B", fontSize: 13, marginTop: 12,
          }}>
            ⚠️ {error}
          </div>
        )}
        {!loading && filtered.map((item, i) => (
          <NewsCard key={i} item={item} primary={primary} />
        ))}
        {!loading && data && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "32px 0", fontSize: 13, color: "#9CA3AF",
          }}>
            No hay noticias en esta categoría.
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {data && (
        <div style={{
          margin: "1.5rem 1.25rem 0", paddingTop: "1rem",
          borderTop: "0.5px solid #E2E6ED",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 18, height: 18, background: primary, borderRadius: 3,
              fontSize: 10, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {config?.logoText ?? "C"}
            </div>
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>
              {config?.name} Municipio · Clipping Magic
            </span>
          </div>
          <a href="/admin" style={{ fontSize: 10, color: "#9CA3AF", textDecoration: "underline" }}>
            Admin
          </a>
        </div>
      )}
    </div>
  );
}
