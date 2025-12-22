# 📦 Guía de Instalación y Deployment

Esta guía cubre todas las formas de instalar y desplegar la plataforma educativa frontend.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Opción 1: Vercel (Recomendado - Sin Servidor)](#-opción-1-vercel-recomendado---sin-servidor)
3. [Opción 2: Servidor Propio (VPS/Dedicado)](#-opción-2-servidor-propio-vpsdedicado)
4. [Opción 3: Docker (Local o Servidor)](#-opción-3-docker-local-o-servidor)
5. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
6. [Verificación post-instalación](#-verificación-post-instalación)
7. [Troubleshooting](#-troubleshooting)

---

## ✅ Requisitos Previos

### Para Todas las Opciones

- **Cuenta Supabase** activa (para autenticación y BD)
  - Crear en [supabase.com](https://supabase.com)
  - Obtener: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  
- **Backend API** desplegado y corriendo
  - FastAPI en servidor propio, Railway, Render, etc.
  - URL accesible: `https://api.tudominio.com/api/v1`

- **Variables de entorno** (ver sección más abajo)

---

## 🚀 Opción 1: Vercel (Recomendado - Sin Servidor)

### Ventajas

✅ **Zero-config deployment**: Push a Git y despliega automáticamente  
✅ **Escalado automático**: Maneja traffic picos sin configuración  
✅ **CDN global**: Servido desde ~280 data centers  
✅ **Preview deployments**: Cada PR genera URL de vista previa  
✅ **Free tier generoso**: Suficiente para desarrollo/testing  
✅ **Analytics y monitoring** incluidos  

### Pasos

#### 1. Preparar el Repositorio

```bash
# Asegurarse de estar en la rama main
git checkout main
git pull origin main

# Verificar que todo compila localmente
pnpm install
pnpm build
pnpm typecheck
```

#### 2. Conectar GitHub a Vercel

1. Ir a [vercel.com](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Seleccionar repositorio GitHub
4. Autorizar Vercel en GitHub (si es primera vez)
5. Seleccionar el repositorio `frontend-proyecto-de-grado`

#### 3. Configurar Variables de Entorno

En el formulario de importación:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1
```

O después, en **Settings** → **Environment Variables**

#### 4. Configurar Build

Vercel detecta automáticamente Next.js. Configuración por defecto:

- **Framework**: Next.js (detectado)
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next` (automático)
- **Install Command**: `pnpm install`

✅ Sin cambios necesarios - listo para desplegar.

#### 5. Deploy

Click en **"Deploy"** y esperar ~2-3 minutos.

**URL**: `https://frontend-proyecto-de-grado.vercel.app`

### Post-Deploy en Vercel

#### Preview Deployments (Pull Requests)

Cada PR automáticamente genera:
- URL única de vista previa
- Acceso desde GitHub PR
- Automáticamente deleteable

#### Production Branch Protection

En **Settings** → **Production**:
- Requiere revisión de PRs
- Solo puede deployar desde `main`

#### Analytics

En **Analytics** puedes ver:
- Traffic en tiempo real
- Performance por región
- Errores y excepciones
- Core Web Vitals

#### Logs

En **Logs** → **Deployment Logs**:
```
build: [10/22 02:15] npm installing pnpm@9.14.4
build: [14/22 02:20] running "pnpm run build"
runtime: 2025-12-22T10:45:32.123Z | GET /ejercicios 200
```

### Rollback en Vercel

Si necesitas revertir a un deploy anterior:

1. Ir a **Deployments**
2. Encontrar el deployment anterior
3. Click en los 3 puntos → **Promote to Production**

### Monitoring en Producción

```bash
# Ver logs en tiempo real
vercel logs

# Listar deployments
vercel list

# Información del proyecto
vercel inspect
```

---

## 🖥️ Opción 2: Servidor Propio (VPS/Dedicado)

### Ventajas

✅ Control total sobre infraestructura  
✅ Costos predecibles (plan fijo)  
✅ Sin vendor lock-in  
✅ Posibilidad de instalar software personalizado  

### Desventajas

❌ Necesitas mantener el servidor  
❌ Escalado manual  
❌ Respaldos y seguridad manual  

### Proveedores Recomendados

- **DigitalOcean**: $5/mes (Droplet compartido)
- **Linode**: $5/mes (Nanode)
- **Vultr**: $2.50/mes (Cloud Compute)
- **AWS Lightsail**: $3.50/mes (Virtual Private Server)

### Pasos

#### 1. Crear VPS

Ejemplo con DigitalOcean:

1. Crear Droplet
2. OS: **Ubuntu 22.04 LTS**
3. Tamaño: **$5/mes** (1 CPU, 1 GB RAM) - suficiente
4. Región: Cercana a tus usuarios
5. Autenticación: **SSH key** (no password)

#### 2. Conectar y Actualizar Sistema

```bash
# Conectar por SSH
ssh root@tu-ip-del-servidor

# Actualizar paquetes
apt update && apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Instalar pnpm
corepack enable pnpm

# Instalar git
apt install -y git
```

#### 3. Clonar y Instalar Proyecto

```bash
# Como usuario no-root (crearlo primero si es necesario)
sudo useradd -m -s /bin/bash appuser
su - appuser

# Clonar repositorio
git clone https://github.com/tu-usuario/frontend-proyecto-de-grado.git
cd frontend-proyecto-de-grado

# Instalar dependencias
pnpm install

# Crear .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1
EOF

# Build
pnpm run build
```

#### 4. Instalar Nginx (Reverse Proxy)

```bash
# Como root
sudo su

# Instalar nginx
apt install -y nginx

# Crear configuración
cat > /etc/nginx/sites-available/default << 'EOF'
upstream next_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirect HTTP a HTTPS (opcional, si usas SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://next_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activar configuración
systemctl restart nginx
```

#### 5. Configurar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Como appuser, crear ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'next-app',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/appuser/frontend-proyecto-de-grado',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '512M',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Ver logs
pm2 logs next-app
```

#### 6. Certificado SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado gratuito (Let's Encrypt)
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### 7. Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver status
sudo ufw status
```

### Mantenimiento

#### Updates Automáticos

```bash
# Editar crontab
sudo crontab -e

# Agregar línea
0 2 * * 0 cd /home/appuser/frontend-proyecto-de-grado && git pull && pnpm install && pnpm run build && pm2 restart next-app
```

#### Monitoreo

```bash
# Ver estado en tiempo real
pm2 monit

# Logs persistentes
pm2 logs next-app --lines 100

# Reinicios automáticos
pm2 set max-memory-restart 512M
```

#### Backups

```bash
# Backup diario de la aplicación
0 3 * * * tar -czf /backups/app-$(date +\%Y\%m\%d).tar.gz /home/appuser/frontend-proyecto-de-grado
```

---

## 🐳 Opción 3: Docker (Local o Servidor)

### Ventajas

✅ Consistencia entre desarrollo y producción  
✅ Fácil scaling con orquestación (K8s, Docker Swarm)  
✅ Aislamiento de aplicación  
✅ Reproducible en cualquier servidor  
✅ CI/CD simplificado  

### Requisitos

- **Docker** instalado (versión 20.10+)
- **Docker Compose** (versión 2.0+) - opcional pero recomendado

### 1. Instalar Docker

#### En Windows/Mac

1. Descargar [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Instalar y ejecutar
3. Verificar: `docker --version`

#### En Linux (Ubuntu/Debian)

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

### 2. Buildear Imagen Docker

#### Opción A: Con Docker Compose (Recomendado)

```bash
# En la raíz del proyecto
docker-compose build

# Agregar variables de entorno
cat > .env << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1
NODE_ENV=production
EOF

# Ejecutar contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Para (preserva contenedor)
docker-compose stop

# Reinicia
docker-compose restart

# Detiene y elimina
docker-compose down
```

#### Opción B: Con Docker Directo

```bash
# Build
docker build -t frontend-proyecto-de-grado:latest .

# Run
docker run -d \
  --name next-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... \
  -e NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1 \
  frontend-proyecto-de-grado:latest

# Ver logs
docker logs -f next-app

# Parar
docker stop next-app

# Iniciar nuevamente
docker start next-app

# Eliminar
docker rm next-app
```

### 3. Ejecutar en Servidor

#### Opción A: DigitalOcean App Platform

1. Conectar repositorio GitHub
2. Vercel detecta `docker-compose.yml` automáticamente
3. Click Deploy
4. Tu app en `tu-app.ondigitalocean.app`

#### Opción B: Servidor Propio + Docker

```bash
# 1. En tu VPS con Docker instalado
ssh root@tu-ip-servidor

# 2. Clonar proyecto
git clone https://github.com/tu-usuario/frontend-proyecto-de-grado.git
cd frontend-proyecto-de-grado

# 3. Crear .env
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1
NODE_ENV=production
EOF

# 4. Docker Compose up
docker-compose up -d

# 5. Configurar Nginx como reverse proxy
# (igual que en opción 2, pero apunta a puerto 3000)

# 6. Logs
docker-compose logs -f app
```

### 4. Optimizaciones de Docker

#### Reducir Tamaño de Imagen

```dockerfile
# Multi-stage build (ya incluido en Dockerfile)
# Imagen final: ~150 MB (vs 500+ MB sin optimización)

# Ver tamaño
docker images frontend-proyecto-de-grado
```

#### Health Checks

```yaml
# En docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
```

#### Logs

```bash
# Ver logs en tiempo real
docker logs -f next-app

# Últimas 100 líneas
docker logs --tail 100 next-app

# Con timestamps
docker logs -f --timestamps next-app
```

#### Escalado

```yaml
# docker-compose.yml - versión con load balancer
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
```

---

## 🔧 Configuración de Variables de Entorno

### Variables Requeridas

```env
# Supabase (requerido para autenticación)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# API Backend (requerido para operaciones de datos)
NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1

# Next.js Environment
NODE_ENV=production  # o development para dev
```

### Obtener Credenciales Supabase

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto
3. **Settings** → **API**
4. Copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Configurar por Plataforma

#### Vercel

**Opción 1**: Durante deployment
- Rellenar en el formulario de import

**Opción 2**: Después del deployment
- Ir a **Settings** → **Environment Variables**
- Agregar variables
- Redeploy

```bash
# Desde terminal
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_BASE
```

#### Servidor Propio

```bash
# Crear archivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_BASE=https://api.tudominio.com/api/v1
NODE_ENV=production
EOF
```

#### Docker

**Opción 1**: En docker-compose.yml
```yaml
environment:
  - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
  - NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
```

**Opción 2**: En archivo .env
```bash
docker-compose --env-file .env up
```

**Opción 3**: Via línea de comando
```bash
docker run -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... ...
```

---

## ✔️ Verificación Post-Instalación

### Checklist de Validación

```bash
# 1. Verificar que el app está corriendo
curl http://localhost:3000  # Debería retornar HTML

# 2. Verificar que conecta a Supabase
# Abrir browser en http://localhost:3000/autenticacion/iniciar-sesion
# Debería cargar sin errores de CORS

# 3. Verificar que conecta al backend API
# Abrir DevTools → Network
# Hacer login y verificar que /api/auth/login responde con 200

# 4. Verificar logs sin errores críticos
docker logs next-app | grep -i error

# 5. Verificar performance
# Abrir http://localhost:3000
# DevTools → Lighthouse
# Score debería ser >80

# 6. Verificar SSL (si en producción)
curl -I https://tu-dominio.com  # HTTP 200
```

### Tests Funcionales

```typescript
// Test de autenticación
1. Navegar a /autenticacion/iniciar-sesion
2. Ingresar credenciales válidas
3. Debería redirigir a /ejercicios
4. Usuario en navbar debería mostrar email

// Test de ejercicios
1. Navegar a /ejercicios
2. Click en un ejercicio
3. Debería cargar enunciado y editor
4. Escribir código y enviar
5. Debería aparecer feedback (si LLM habilitado)

// Test de admin
1. Login con usuario admin
2. Navegar a /admin
3. Debería ver panel de control
4. Intentar crear ejercicio
5. Guardar y verificar que aparece en lista
```

---

## 🐛 Troubleshooting

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Matar proceso
kill -9 <PID>

# O usar puerto diferente
docker run -p 3001:3000 ...
```

### Error: "Cannot find module 'next'"

```bash
# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Supabase CORS error"

1. Verificar `NEXT_PUBLIC_SUPABASE_URL` es correcto
2. En Supabase Dashboard → Settings → API:
   - Verificar que tu dominio esté en "Allowed Client URLs"
3. Limpiar localStorage y cookies
4. Reintentar en incognito

### Error: "API connection timeout"

1. Verificar que backend API está corriendo
2. Verificar `NEXT_PUBLIC_API_BASE` es accesible
3. Probar: `curl https://api.tudominio.com/api/v1/health`
4. Verificar firewall no bloquea conexión

### Docker: "No such file or directory"

```bash
# Verificar Dockerfile existe
ls -la Dockerfile

# Verificar path correcto
docker build -t app .  # Desde raíz del proyecto

# Si error persiste
docker build --no-cache -t app .
```

### Vercel: Build fails

```bash
# Ver logs de build completos
vercel logs --follow

# Problemas comunes:
# 1. Missing env vars: Agregar en Settings → Environment Variables
# 2. pnpm version: Vercel detecta automáticamente
# 3. Node version: Especificar en vercel.json (si necesario)
```

### Performance lento en producción

```bash
# 1. Verificar que estás en modo producción
NODE_ENV=production

# 2. Enablear caching en Nginx
# 3. Verificar que DB queries no son N+1
# 4. Usar React Query con staleTime apropiado
# 5. Code splitting automático en Next.js ✅
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
2. Revisar sección de Troubleshooting arriba
3. Abrir issue en GitHub
4. Contactar al equipo principal

---

## 🎯 Resumen de Opciones

| Aspecto | Vercel | Servidor Propio | Docker |
|--------|--------|-----------------|--------|
| **Configuración** | 5 min | 30 min | 10 min |
| **Costo** | Desde $0/mes | $5+/mes | $5+/mes |
| **Escalado** | Automático | Manual | Manual (sin orquestación) |
| **Uptime SLA** | 99.95% | Depende de ti | Depende de ti |
| **Monitoring** | Incluido | Manual | Manual |
| **Backups** | Automáticos | Manual | Manual |
| **Recomendado para** | Producción | Control total | Desarrollo/Staging |

---

**Última actualización**: Diciembre 22, 2025
