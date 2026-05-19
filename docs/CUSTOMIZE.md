# docs/CUSTOMIZE.md — Cómo agregar un nuevo municipio cliente

## Estructura del proyecto

```
clipping-magic-saas/
├── app/
│   ├── api/
│   │   ├── clip/route.ts      ← Endpoint principal: scraping + LLM + cache
│   │   ├── scrape/route.ts    ← Proxy de scraping (evita CORS)
│   │   └── config/route.ts    ← Config pública del tenant
│   ├── admin/page.tsx         ← Panel de administración
│   ├── page.tsx               ← App mobile-first
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── tenants.ts             ← ⭐ AQUÍ se configuran los municipios
│   ├── types.ts               ← Tipos y categorías
│   ├── scraper.ts             ← Proxy de scraping con cheerio
│   ├── llm.ts                 ← Integración Groq + OpenRouter
│   └── cache.ts               ← Cache 24h (memoria o Vercel KV)
├── docs/
│   └── CUSTOMIZE.md           ← Este archivo
├── .env.example
├── vercel.json                ← Cron diario 7am + timeouts
├── next.config.js
└── package.json
```

---

## Agregar un nuevo municipio (5 minutos)

### 1. Editá `lib/tenants.ts`

Encontrá el bloque comentado `// TEMPLATE` y descomentalo:

```typescript
olavarria: {
  id: "olavarria",
  name: "Olavarría",
  municipality: "Olavarría",
  province: "Buenos Aires",
  logoText: "O",
  primaryColor: "#2D5016",      // ← Color institucional del municipio
  secondaryColor: "#5A8A30",
  accentColor: "#C5E8A0",
  sources: {
    local: [
      "elpopular.com.ar",
      "infolavarria.com",
    ],
    regional: [
      "septimaseccion.com.ar",
      "infocielo.com",
      "lapoliticaonline.com",
    ],
    national: ["infocampo.com.ar"],
  },
  searchTerms: [
    "Olavarría Buenos Aires",
    "intendente Wesner",
  ],
  adminPassword: process.env.OLAVARRIA_ADMIN_PASSWORD || "admin123",
},
```

### 2. Agregá la variable de entorno

En Vercel → Settings → Environment Variables:
```
OLAVARRIA_ADMIN_PASSWORD = tupassword
```

### 3. Configurá el subdominio

En tu DNS (Cloudflare, etc.):
```
olavarria.tudominio.com  →  CNAME  →  cname.vercel-dns.com
```

En Vercel → Domains → Add Domain:
```
olavarria.tudominio.com
```

### 4. Push y deploy

```bash
git add lib/tenants.ts
git commit -m "feat: add olavarria tenant"
git push
```

Vercel despliega automáticamente en ~30 segundos.

---

## Acceso a cada cliente

| Cliente | URL | Admin |
|---|---|---|
| Bolívar | `bolivar.tudominio.com` | `/admin?tenant=bolivar` |
| Olavarría | `olavarria.tudominio.com` | `/admin?tenant=olavarria` |
| Dev local | `localhost:3000?tenant=bolivar` | `localhost:3000/admin?tenant=bolivar` |

---

## Fuentes de portales: cómo elegirlas

Para cada nuevo municipio, buscar:

**Locales (tier 1):**
- Googlear: `"[municipio]" noticias portal OR diario`
- Verificar que tengan artículos recientes y estén indexados

**Regionales (tier 2):**
- `septimaseccion.com.ar` — cubre todo el interior bonaerense
- `infocielo.com` — provincia de Buenos Aires
- `lapoliticaonline.com` — política provincial
- `latecla.info` — interior bonaerense

**Nacional agro:**
- `infocampo.com.ar` — economía rural (útil para municipios agropecuarios)

---

## Variables de entorno completas

```env
# LLM
GROQ_API_KEY=gsk_xxxx

# Fallback LLM
OPENROUTER_API_KEY=sk-or-xxxx

# Cache (opcional)
KV_REST_API_URL=https://xxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxxx

# Admin passwords (una por tenant)
BOLIVAR_ADMIN_PASSWORD=xxxx
OLAVARRIA_ADMIN_PASSWORD=xxxx
```

---

## Cron automático

`vercel.json` incluye un cron que dispara el clipping a las 7am todos los días:

```json
{
  "crons": [{ "path": "/api/clip?cron=1", "schedule": "0 7 * * *" }]
}
```

El cron usa el tenant por defecto (`bolivar`). Para múltiples tenants, crear un endpoint
`/api/cron/route.ts` que llame a todos los tenants en paralelo.

---

## Customizar categorías

Editá `lib/types.ts` → array `CATEGORIES` y objeto `CATEGORY_STYLES`.
Las categorías se propagan automáticamente al system prompt del LLM.
