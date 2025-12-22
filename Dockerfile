# Multi-stage build optimizado para Next.js 15 con Turbopack
# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Habilitar pnpm y copiar archivos de lock
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (solo production)
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Habilitar pnpm
RUN corepack enable pnpm

# Copiar todos los archivos del proyecto
COPY package.json pnpm-lock.yaml ./
COPY src ./src
COPY public ./public
COPY next.config.ts tsconfig.json ./
COPY postcss.config.mjs tailwind.config.ts ./
COPY middleware.ts ./
COPY .env.example ./.env.local

# Instalar todas las dependencias (incluyendo dev para build)
RUN pnpm install --frozen-lockfile

# Build de la aplicación
RUN pnpm run build

# Stage 3: Runner (Producción)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar archivos necesarios del stage de deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos de configuración
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node_modules/.bin/next", "start"]
