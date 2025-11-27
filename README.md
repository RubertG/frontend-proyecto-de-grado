# Plataforma Educativa - Frontend

> Plataforma educativa interactiva para el aprendizaje de programación con editor de texto enriquecido, consola de comandos y retroalimentación asistida por IA.

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Deployment en Producción](#-deployment-en-producción)
- [CI/CD y Seguridad](#-cicd-y-seguridad)
- [Documentación Técnica](#-documentación-técnica)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Descripción General

Plataforma educativa con editor Tiptap, consola Monaco Editor, y retroalimentación por IA. Permite a estudiantes completar ejercicios interactivos y a administradores gestionar contenido y métricas.

**Características principales:**
- Editor WYSIWYG (Tiptap) y consola de código (Monaco)
- Autenticación con Supabase
- Gestión de guías y ejercicios
- Sistema de intentos y progreso
- Panel de administración completo

---

## 🛠️ Stack Tecnológico

- **Next.js 15** + React 19 + TypeScript
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui
- **Estado**: React Query 5, Zustand 5, Zod
- **Editores**: Tiptap 3.4, Monaco Editor
- **Auth**: Supabase
- **Dev Tools**: ESLint, Prettier, Husky

---

## ✅ Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

### 1. Node.js
- **Versión requerida**: `20.x` (LTS)
- Verificar versión:
  ```powershell
  node --version
  ```
- Descargar: [https://nodejs.org/](https://nodejs.org/)

### 2. pnpm
- **Versión mínima**: `9.0.0`
- Verificar versión:
  ```powershell
  pnpm --version
  ```
- Instalar globalmente:
  ```powershell
  npm install -g pnpm
  ```
- O usar Corepack (incluido en Node 16.13+):
  ```powershell
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

### 3. Cuenta de Supabase
- Crear proyecto en [https://supabase.com](https://supabase.com)
- Obtener:
  - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
  - **Anon/Public Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Backend API
- El backend debe estar corriendo en `http://localhost:8000` (por defecto)
- Ver `BACKEND_ARCHITECTURE_FULL.md` para instrucciones del backend
- Endpoints esperados: `/api/v1/guides`, `/api/v1/exercises`, `/api/v1/attempts`, etc.

### 5. Git
- Para clonar el repositorio y gestionar versiones

---

## 📦 Instalación

### Paso 1: Clonar el Repositorio
```powershell
git clone <URL_DEL_REPOSITORIO>
cd frontend-proyecto-de-grado
```

### Paso 2: Instalar Dependencias
```powershell
pnpm install
```

**⚠️ Importante**: Este proyecto **requiere pnpm**. Si intentas usar `npm` o `yarn`, el script `preinstall` detendrá la instalación.

### Paso 3: Verificar Instalación
```powershell
# Verificar que todas las dependencias se instalaron correctamente
pnpm list --depth=0
```

Deberías ver aproximadamente 54 dependencias principales instaladas.

---

## ⚙️ Configuración

### Variables de Entorno

El proyecto requiere 3 variables de entorno obligatorias. Crea un archivo `.env.local` en la raíz del proyecto:

```powershell
# Crear archivo de variables de entorno
New-Item .env.local
```

Agrega el siguiente contenido:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Backend API
NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
```

#### Dónde Obtener los Valores

1. **NEXT_PUBLIC_SUPABASE_URL**:
   - Dashboard de Supabase → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Dashboard de Supabase → Settings → API → Project API keys → `anon` `public`

3. **NEXT_PUBLIC_API_BASE**:
   - URL base del backend FastAPI (por defecto `http://localhost:8000/api/v1`)
   - Asegúrate de que incluya `/api/v1` al final

#### Validación de Variables

El proyecto validará automáticamente estas variables al iniciar. Si falta alguna, verás un error en la consola del navegador.

---

## 🚀 Comandos Disponibles

### Desarrollo

Inicia el servidor de desarrollo con **Turbopack** (compilación ultra rápida):

```powershell
pnpm dev
```

- Abre [http://localhost:3000](http://localhost:3000) en tu navegador
- Hot Module Replacement (HMR) habilitado
- La aplicación se recarga automáticamente al editar archivos

### Build de Producción

Compila la aplicación para producción:

```powershell
pnpm build
```

- Genera una build optimizada en `.next/`
- Realiza optimizaciones de Tree Shaking, Code Splitting, etc.
- Valida tipos de TypeScript automáticamente

### Iniciar Build de Producción

Ejecuta el servidor en modo producción (requiere build previo):

```powershell
pnpm start
```

- Sirve la build de `.next/`
- Corre en [http://localhost:3000](http://localhost:3000)

### Linting y Code Quality

Ejecuta ESLint para detectar problemas:

```powershell
pnpm lint
```

- Analiza todos los archivos `.ts`, `.tsx`, `.js`, `.jsx`
- Reporta errores y warnings
- Configuración en `eslint.config.mjs`

### Type Checking

Valida tipos de TypeScript sin compilar:

```powershell
pnpm typecheck
```

- Ejecuta `tsc --noEmit`
- Útil para CI/CD pipelines
- Detecta errores de tipos sin generar archivos

### Pre-commit Hooks

El proyecto usa **Husky** y **lint-staged** para ejecutar automáticamente:
- Prettier (formateo)
- ESLint (linting)

Al hacer `git commit`, estos checks se ejecutan automáticamente en los archivos staged.

---

## 📁 Estructura del Proyecto

```
frontend-proyecto-de-grado/
├── public/                          # Archivos estáticos (favicon, imágenes)
├── src/
│   ├── app/                         # Next.js App Router (rutas y layouts)
│   │   ├── admin/                   # Panel de administración
│   │   │   ├── exercises/           # CRUD de ejercicios
│   │   │   ├── guides/              # CRUD de guías
│   │   │   ├── attempts/            # Vista de intentos
│   │   │   ├── llm-status/          # Monitor del sistema LLM
│   │   │   └── metrics/             # Métricas y analytics
│   │   ├── autenticacion/           # Flujos de login/registro
│   │   ├── ejercicios/              # Vista de ejercicios para estudiantes
│   │   ├── guias/                   # Vista de guías para estudiantes
│   │   ├── progreso/                # Dashboard de progreso
│   │   └── api/                     # API routes (auth, webhooks, etc.)
│   │
│   ├── components/                  # Componentes compartidos
│   │   ├── tiptap-ui/               # Componentes del editor Tiptap
│   │   ├── tiptap-icons/            # Iconos personalizados del editor
│   │   ├── student/                 # Componentes específicos de estudiantes
│   │   └── safe-html.tsx            # Componente de sanitización HTML
│   │
│   ├── features/                    # Features organizados por dominio
│   │   ├── auth/                    # Autenticación (hooks, componentes)
│   │   ├── exercises/               # Lógica de ejercicios
│   │   ├── guides/                  # Lógica de guías
│   │   ├── attempts/                # Gestión de intentos
│   │   ├── llm/                     # Integración con LLM
│   │   ├── metrics/                 # Analytics y métricas
│   │   └── progress/                # Tracking de progreso
│   │
│   ├── shared/                      # Código compartido entre features
│   │   ├── api/                     # Cliente HTTP y query keys
│   │   ├── auth/                    # Utilidades de autenticación
│   │   ├── config/                  # Configuración global
│   │   ├── hooks/                   # Custom hooks compartidos
│   │   ├── lib/                     # Utilidades y helpers
│   │   ├── providers/               # Context providers (React Query, Auth)
│   │   ├── stores/                  # Zustand stores
│   │   ├── supabase/                # Configuración de Supabase
│   │   └── ui/                      # UI components de shadcn/ui
│   │
│   ├── hooks/                       # Hooks reutilizables
│   ├── lib/                         # Utilidades (sanitize-html, tiptap-utils)
│   ├── styles/                      # Estilos globales y variables SCSS
│   └── types/                       # Type definitions globales
│
├── .DOCUMENTATION                   # Documentación técnica completa
├── FRONTEND_ARCHITECTURE.md         # Arquitectura del frontend
├── ENDPOINTS_README.md              # Documentación de endpoints
├── BACKEND_ARCHITECTURE_FULL.md     # Arquitectura del backend
├── educational_platform_schema.sql  # Schema de base de datos
├── components.json                  # Configuración de shadcn/ui
├── next.config.ts                   # Configuración de Next.js
├── tailwind.config.ts               # Configuración de Tailwind
├── tsconfig.json                    # Configuración de TypeScript
├── eslint.config.mjs                # Configuración de ESLint
└── package.json                     # Dependencias y scripts
```

### Arquitectura de Carpetas

- **`app/`**: Rutas definidas por el sistema de archivos de Next.js (App Router)
- **`features/`**: Código organizado por dominio (exercises, guides, attempts, etc.)
- **`shared/`**: Código compartido entre múltiples features (API client, hooks, UI)
- **`components/`**: Componentes reutilizables no específicos de un feature
- **`hooks/`**: Custom hooks generales
- **`lib/`**: Utilidades y funciones helper
- **`styles/`**: Estilos SCSS globales y variables CSS

---

## 🔄 Flujo de Desarrollo

### 1. Crear una Nueva Feature

```powershell
# Ejemplo: Crear feature de "notifications"
mkdir src/features/notifications
mkdir src/features/notifications/api
mkdir src/features/notifications/hooks
mkdir src/features/notifications/components
```

### 2. Agregar un Nuevo Endpoint

1. Definir el query key en `src/shared/api/query-keys.ts`
2. Crear la función API en `src/features/<feature>/api/<feature>-api.ts`
3. Crear el hook en `src/features/<feature>/hooks/use-<feature>.ts`
4. Usar el hook en componentes

### 3. Crear un Nuevo Componente UI

```powershell
# Usando shadcn/ui CLI
pnpm dlx shadcn@latest add button
```

Los componentes se instalan en `src/shared/ui/`.

### 4. Agregar una Nueva Ruta

Crear archivo en `src/app/<ruta>/page.tsx`:

```tsx
export default function MiPagina() {
  return <div>Contenido</div>;
}
```

### 5. Testing Local

1. Asegúrate de que el backend esté corriendo
2. Ejecuta `pnpm dev`
3. Navega a `http://localhost:3000`
4. Revisa la consola del navegador para errores

---

## 🚢 Deployment en Producción

Esta sección cubre cómo desplegar la aplicación en diferentes plataformas de producción.

### Prerequisitos de Producción

Antes de desplegar, asegúrate de:

1. ✅ **Build exitoso localmente**:
   ```powershell
   pnpm build
   pnpm start
   ```

2. ✅ **Variables de entorno configuradas** para producción

3. ✅ **Backend API desplegado** y accesible

4. ✅ **Base de datos Supabase** configurada para producción

5. ✅ **Tests pasando** (si los tienes implementados)

---

### Opción 1: Vercel (Recomendado)

Vercel es la plataforma nativa de Next.js y ofrece la mejor experiencia de deployment.

#### Ventajas
- ✅ Zero-config deployment
- ✅ CDN global automático
- ✅ Preview deployments por cada PR
- ✅ Edge Functions
- ✅ Analíticas integradas
- ✅ SSL automático

#### Pasos de Deployment

**1. Conectar Repositorio**

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Login
vercel login

# Deploy desde la línea de comandos
vercel
```

O desde el dashboard:
1. Ir a [https://vercel.com/new](https://vercel.com/new)
2. Importar repositorio de Git (GitHub/GitLab/Bitbucket)
3. Seleccionar el proyecto

**2. Configurar Variables de Entorno**

En el dashboard de Vercel:
- Settings → Environment Variables
- Agregar:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-produccion
  NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1
  ```

**3. Configurar Build Settings**

Vercel detecta automáticamente Next.js, pero puedes ajustar:
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node Version**: `20.x`

**4. Deploy**

- Click en "Deploy"
- Vercel ejecuta el build automáticamente
- Tu app estará disponible en `https://tu-app.vercel.app`

#### Configuración Avanzada

**Custom Domain**:
```bash
# En Vercel Dashboard → Domains
# Agregar tu dominio personalizado
# Configurar DNS records según las instrucciones
```

**Edge Functions** (opcional):
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Habilitar edge runtime para ciertas rutas
  experimental: {
    runtime: 'edge',
  },
};
```

**Rewrite para Backend**:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://api.tudominio.com/api/v1/:path*',
      },
    ];
  },
};
```

---

### Opción 2: Netlify

Alternativa popular con excelente soporte para Next.js.

#### Pasos de Deployment

**1. Conectar Repositorio**

1. Ir a [https://app.netlify.com/start](https://app.netlify.com/start)
2. Conectar con Git provider
3. Seleccionar repositorio

**2. Configurar Build**

- **Build Command**: `pnpm build`
- **Publish Directory**: `.next`
- **Base Directory**: (vacío)

**3. Variables de Entorno**

Site settings → Environment variables → Add variables:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_BASE=...
```

**4. Essential Next.js Plugin**

Netlify instalará automáticamente el plugin de Next.js. Verifica en:
- Plugins → Essential Next.js

**5. Deploy**

Click "Deploy site" - La primera build puede tardar 3-5 minutos.

#### netlify.toml (Opcional)

Crea `netlify.toml` en la raíz:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--version" # Force pnpm

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

### Opción 3: Docker

Para deployments en containers o Kubernetes.

#### Dockerfile

Crea `Dockerfile` en la raíz:

```dockerfile
# Etapa 1: Dependencias
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Etapa 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

RUN pnpm build

# Etapa 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### .dockerignore

```
node_modules
.next
.git
.env*.local
*.md
.vscode
.idea
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        NEXT_PUBLIC_API_BASE: ${NEXT_PUBLIC_API_BASE}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### Comandos Docker

```bash
# Build
docker build -t frontend-plataforma-educativa .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e NEXT_PUBLIC_API_BASE=https://... \
  frontend-plataforma-educativa

# Con docker-compose
docker-compose up -d
```

#### next.config.ts para Docker

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Habilita output standalone para Docker
};
```

---

### Opción 4: VPS/Servidor Propio

Para deployment en servidores Linux (Ubuntu/Debian).

#### Prerequisitos del Servidor

- Ubuntu 22.04 LTS o superior
- Node.js 20.x
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL/TLS (Let's Encrypt)

#### Pasos de Deployment

**1. Instalar Dependencias en el Servidor**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2
npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

**2. Clonar y Configurar Proyecto**

```bash
# Crear usuario para la app
sudo useradd -m -s /bin/bash plataforma
sudo su - plataforma

# Clonar repositorio
git clone <URL_REPO> /home/plataforma/frontend
cd /home/plataforma/frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
nano .env.local
# Agregar NEXT_PUBLIC_SUPABASE_URL, etc.

# Build
pnpm build
```

**3. Configurar PM2**

Crear `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'plataforma-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/plataforma/frontend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

Iniciar con PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

**4. Configurar Nginx**

```bash
sudo nano /etc/nginx/sites-available/plataforma
```

Agregar configuración:

```nginx
upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://frontend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://frontend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Habilitar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/plataforma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**5. Configurar SSL con Let's Encrypt**

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot configurará automáticamente HTTPS y renovación.

**6. Script de Deploy Automático**

Crear `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deployment..."

# Pull latest changes
git pull origin main

# Instalar dependencias
pnpm install --frozen-lockfile

# Build
pnpm build

# Restart PM2
pm2 restart plataforma-frontend

echo "✅ Deployment completado!"
```

Hacer ejecutable:

```bash
chmod +x deploy.sh
```

---

## 🔄 CI/CD

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck

  build:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_API_BASE: ${{ secrets.NEXT_PUBLIC_API_BASE }}
        run: pnpm build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next
          retention-days: 7

  deploy-vercel:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI/CD

Crear `.gitlab-ci.yml`:

```yaml
stages:
  - lint
  - build
  - deploy

variables:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

.node-template: &node-template
  image: node:${NODE_VERSION}
  before_script:
    - corepack enable
    - corepack prepare pnpm@${PNPM_VERSION} --activate
    - pnpm install --frozen-lockfile

lint:
  <<: *node-template
  stage: lint
  script:
    - pnpm lint
    - pnpm typecheck

build:
  <<: *node-template
  stage: build
  script:
    - pnpm build
  artifacts:
    paths:
      - .next/
    expire_in: 1 week

deploy:production:
  <<: *node-template
  stage: deploy
  only:
    - main
  script:
    - echo "Deploying to production..."
    # Agregar comandos de deploy específicos
  environment:
    name: production
    url: https://tudominio.com
```

---

## ⚡ Optimizaciones de Producción

### 1. Optimización de Imágenes

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },
};
```

### 2. Compression

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  compress: true, // Gzip habilitado por defecto
};
```

### 3. Bundle Analyzer

```bash
# Instalar
pnpm add -D @next/bundle-analyzer

# Configurar en next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Analizar
ANALYZE=true pnpm build
```

### 4. React Query Optimizations

```typescript
// src/shared/providers/react-query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Desactivar en producción si no es necesario
    },
  },
});
```

### 5. Code Splitting

Next.js hace code splitting automáticamente, pero puedes optimizar con dynamic imports:

```typescript
import dynamic from 'next/dynamic';

// Carga lazy de componentes pesados
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => <p>Cargando editor...</p>,
  }
);

const TiptapEditor = dynamic(
  () => import('@/components/tiptap-ui/tiptap-editor'),
  { ssr: false }
);
```

### 6. Caching Headers

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 7. Lighthouse Score

Objetivo para producción:
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

Verificar con:
```bash
npx lighthouse https://tudominio.com --view
```

---

## 📊 Monitoreo y Observabilidad

### 1. Vercel Analytics

Si usas Vercel:

```bash
pnpm add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Sentry (Error Tracking)

```bash
pnpm add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
```

### 3. Google Analytics / Plausible

```bash
pnpm add @next/third-parties
```

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  );
}
```

### 4. Uptime Monitoring

Servicios recomendados:
- **UptimeRobot** (gratuito hasta 50 monitores)
- **Pingdom**
- **Better Uptime**

Endpoints a monitorear:
- `https://tudominio.com` (frontend)
- `https://api.tudominio.com/health` (backend)

### 5. Logs

Para VPS/Docker, usar journalctl o Docker logs:

```bash
# PM2 logs
pm2 logs plataforma-frontend --lines 100

# Docker logs
docker logs -f <container_id>

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🔒 Seguridad

### 1. Variables de Entorno

**⚠️ NUNCA expongas**:
- Service role keys de Supabase
- API keys privadas
- Secrets de OAuth
- Tokens de CI/CD

**✅ Solo expón con `NEXT_PUBLIC_`**:
- URLs públicas (Supabase URL)
- Anon keys (Supabase anon key)
- API base URL del backend

### 2. Content Security Policy (CSP)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.tudominio.com",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting

Para API routes en Next.js:

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Uso en API route
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  try {
    await limiter.check(10, request.headers.get('x-forwarded-for') ?? 'anonymous');
    // ... tu lógica
  } catch {
    return new Response('Rate limit exceeded', { status: 429 });
  }
}
```

### 4. Sanitización HTML

Ya implementado con `rehype-sanitize` y `DOMPurify`:

```typescript
// components/safe-html.tsx
import DOMPurify from 'isomorphic-dompurify';

export function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
    ALLOWED_ATTR: ['class'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### 5. Dependencias

Mantén las dependencias actualizadas:

```bash
# Verificar vulnerabilidades
pnpm audit

# Actualizar dependencias
pnpm update --latest

# Verificar actualizaciones de seguridad
pnpm audit fix
```

### 6. HTTPS Obligatorio

En Nginx:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}
```

### 7. Backup Regular

Automatiza backups de:
- Base de datos Supabase (via Dashboard o CLI)
- Variables de entorno
- Configuraciones de Nginx/servidor
- Código fuente (Git)

---

## 📚 Documentación Técnica

Para entender en profundidad cómo funciona la plataforma, consulta:

### Documentación Interna
- **`.DOCUMENTATION`**: Documentación técnica completa del proyecto
  - Stack tecnológico detallado
  - Arquitectura y estructura
  - Explicación de features principales (Tiptap, Monaco, LLM)
  - Flujos de datos y endpoints
  - FAQ técnico

- **`FRONTEND_ARCHITECTURE.md`**: Arquitectura específica del frontend
- **`ENDPOINTS_README.md`**: Documentación de endpoints del backend
- **`BACKEND_ARCHITECTURE_FULL.md`**: Arquitectura completa del backend

### Documentación Externa
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tiptap Documentation](https://tiptap.dev/docs/editor/introduction)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/docs.html)
- [React Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🐛 Troubleshooting

### Error: "pnpm no está reconocido como comando"

**Solución**:
```powershell
npm install -g pnpm
```

O habilita Corepack:
```powershell
corepack enable
```

---

### Error: "This project requires pnpm"

**Causa**: Estás intentando usar `npm` o `yarn`.

**Solución**: Usa solo `pnpm`:
```powershell
pnpm install
```

---

### Error: "Missing environment variables"

**Causa**: No se encontró `.env.local` o faltan variables.

**Solución**:
1. Crea `.env.local` en la raíz del proyecto
2. Agrega las 3 variables requeridas:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_API_BASE=...
   ```
3. Reinicia el servidor de desarrollo

---

### Error: "Cannot connect to backend API"

**Síntomas**: Errores de red en la consola, endpoints devuelven 404.

**Solución**:
1. Verifica que el backend esté corriendo:
   ```powershell
   curl http://localhost:8000/api/v1/health
   ```
2. Verifica que `NEXT_PUBLIC_API_BASE` apunte al backend correcto
3. Revisa logs del backend para errores CORS

---

### Error: "Supabase authentication failed"

**Solución**:
1. Verifica que las credenciales de Supabase sean correctas
2. Revisa que el proyecto de Supabase esté activo
3. Comprueba que la URL no tenga espacios o caracteres extra
4. Verifica que la `anon key` sea la pública (no la `service_role` key)

---

### Puerto 3000 ya está en uso

**Síntomas**: Error al ejecutar `pnpm dev`.

**Solución**:
```powershell
# Opción 1: Matar el proceso en el puerto 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Opción 2: Usar otro puerto
$env:PORT=3001; pnpm dev
```

---

### Build falla con errores de TypeScript

**Solución**:
```powershell
# Verificar tipos manualmente
pnpm typecheck

# Revisar archivos con errores y corregir
# Luego ejecutar build nuevamente
pnpm build
```

---

### Hot Reload no funciona

**Solución**:
1. Detén el servidor (`Ctrl+C`)
2. Elimina `.next/`:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
3. Reinicia:
   ```powershell
   pnpm dev
   ```

---

### Estilos de Tailwind no se aplican

**Solución**:
1. Verifica que `tailwind.config.ts` incluya tus archivos en `content`
2. Reinicia el servidor de desarrollo
3. Revisa que no haya errores en la consola del navegador
4. Asegúrate de que `globals.css` importe Tailwind:
   ```css
   @import "tailwindcss";
   ```

---

## 📝 Notas Importantes

### Dependencias Clave

- **No uses `npm` o `yarn`**: El proyecto está configurado específicamente para `pnpm`. Usar otro gestor puede causar problemas de versionado.

- **Node 20.x requerido**: Versiones anteriores o posteriores pueden tener incompatibilidades.

- **React 19**: Esta es una versión nueva. Algunas librerías de terceros pueden tener warnings de compatibilidad.

### Variables de Entorno

- Todas las variables del frontend deben comenzar con `NEXT_PUBLIC_` para estar disponibles en el navegador.
- Nunca expongas API keys secretas con `NEXT_PUBLIC_`.
- El archivo `.env.local` NO se sube a Git (está en `.gitignore`).

### Desarrollo

- El proyecto usa **Turbopack** en desarrollo para builds ultra rápidas.
- Los hooks de React Query usan **stale-while-revalidate** por defecto.
- El editor Tiptap puede tardar ~1s en cargar la primera vez (carga lazy de extensiones).

### Producción

- Antes de desplegar, siempre ejecuta `pnpm build` localmente para verificar errores.
- Asegúrate de configurar las variables de entorno en tu plataforma de hosting.
- El proyecto está optimizado para Vercel, pero puede desplegarse en cualquier plataforma compatible con Next.js.

### Git Hooks

- **Pre-commit**: Ejecuta lint-staged (Prettier + ESLint en archivos staged).
- Si el commit falla, revisa los errores de linting y corrígelos antes de reintentar.

### Recursos Adicionales

- **Supabase Dashboard**: Gestión de usuarios, almacenamiento y base de datos
- **Backend API**: Consulta `ENDPOINTS_README.md` para la documentación completa de endpoints
- **Schema de DB**: Ver `educational_platform_schema.sql` para la estructura de la base de datos

---

## 🤝 Contribución

1. Crea una rama para tu feature:
   ```powershell
   git checkout -b feature/mi-feature
   ```

2. Realiza tus cambios y commits:
   ```powershell
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. Push a la rama:
   ```powershell
   git push origin feature/mi-feature
   ```

4. Crea un Pull Request en GitHub/GitLab


