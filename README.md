# Plataforma Educativa - Frontend

> Plataforma educativa interactiva para el aprendizaje de programación con editor de texto enriquecido, consola de comandos y retroalimentación asistida por IA.

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Tecnologías Principales](#-tecnologías-principales)
- [Prerequisitos](#-prerequisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Comandos Disponibles](#-comandos-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Flujo de Desarrollo](#-flujo-de-desarrollo)
- [Deployment en Producción](#-deployment-en-producción)
  - [Vercel](#opción-1-vercel-recomendado)
  - [Netlify](#opción-2-netlify)
  - [Docker](#opción-3-docker)
  - [VPS/Servidor Propio](#opción-4-vpsservidor-propio)
- [CI/CD](#-cicd)
- [Optimizaciones de Producción](#-optimizaciones-de-producción)
- [Monitoreo y Observabilidad](#-monitoreo-y-observabilidad)
- [Seguridad](#-seguridad)
- [Documentación Técnica](#-documentación-técnica)
- [Troubleshooting](#-troubleshooting)
- [Notas Importantes](#-notas-importantes)

---

## 🎯 Descripción General

Plataforma educativa con editor de texto enriquecido (Tiptap), consola de comandos (Monaco), y retroalimentación por IA. Incluye roles de estudiante y administrador con gestión completa de guías, ejercicios y métricas de progreso.

---

## 🛠️ Stack Tecnológico

**Core**: Next.js 15 (App Router) · React 19 · TypeScript 5.7 · Tailwind CSS 4  
**Estado**: React Query 5.59 · Zustand 5 · Zod 3.25  
**Editores**: Tiptap 3.4 · Monaco Editor 0.52  
**UI**: Radix UI · Lucide Icons · react-hook-form  
**Auth**: Supabase 2.45  
**Dev Tools**: ESLint 9 · Prettier · Husky · lint-staged  

Ver `.DOCUMENTATION` para detalles completos de arquitectura.

---

## ✅ Prerequisitos

- **Node.js 20.x** - [Descargar](https://nodejs.org/)
- **pnpm ≥9** - `npm i -g pnpm` o `corepack enable`
- **Cuenta Supabase** - [Crear proyecto](https://supabase.com)
- **Backend API** - FastAPI corriendo (ver `BACKEND_ARCHITECTURE_FULL.md`)

---

## 📦 Instalación

```powershell
git clone <URL_DEL_REPOSITORIO>
cd frontend-proyecto-de-grado
pnpm install
```

⚠️ **Solo pnpm**: El proyecto rechaza npm/yarn en el script preinstall.

---

## ⚙️ Configuración

Crea `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1  # Producción: https://api.tudominio.com/api/v1
```

**Obtener credenciales Supabase**: Dashboard → Settings → API  
**Producción**: Configura estas variables en tu plataforma de hosting (Vercel, Netlify, etc.)

---

## 🚀 Comandos

```powershell
pnpm dev        # Desarrollo con Turbopack (http://localhost:3000)
pnpm build      # Build de producción
pnpm start      # Servidor producción (requiere build previo)
pnpm lint       # ESLint
pnpm typecheck  # Validación TypeScript
```

**Pre-commit hooks**: Husky ejecuta automáticamente Prettier + ESLint en cada commit.

---

## 📁 Estructura del Proyecto

```
src/
├── app/              # Next.js App Router (rutas y layouts)
│   ├── admin/        # Panel administración (CRUD guías, ejercicios, métricas)
│   ├── ejercicios/   # Vista estudiantes
│   ├── guias/        # Navegación de guías
│   └── api/          # API routes
├── features/        # Lógica por dominio (auth, exercises, guides, attempts, llm, progress)
├── shared/          # Código compartido (api, hooks, ui, providers, stores)
├── components/      # Componentes reutilizables (tiptap-ui, student, safe-html)
└── lib/             # Utilidades y helpers
```

**Arquitectura**: Features por dominio + shared code. Ver `FRONTEND_ARCHITECTURE.md` para detalles.

---

## 🔄 Flujo de Desarrollo

**Agregar endpoint**: Query key (`query-keys.ts`) → Función API (`api/*.ts`) → Hook (`hooks/use-*.ts`) → Componente  
**Agregar UI**: `pnpm dlx shadcn@latest add <component>` (se instala en `src/shared/ui/`)  
**Agregar ruta**: Crear `src/app/<ruta>/page.tsx`  
**Testing local**: Backend corriendo + `pnpm dev` + verificar consola del navegador

---

## 🚢 Deployment en Producción

### Checklist Pre-Deploy

✅ `pnpm build && pnpm start` exitoso localmente  
✅ Variables de entorno configuradas para producción  
✅ Backend API desplegado y accesible  
✅ Supabase configurado para producción

---

### Opción 1: Vercel (Recomendado)

**Ventajas**: Zero-config, CDN global, preview deployments, edge functions, SSL automático

**Deploy**:
1. [Importar repo](https://vercel.com/new) en Vercel Dashboard
2. Configurar variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   NEXT_PUBLIC_API_BASE  # https://api.tudominio.com/api/v1
   ```
3. Deploy automático

**CLI** (opcional):
```bash
npm i -g vercel
vercel login
vercel  # Sigue las instrucciones
```

**Custom domain**: Vercel Dashboard → Domains → Agregar dominio

---

### Opción 2: Netlify

1. [Importar repo](https://app.netlify.com/start) en Netlify
2. Build settings: `pnpm build` → `.next`
3. Agregar variables de entorno (mismo que Vercel)
4. Deploy

Netlify instala automáticamente el plugin Essential Next.js.

---

### Opción 3: Docker

**Dockerfile** (multi-stage):

```dockerfile
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**next.config.ts**: Agregar `output: 'standalone'`

**Build & Run**:
```bash
docker build -t plataforma-frontend \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg NEXT_PUBLIC_API_BASE=https://... .

docker run -p 3000:3000 plataforma-frontend
```

---

### Opción 4: VPS/Servidor Propio

**Stack**: Ubuntu 22.04 + Node 20 + pnpm + PM2 + Nginx + Let's Encrypt

**Setup rápido**:
```bash
# Instalar dependencias
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
npm i -g pnpm pm2

# Clonar y configurar
git clone <repo> /var/www/plataforma
cd /var/www/plataforma
pnpm install
pnpm build

# PM2
pm2 start npm --name "plataforma" -- start
pm2 save && pm2 startup

# Nginx (crear /etc/nginx/sites-available/plataforma)
upstream frontend { server 127.0.0.1:3000; }
server {
  listen 80;
  server_name tudominio.com;
  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

# Habilitar y SSL
sudo ln -s /etc/nginx/sites-available/plataforma /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
sudo certbot --nginx -d tudominio.com
```

**Deploy automático** (`deploy.sh`):
```bash
git pull && pnpm install --frozen-lockfile && pnpm build && pm2 restart plataforma
```

---

## 🔄 CI/CD

### GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_API_BASE: ${{ secrets.NEXT_PUBLIC_API_BASE }}
      # Deploy a Vercel/Netlify/tu servidor
```

**Secrets**: Configurar en GitHub repo → Settings → Secrets and variables → Actions

---

## ⚡ Optimizaciones de Producción

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Para Docker
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 días
  },
};
```

### Code Splitting & Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => <p>Cargando editor...</p>
});
```

### React Query Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min
      gcTime: 300_000,   // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Bundle Analyzer

```bash
pnpm add -D @next/bundle-analyzer
# ANALYZE=true pnpm build
```

**Objetivos Lighthouse**: Performance >90, Accessibility >95, Best Practices >95, SEO >90

---

## 📊 Monitoreo

### Error Tracking: Sentry

```bash
pnpm add @sentry/nextjs
# Ejecutar: npx @sentry/wizard@latest -i nextjs
```

### Analytics

**Vercel Analytics**:
```bash
pnpm add @vercel/analytics
# Agregar <Analytics /> en layout.tsx
```

**Google Analytics**:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google';
// <GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

### Uptime Monitoring

- **UptimeRobot** (gratuito): Monitorear frontend y backend API
- **Better Uptime**, **Pingdom**

### Logs

```bash
# PM2
pm2 logs plataforma --lines 100

# Docker
docker logs -f <container>

# Nginx
sudo tail -f /var/log/nginx/access.log
```

---

## 🔒 Seguridad

### Variables de Entorno

⚠️ **NUNCA expongas**: Service role keys, API secrets, tokens privados  
✅ **Solo exponer con `NEXT_PUBLIC_`**: URLs públicas, anon keys

### Security Headers (next.config.ts)

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { 
          key: 'Content-Security-Policy', 
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.tudominio.com"
        },
      ],
    }];
  },
};
```

### Sanitización HTML

Ya implementado con `rehype-sanitize` y `DOMPurify` en `safe-html.tsx`.

### Mantenimiento

```bash
pnpm audit           # Verificar vulnerabilidades
pnpm update --latest # Actualizar dependencias
```

### HTTPS Obligatorio

Configurar redirect en Nginx/Vercel/Netlify (configuración automática en la mayoría de plataformas).

### Backups

- Base de datos Supabase (Dashboard → Database → Backups)
- Variables de entorno (documentadas en 1Password/Vault)
- Código (Git + GitHub/GitLab)

---

## 📚 Documentación Técnica

**Interna**:  
`.DOCUMENTATION` · `FRONTEND_ARCHITECTURE.md` · `ENDPOINTS_README.md` · `BACKEND_ARCHITECTURE_FULL.md`

**Externa**:  
[Next.js](https://nextjs.org/docs) · [React Query](https://tanstack.com/query/latest) · [Tiptap](https://tiptap.dev/docs) · [Monaco Editor](https://microsoft.github.io/monaco-editor) · [Supabase](https://supabase.com/docs/reference/javascript)

---

## 🐛 Troubleshooting

### pnpm no reconocido
```powershell
npm i -g pnpm
# O: corepack enable
```

### "This project requires pnpm"
Estás usando npm/yarn. Usa solo `pnpm install`.

### Variables de entorno faltantes
1. Crear `.env.local`
2. Agregar las 3 variables (ver sección Configuración)
3. Reiniciar servidor

### No conecta con backend API
- Verificar backend corriendo: `curl http://localhost:8000/api/v1/health`
- Verificar `NEXT_PUBLIC_API_BASE` correcto
- Revisar logs del backend (CORS)

### Autenticación Supabase falla
- Verificar credenciales correctas en `.env.local`
- Usar `anon key` (NO `service_role`)
- Verificar proyecto Supabase activo

### Puerto 3000 ocupado
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
# O: $env:PORT=3001; pnpm dev
```

### Build falla (TypeScript)
```powershell
pnpm typecheck  # Ver errores específicos
# Corregir y volver a: pnpm build
```

### Hot reload no funciona
```powershell
Remove-Item -Recurse -Force .next
pnpm dev
```

---

## 📝 Notas Importantes

**Dependencias**:
- Solo pnpm (npm/yarn causarán errores)
- Node 20.x obligatorio
- React 19 (puede tener warnings de compatibilidad con libs antiguas)

**Variables de Entorno**:
- Prefijo `NEXT_PUBLIC_` obligatorio para exponer al navegador
- `.env.local` en `.gitignore` (no subir a Git)
- Documentar variables secretas en gestor seguro (1Password/Vault)

**Desarrollo**:
- Turbopack habilitado por defecto en dev
- React Query usa stale-while-revalidate
- Monaco/Tiptap tienen lazy loading (~1s primera carga)

**Producción**:
- Siempre ejecutar `pnpm build` local antes de desplegar
- Configurar variables en plataforma de hosting
- Optimizado para Vercel, compatible con cualquier host Next.js
- Pre-commit hooks: Prettier + ESLint automáticos

**Recursos**:
- Supabase Dashboard: Gestión usuarios/DB/storage
- Backend API: Ver `ENDPOINTS_README.md`
- Schema DB: `educational_platform_schema.sql`

---

**¡Feliz desarrollo! 🚀**


