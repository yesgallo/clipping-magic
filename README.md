# 📰 Clipping Magic SaaS

App de clipping de noticias locales, multi-tenant, mobile-first.  
Stack: **Next.js 14 · Groq (LLM gratuito) · Vercel (deploy gratuito)**

---

## Deploy en 3 pasos

### Paso 1 — Fork y cloná el repo

```bash
# En GitHub: Fork este repo → luego:
git clone https://github.com/TU_USUARIO/clipping-magic-saas
cd clipping-magic-saas
```

### Paso 2 — Configurá las variables de entorno

```bash
cp .env.example .env.local
```

Editá `.env.local` con:
- `GROQ_API_KEY` — gratis en [console.groq.com](https://console.groq.com/keys)
- `BOLIVAR_ADMIN_PASSWORD` — la clave del panel admin

### Paso 3 — Deploy en Vercel

```bash
# Instalá Vercel CLI (una sola vez)
npm i -g vercel

# Deploy
vercel --prod
```

O importá directamente desde [vercel.com/new](https://vercel.com/new) → seleccioná el repo de GitHub.

En Vercel → Settings → Environment Variables: copiá las claves de `.env.local`.

---

## Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:3000?tenant=bolivar
# → http://localhost:3000/admin?tenant=bolivar
```

---

## Agregar un nuevo municipio

Ver [docs/CUSTOMIZE.md](docs/CUSTOMIZE.md) para instrucciones completas.

---

## Stack técnico

| Componente | Tecnología | Costo |
|---|---|---|
| Framework | Next.js 14 (App Router) | Gratuito |
| LLM | Groq — llama-3.3-70b | Gratuito (tier) |
| LLM fallback | OpenRouter — Mistral 7B | Gratuito (tier) |
| Hosting | Vercel | Gratuito |
| Cache | Vercel KV (opcional) | Gratuito (tier) |
| Scraping | Cheerio + fetch nativo | — |
| Fuentes | 12 portales bonaerenses | — |

---

## Funcionalidades

- **Modo general**: clipping automático con 10-20 noticias del día
- **Modo temático**: filtrado por tema (seguridad, salud, obras…)  
- **Modo URL**: análisis de una nota específica
- **Tópicos del día**: 5-7 tendencias detectadas automáticamente
- **Caché 24h**: no consume tokens si ya se generó hoy; actualización manual desde admin
- **Multi-tenant**: cada municipio tiene subdominio, colores e identidad propios
- **Panel admin**: `/admin` con auth básica para forzar actualización
- **Cron diario**: genera el clipping a las 7am automáticamente
- **Proxy scraping**: evita CORS, con fallback si el portal bloquea
