# Arquitectura del Frontend – Plataforma Educativa (Guía Operativa para Implementación con Copilot)

Documento maestro (Single Source of Truth) para implementar el frontend completo de la plataforma educativa.  
Este archivo ya asume que el proyecto **YA FUE CREADO** con `create-next-app` (Next.js App Router + TypeScript + Tailwind + alias `@/`), por lo que NO se listan pasos de creación inicial, solo las reglas y estructura oficiales a seguir.  
Incluye: estructura definitiva de carpetas, tipado, sanitización, permisos, orden de desarrollo (primero **Admin**, luego **Estudiantes**), lineamientos de UX para feedback LLM, chat, progreso, tooling (pnpm, ESLint, Prettier), política de imports con alias `@/`, manejo de Supabase Auth y convenciones de React Query.  
No contiene código de componentes finales: define reglas, contratos y convenciones para que Copilot genere implementaciones consistentes.

---

## 0. Base Técnica y Configuración

- API Backend (base URL desarrollo): `http://localhost:8000/api/v1`
- Constante global: `API_BASE` en `shared/config/api.ts`
- Variables `.env.local` mínimas:
  - `NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1`
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- Gestor de paquetes obligatorio: **pnpm**
- Node: 20.x (`.nvmrc` con `v20`)
- TypeScript: `strict: true`
- Alias de imports: `@/*` (prohibido abuso de rutas relativas profundas)
- Autenticación: Supabase Auth (JWT en cookies httpOnly). Refresh automático gestionado por SDK (NO manipular manualmente).
- Cada request autenticado: header `Authorization: Bearer <access_token_supabase>`

---

## 1. Objetivo General

Desarrollar dos superficies diferenciadas:

1. **Admin (primera fase)**: CRUD de guías y ejercicios, visualización de intentos, estado LLM.
2. **Estudiantes (segunda fase)**: Exploración de guías, resolución de ejercicios, feedback LLM, chat contextual, progreso.

---

## 2. Stack Tecnológico Confirmado

| Área | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router, RSC) |
| Lenguaje | TypeScript (strict) |
| Paquetes | pnpm |
| UI | TailwindCSS + shadcn/ui |
| Formularios | react-hook-form + zod |
| Data fetching | React Query |
| Estado local | Zustand (stores acotados) |
| Auth | Supabase Auth |
| Editor | Monaco (lazy import) |
| Markdown | react-markdown + remark-gfm + rehype-sanitize |
| HTML seguro | DOMPurify / rehype-sanitize |
| Animaciones | Framer Motion |
| Lint | ESLint |
| Formato | Prettier |
| Testing | Vitest / Playwright (definir) |
| Observabilidad (futuro) | Sentry |
| Métricas cliente (futuro) | Logger custom |

---

## 3. Principios Arquitectónicos

1. Feature-first desde el inicio.
2. Validación y tipado con Zod en el borde (toda respuesta).
3. Server Components para data inicial; interacción dinámica en Client Components.
4. Estado global mínimo (solo flags y referencias activas).
5. Seguridad por capas: middleware + validación server.
6. Sanitización estricta de HTML y Markdown.
7. Preparado para futuro streaming SSE (chat).
8. Servicios aislados por feature (sin “mega service”).
9. Lógica de negocio fuera de componentes (hooks / lógica).
10. Documento vivo (actualizar antes de implementar cambios transversales).
11. Tooling homogéneo (ESLint + Prettier + husky).
12. Alias `@/` obligatorio (no “relative hell”).
13. Fallback explícito para feedback vacío.
14. No se exige formato específico del Markdown del LLM (solo se muestra si no está vacío).

---

## 4. Estructura Definitiva de Carpetas

```
frontend/
  app/
    layout.tsx
    page.tsx
    admin/
      layout.tsx
      guides/
        page.tsx
        create/page.tsx
        [guideId]/edit/page.tsx
      exercises/
        page.tsx
        create/page.tsx
        [exerciseId]/edit/page.tsx
      attempts/
        [exerciseId]/page.tsx
      llm-status/page.tsx
      metrics/page.tsx
    guides/
      page.tsx
      [guideId]/page.tsx
    exercises/
      [exerciseId]/page.tsx
    auth/
      login/page.tsx
      register/page.tsx
    progress/
      page.tsx
  features/
    auth/
      api/ hooks/ logic/
    guides/
      api/ hooks/ components/ logic/
    exercises/
      api/ hooks/ components/ logic/
    attempts/
      api/ hooks/
    feedback/
      api/ hooks/ logic/
    chat/
      api/ hooks/ channel/ logic/
    progress/
      api/ hooks/
    admin/
      guides/ exercises/ metrics/
    llm/
      api/ hooks/
  shared/
    api/          # http-client, schemas, endpoints, query-keys
    auth/         # supabase client & session helpers
    ui/           # componentes base reutilizables
    markdown/     # sanitize + render
    security/     # role guard, permissions
    stores/       # session, runtime, ui, chat
    utils/        # logger, flags, format
    config/       # api base, constants
  styles/
  tests/
  public/
  middleware.ts
```

Solo crear carpetas al usarlas (evitar ruido inicial para Copilot).

---

## 5. Flujo de Desarrollo (Orden de Implementación)

1. Tooling base (ya creado el proyecto, asegurar: alias, ESLint, Prettier, husky, query keys, schemas).
2. **Fase 1 – Admin**:
   - Auth + sessionStore + gating `/admin`
   - CRUD Guías
   - CRUD Ejercicios (flags)
   - Listado intentos por ejercicio
   - Estado LLM (`/llm/status`)
3. **Fase 2 – Estudiantes**:
   - Listado guías público
   - Vista guía + ejercicios
   - Vista ejercicio: contenido + editor
   - Crear intento + feedback
   - Fallback feedback vacío
   - Chat e historial
   - Progreso y reintentos
   - Badges flags + typewriter
4. **Fase 3 – Optimización**:
   - Streaming SSE (chat)
   - Métricas cliente
   - Accesibilidad + performance tuning

---

## 6. Endpoints Backend Relevantes

| Función | Endpoint |
|---------|----------|
| Usuario autenticado | `GET /users/me` |
| Guías CRUD | `/guides/` |
| Ejercicios CRUD | `/exercises/` |
| Ejercicios por guía | `GET /exercises/by-guide/{guide_id}` |
| Intentos | `POST /attempts/`, `GET /attempts/by-exercise/{exercise_id}` |
| Feedback intento | `POST /feedback/attempt` |
| Chat | `POST /feedback/chat` |
| Historial | `GET /feedback/history?exercise_id=...` |
| Progreso | `/progress/completed`, `/progress/complete` |
| LLM status | `GET /llm/status` |

---

## 7. Tipado y Validación

- Schemas Zod (User, Guide, Exercise, Attempt, FeedbackAttemptOut, ChatResponse).
- Servicios solo exponen datos parseados.
- Error de parseo: lanzar excepción y mostrar fallback genérico (log en modo dev).

---

## 8. Sanitización

| Origen | Tratamiento |
|--------|-------------|
| `content_html` | `sanitizeHtml` helper |
| `content_md` | Markdown pipeline (`react-markdown + rehype-sanitize`) |
| Inputs usuario | No se renderizan (solo envío) |
| Tooltips / flags | Texto plano escapado |

Prohibido `dangerouslySetInnerHTML` fuera de helpers centralizados.

---

## 9. Servicios (API Layer)

Reglas:
- Un archivo por recurso (ej: `guides-api.ts`, `exercises-api.ts`).
- Prefijos semánticos (`fetch`, `create`, `update`, `delete`, `generate`, `send`).
- Mutaciones invalidan queries relevantes usando factory de keys.
- Nunca devolver `any`.

---

## 10. Estado Global y React Query

### Stores
| Store | Responsabilidad |
|-------|-----------------|
| sessionStore | Usuario y estado auth |
| exerciseRuntimeStore | exerciseId, attemptId, flags envío/feedback |
| chatStore (futuro) | Mensajes transitorios mientras llega historial |
| uiStore | Toggles UI (sidebar, panel chat) |

### Reglas
- No duplicar en store lo que ya está en cache React Query.
- Reset runtime al cambiar de ejercicio.

---

## 11. Query Keys (Centralizadas)

Generadas en `shared/api/query-keys.ts`:

| Recurso | Key |
|---------|-----|
| Guías | `['guides']` |
| Guía detalle | `['guides','detail',guideId]` |
| Ejercicios por guía | `['exercises','by-guide',guideId]` |
| Ejercicio detalle | `['exercises','detail',exerciseId]` |
| Intentos | `['attempts','by-exercise',exerciseId]` |
| Historial feedback | `['feedback','history',exerciseId,(attemptId?)]` |
| LLM status | `['llm','status']` |
| Progreso | `['progress','guides']` |
| Usuario | `['users','me']` |

Prohibido hardcodear arrays fuera de la fábrica.

---

## 12. Máquina de Estados (Ejercicio)

```
Idle
  -> SubmittingAttempt
    -> (validación estructural falla) Idle (mostrar errores)
    -> (pasa) GeneratingFeedback (si feedback habilitado)
       -> FeedbackReady
          -> Chatting <-> FeedbackReady
Errores => Idle + notificación
```

---

## 13. Chat y Streaming

- Estrategia inicial: FullResponse (respuesta completa).
- Preparar interfaz para futura `SSEStreamingStrategy`.
- Hook y estrategia desacoplados de animación (typewriter opcional).
- Historial persistente viene de backend (`/feedback/history`).

---

## 14. UX Feedback LLM

- Mostrar `content_md` tal cual (sanitizado Markdown).
- Fallback ÚNICO: si `content_md` vacío (trim == ''):
  - Panel “Feedback no disponible”
  - CTA “Reintentar”
  - Evento `feedback_missing`
- Badges:
  - similarity_used
  - truncated
  - stub_mode
  - specialization_applied
- Banner si `stub_mode` true.
- Transparencia: no inventar secciones.

---

## 15. Progreso

- Completado ejercicio: `attempt.completed=true`.
- Completado guía: todos los ejercicios completados o confirmado vía `/progress/completed`.
- Iconos en listados (no bloquear acceso a ejercicios no completados).

---

## 16. Métricas Cliente (Opcional Posterior)

Eventos sugeridos:
`view_exercise`, `submit_attempt`, `feedback_generated`, `feedback_missing`, `chat_message_sent`, `chat_message_received`, `retry_attempt`.

---

## 17. Accesibilidad y Responsive

- Semántica (`main`, `section`, `article`).
- Focus visible en formularios.
- Panel chat: lateral en desktop, drawer inferior en mobile.
- Editor fallback (textarea) si Monaco no carga.

---

## 18. Testing

| Tipo | Cobertura |
|------|-----------|
| Unit (schemas) | Parse correcto de responses |
| Unit (hooks) | useExerciseFlow, canal chat |
| E2E | Flujo admin CRUD / flujo estudiante intento + feedback |
| UI fallback | Feedback vacío |
| Middleware | Acceso a `/admin/*` sin rol |
| Performance (opcional) | Tiempo carga ejercicio base |

---

## 19. Performance & Caching

- Prefetch ejercicios al entrar a una guía.
- Lazy load Monaco.
- Historial chat on-demand (no SSR).
- Revalidate bajo demanda (si se configura en backend) o invalidación manual tras mutaciones.
- Evitar JSON grandes en SSR (usar fetch incremental).

---

## 20. Roadmap Técnico

| Iteración | Foco |
|-----------|------|
| 1 | Admin Auth + CRUD Guías |
| 2 | CRUD Ejercicios + Flags |
| 3 | Intentos (admin) + LLM status |
| 4 | Guías públicas + detalle |
| 5 | Intentos + feedback estudiante |
| 6 | Chat + historial |
| 7 | Progreso + reintentos UX |
| 8 | Badges + typewriter |
| 9 | Streaming SSE + métricas cliente |
| 10 | Accesibilidad + performance |

---

## 21. Flujo de Contribución

1. Añadir/actualizar schema Zod (si aplica).
2. Crear servicio API.
3. Crear hook React Query (usar queryKeys).
4. Implementar UI (componentes puros).
5. Añadir tests mínimos.
6. Actualizar este documento si cambio transversal.
7. PR con lint + typecheck aprobados.

---

## 22. Estilo y Nomenclatura

- Archivos: kebab-case.
- Hooks: `useX`.
- Schemas: `XSchema`.
- Tipos: `X`.
- Banderas booleanas: prefijo `is` / `has` / `can`.
- Sin default exports (excepto páginas).
- Query keys únicamente desde fábrica central.

---

## 23. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Duplicación de lógica API | Feature-first + servicios aislados |
| Estados duplicados (store + query) | Regla: datos remotos solo en queries |
| Feedback vacío sin fallback | Panel fallback estandarizado |
| Imports relativos profundos | Alias `@/` + ESLint |
| Cambios backend rompen front | Zod parse (fail-fast) |
| Crecimiento desordenado del chat | Historial controlado + límite inicial |
| Streaming complejo luego | Abstracción de canal desde inicio |
| Sanitización omitida | Helpers centralizados obligatorios |

---

## 24. Glosario

| Término | Definición |
|---------|-----------|
| Attempt | Intento de resolver un ejercicio |
| Feedback LLM | Respuesta Markdown devuelta por backend |
| Chat | Interacción posterior asociada al ejercicio/attempt |
| Flags | Indicadores del pipeline (similarity_used, truncated...) |
| Stub Mode | Modo sin modelo real (respuesta limitada) |
| Streaming | Respuesta incremental futura |
| Runtime Store | Estado efímero ligado al ejercicio actual |

---

## 25. Checklist Global

### Tooling Base
- [ ] pnpm configurado + script preinstall
- [ ] Node 20 (.nvmrc)
- [ ] ESLint + Prettier + husky + lint-staged
- [ ] tsconfig alias `@/*`
- [ ] http-client + endpoints + query-keys + schemas
- [ ] sessionStore operativo
- [ ] Middleware admin

### Admin
- [ ] Auth (login/register)
- [ ] CRUD Guías
- [ ] CRUD Ejercicios (flags)
- [ ] Listar intentos por ejercicio
- [ ] Vista LLM status
- [ ] Sanitización HTML guías/ejercicios
- [ ] Formularios validados (zod)

### Estudiantes
- [ ] Listado guías
- [ ] Vista guía
- [ ] Vista ejercicio + editor
- [ ] Crear intento
- [ ] Feedback + fallback vacío
- [ ] Badges flags
- [ ] Chat básico
- [ ] Historial
- [ ] Progreso
- [ ] Reintentos / UX
- [ ] Typewriter

### Optimización
- [ ] Streaming SSE
- [ ] Métricas cliente
- [ ] Accesibilidad
- [ ] Performance tuning

---

## 26. Supabase Auth

- Access token vía SDK.
- Refresh automático (no manual).
- 401 → signOut → `/auth/login`.
- No persistir tokens en localStorage.

---

## 27. Tooling & Convenciones

- Preinstall bloquea uso de npm/yarn.
- ESLint: import/order, consistent-type-imports, no “relative hell”.
- Prettier gobierna formato (col 100).
- Query keys centralizadas obligatorias.
- Errores normalizados `{ status, message, code? }`.
- Fallbacks UI estándar (feedback vacío, historial vacío, sin intentos).
- Commits Convencionales (`feat:`, `fix:`, etc.).

---

## 28. Fallback Feedback (Simplificado)

| Caso | Condición | Acción | Evento |
|------|-----------|--------|--------|
| Válido | `content_md.trim() !== ''` | Render Markdown | `feedback_generated` |
| Vacío | `!content_md || content_md.trim()===''` | Panel “Feedback no disponible” + CTA Reintentar | `feedback_missing` |
| Error red | Excepción | Toast + permitir reintento | `feedback_error` |

No se exige análisis de secciones del Markdown.

---

## 29. Auditoría Continua

Cada milestone:
- Revisar stores (no duplicar datos remotos).
- Verificar nuevas entidades → schemas + query keys.
- Confirmar fallback feedback sigue aplicado.
- Revisar imports sin alias.

---

## 30. Notas Finales

- Proyecto ya creado: este documento guía el resto del desarrollo.
- Actualizar antes de introducir patrones nuevos.
- `content_md` = feedback / chat.
- Streaming se pospone hasta la iteración definida.
- No manipular tokens Supabase.
- Registrar hacks temporales en sección 29.

Última revisión: (actualizar manualmente al modificar)

---
Documento vivo. Mantener alineado con Backend.