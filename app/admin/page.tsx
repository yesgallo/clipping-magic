"use client";
// app/admin/page.tsx
import { useState, useEffect } from "react";

interface Config {
  id: string; name: string; municipality: string; province: string;
  primaryColor: string; logoText: string;
  sources: { local: string[]; regional: string[]; national: string[] };
  searchTerms: string[];
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState("");
  const [busting, setBusting] = useState(false);

  function getTenant() {
    return new URLSearchParams(window.location.search).get("tenant") ?? "bolivar";
  }

  const login = () => {
    // Basic client check — real auth is enforced server-side via middleware
    if (password.length > 3) {
      sessionStorage.setItem("admin_pwd", password);
      setAuthed(true);
      loadConfig();
    }
  };

  const loadConfig = async () => {
    const res = await fetch(`/api/config?tenant=${getTenant()}`);
    const data = await res.json();
    setConfig(data);
  };

  const bustCache = async () => {
    setBusting(true);
    setStatus("");
    try {
      const res = await fetch(`/api/clip?tenant=${getTenant()}&refresh=1`);
      const data = await res.json();
      setStatus(`✅ Clipping actualizado: ${data.news?.length ?? 0} noticias`);
    } catch {
      setStatus("❌ Error al actualizar");
    } finally {
      setBusting(false);
    }
  };

  const primary = config?.primaryColor ?? "#1B3A5C";

  if (!authed) {
    return (
      <div style={{
        maxWidth: 400, margin: "80px auto", padding: "2rem",
        background: "#fff", borderRadius: 16, border: "0.5px solid #E2E6ED",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: 48, height: 48, background: "#1B3A5C", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 auto 24px",
        }}>C</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 6 }}>
          Panel de Administración
        </h1>
        <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 24 }}>
          Clipping Magic · Acceso restringido
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="Contraseña"
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
            border: "1px solid #E2E6ED", marginBottom: 12, outline: "none",
          }}
        />
        <button onClick={login} style={{
          width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 14,
          fontWeight: 600, background: "#1B3A5C", color: "#fff",
        }}>
          Entrar
        </button>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/" style={{ fontSize: 12, color: "#9CA3AF" }}>← Volver al clipping</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem 3rem", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: primary, borderRadius: 14, padding: "1rem 1.25rem",
        marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, background: "rgba(255,255,255,0.2)",
          borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff",
        }}>{config?.logoText ?? "C"}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{config?.name ?? "Admin"}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Panel Admin
          </div>
        </div>
        <a href="/" style={{
          marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.8)",
          background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 6,
        }}>Ver app →</a>
      </div>

      {/* Config info */}
      {config && (
        <div style={{
          background: "#fff", borderRadius: 12, border: "0.5px solid #E2E6ED",
          padding: "1rem 1.125rem", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>
            Configuración del municipio
          </div>
          {[
            ["ID", config.id],
            ["Nombre", config.name],
            ["Municipio", `${config.municipality}, ${config.province}`],
            ["Color primario", config.primaryColor],
            ["Fuentes locales", config.sources.local.join(", ")],
            ["Fuentes regionales", config.sources.regional.join(", ")],
            ["Términos de búsqueda", config.searchTerms.join(", ")],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "#9CA3AF", minWidth: 130, flexShrink: 0 }}>{k}</span>
              <span style={{ color: "#374151", wordBreak: "break-word" }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{
        background: "#fff", borderRadius: 12, border: "0.5px solid #E2E6ED",
        padding: "1rem 1.125rem", marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>
          Acciones
        </div>

        <button onClick={bustCache} disabled={busting} style={{
          width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 13,
          fontWeight: 600, background: busting ? "#E5E7EB" : primary,
          color: busting ? "#9CA3AF" : "#fff", marginBottom: 8,
        }}>
          {busting ? "Actualizando…" : "↻ Forzar actualización del clipping"}
        </button>

        {status && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, fontSize: 13,
            background: status.startsWith("✅") ? "#F0FDF4" : "#FEF2F2",
            color: status.startsWith("✅") ? "#166534" : "#991B1B",
            border: `0.5px solid ${status.startsWith("✅") ? "#BBF7D0" : "#FECACA"}`,
          }}>
            {status}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        background: "#F8FAFC", borderRadius: 12, border: "0.5px solid #E2E6ED",
        padding: "1rem 1.125rem",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>
          Para agregar un nuevo municipio
        </div>
        <ol style={{ paddingLeft: 16, fontSize: 13, color: "#374151", lineHeight: 2 }}>
          <li>Editá <code style={{ background: "#E5E7EB", padding: "1px 5px", borderRadius: 4 }}>lib/tenants.ts</code></li>
          <li>Copiá el bloque de plantilla y completá los datos</li>
          <li>Hacé push al repo — Vercel despliega automáticamente</li>
          <li>Apuntá el subdominio DNS al proyecto de Vercel</li>
        </ol>
      </div>
    </div>
  );
}
