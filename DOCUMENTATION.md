Plataforma Educativa – Documentación General (Cómo está hecha y cómo usarla)

1) Visión General
- Objetivo: ofrecer contenido guiado (guías), ejercicios prácticos y retroalimentación inteligente (LLM) para acelerar el aprendizaje.
- Enfoque: arquitectura modular por “features” (guides, exercises, attempts, progress, llm), con UI desacoplada de la capa de datos y validaciones estrictas de tipos.
- Público: estudiantes (consumen guías/ejercicios y reciben feedback) y administradores (gestionan contenido, estado del LLM y métricas).

2) Stack Tecnológico
- Framework: `Next.js 15` (App Router) + `React 19` + `TypeScript`.
- Estado de datos: `@tanstack/react-query` (cache, fetch, invalidaciones) + `Zod` (schemas de entrada/salida y tipos seguros).
- UI: Tailwind CSS 4 + componentes basados en Radix (`@radix-ui/*`) y patrones shadcn (en `src/shared/ui/`), iconos `lucide-react`.
- Edición rica: `Tiptap` (núcleo ProseMirror) con extensiones y UI propia (carpetas `src/components/tiptap-*`).
- Editor/“consola”: `Monaco Editor` vía `@monaco-editor/react` para ejercicios tipo comando/código.
- Render Markdown seguro: `react-markdown`, `remark-gfm`, `rehype-sanitize`.
- Autenticación/cliente: integración con Supabase (SDK `@supabase/supabase-js` presente; el wiring vive en `src/shared/supabase/`).
- Herramientas dev: ESLint, Prettier, TypeScript, Husky + lint-staged.

3) Estructura (resumen práctico)
- `app/` Rutas (App Router): páginas públicas y del administrador (guías, ejercicios, intentos, llm-status, métricas).
- `features/` Lógica por dominio: `guides`, `exercises`, `attempts`, `llm`, `metrics`, `progress` (cada uno con `api/`, `hooks/`, `components/`).
- `shared/` Infra transversal: `api/` (http-client, schemas, query-keys), `ui/` (componentes base), stores (Zustand), utils, providers.
- `components/` Edición avanzada (Tiptap UI/plantillas, íconos tiptap, etc.).
- `styles/` Estilos globales y de editor.
- Documentos guía: `FRONTEND_ARCHITECTURE.md`, `ENDPOINTS_README.md`, `BACKEND_ARCHITECTURE_FULL.md`, `STUDENT_APP_PLAN.md`.

4) Núcleo funcional
4.1 Gestor de Guías y Ejercicios (énfasis editor)
- Dónde vive: rutas admin en `app/admin/guides` y `app/admin/exercises` + hooks/api en `features/guides` y `features/exercises`.
- Formularios: `react-hook-form` + `zod` (ejemplo: `app/admin/exercises/create/page.tsx`). Validan campos como `type`, `enable_structural_validation`, `enable_llm_feedback`.
- Editor de contenido: `Tiptap` con UI personalizada:
  - Plantilla base en `components/tiptap-templates/simple/simple-editor.tsx`.
  - Botones/menús en `components/tiptap-ui/*` (encabezados, listas, code block, highlight, alineación, links, etc.).
  - Extensible: se pueden agregar extensiones Tiptap (p.ej., `@tiptap/extension-underline`, `task-list`) ya incluidas en `package.json`.
- Render seguro: cuando se muestra contenido HTML/MD al estudiante, se sanitiza (rehype-sanitize o utilidades en `shared/lib` y `components/safe-html.tsx`).
- Tipos de ejercicio: `command`, `dockerfile`, `conceptual`, `compose` (ver `shared/api/schemas.ts`). Cada tipo ajusta validación y feedback.

4.2 Consola / Editor de Comandos
- Objetivo: capturar respuestas de tipo línea de comandos o snippets de configuración con experiencia “parecida a VS Code”.
- Implementación: `Monaco Editor` (dep: `monaco-editor` + `@monaco-editor/react`). Componente controlado `MonacoControlledEditor` y uso en flujos de envío del estudiante (ver imports en `features/exercises/components/student/attempt-submission-form.tsx`).
- Visualización de respuestas: `ReadOnlyCode` para mostrar lo enviado en modo sólo lectura (p.ej., en administración `attempts-table` detalla la respuesta).
- Validación estructural: antes de invocar LLM, el backend valida estructura (comando/formato). El frontend muestra los errores/advertencias del intento en el panel de detalles (listas de errores/warnings del esquema Attempt).

4.3 Feedback con LLM (respuestas inteligentes)
- Endpoints principales (documentados en `ENDPOINTS_README.md`):
  - `POST /feedback/attempt`: genera retroalimentación para una respuesta concreta (sin chat continuo).
  - `POST /feedback/chat`: chat con el LLM asociado a un `attempt_id` (aislamiento por intento; cambio importante documentado).
  - `GET /feedback/history`: historial por ejercicio y/o intento.
- Flujo recomendado (estudiante):
  1) Crear intento: `POST /attempts/` con `{ exercise_id, submitted_answer }`.
  2) Validación estructural (backend). Si falla, no se consume LLM.
  3) Si procede, solicitar feedback: `POST /feedback/attempt`.
  4) Render de feedback: `react-markdown` + `remark-gfm` + `rehype-sanitize` (en `features/exercises/components/student/feedback-panel.tsx`).
  5) Chat (opcional/extendible): `POST /feedback/chat` con `{ exercise_id, attempt_id, message }` y listar historial (`/feedback/history`).
- Presentación en Admin: en `features/attempts/components/attempts-table.tsx` se lista y detalla cada intento, incluyendo `llm_feedback` y estado de validación/completado.
- Estado del LLM: `/llm/status` expone configuración/health; su vista vive en `app/admin/llm-status`.

5) Capa de Datos y Estado
- Schemas (Zod): `shared/api/schemas.ts` define tipos de `Guide`, `Exercise`, `Attempt`, métricas, etc. Transformaciones garantizan defaults (p.ej., `completed` por defecto `false`).
- Query Keys: centralizadas en `shared/api/query-keys.ts` (e.g., `['attempts','by-exercise',exerciseId]`, `['feedback','history',exerciseId,(attemptId?)]`).
- Hooks de datos: `features/*/hooks` encapsulan `useQuery`/`useMutation` por recurso (ej.: `useExercisesWithProgressQuery`, `useAttemptsByExercise`).
- Stores (Zustand): `shared/stores/` (p.ej., `exercise-runtime-store`) guarda estado efímero de la sesión del ejercicio (attempt actual, flags de envío/feedback).

6) Módulos transversales importantes
- UI base: `shared/ui/*` (Button, Badge, Table, Dialog, Command/Combobox, Popover, etc.).
- Sanitización: utilidades en `shared/lib` y `components/safe-html.tsx` para contenido generado por usuarios/LLM.
- Métricas: vistas admin en `app/admin/metrics` y schemas en `shared/api/schemas.ts` (overview ampliable).
- Progreso: endpoints `progress/*`, hooks en `features/progress`, vistas del estudiante en `app/progreso`.

7) Flujo de Intentos (Attempt) – de punta a punta
- Listado por ejercicio: `GET /attempts/by-exercise/{exercise_id}` (hook `useAttemptsByExercise`).
- Creación: `POST /attempts/` (`features/attempts/api/attempts-api.ts`).
- Detalle visual: Admin `attempts-table` permite abrir un intento y ver:
  - Respuesta enviada (con `ReadOnlyCode`).
  - Feedback LLM (Markdown renderizado o HTML preformateado según origen).
  - Validación estructural (errores/advertencias) y estado (`completed`).

8) Seguridad y Buenas Prácticas
- Sanitización obligatoria para cualquier HTML/MD que provenga de usuarios/LLM. Uso de `rehype-sanitize` con `react-markdown`. Para vistas que usen `dangerouslySetInnerHTML`, se asume sanitización previa en backend o se recomienda convertir a Markdown y renderizar con pipeline seguro.
- Zod como contrato de entrada/salida: evita estados “any” y tolera evolución del backend con `.passthrough()` donde aplica (métricas, etc.).
- No duplicar estado: preferir cache de React Query a stores globales, limitar Zustand a runtime efímero.

9) Endpoints relevantes (guía rápida)
- Usuarios: `GET /users/me`.
- Guías: CRUD `/guides/*`.
- Ejercicios: CRUD `/exercises/*`, listar por guía `GET /exercises/by-guide/{guide_id}`.
- Intentos: `POST /attempts/`, `GET /attempts/by-exercise/{exercise_id}`.
- Feedback intento: `POST /feedback/attempt`.
- Chat LLM: `POST /feedback/chat` (requiere `attempt_id`).
- Historial feedback: `GET /feedback/history?exercise_id=...&attempt_id=...`.
- Progreso: `/progress/completed`, `/progress/complete`, `/progress/overview` (si aplica).
- LLM status: `GET /llm/status`.

10) Scripts de desarrollo
- Requisitos: Node 20, pnpm ≥ 9.
- Comandos:
  - `pnpm dev` (Next dev con Turbopack)
  - `pnpm build` (build con Turbopack)
  - `pnpm start` (servidor producción)
  - `pnpm lint` (ESLint)
  - `pnpm typecheck` (tsc sin emitir)

11) Cómo extender
- Agregar un tipo de ejercicio:
  - Ampliar el enum de `Exercise` en `shared/api/schemas.ts`.
  - Ajustar formularios admin para ofrecer el nuevo tipo y su UI específica.
  - Implementar validación estructural en backend; exponer flags/hints si aplica.
  - Añadir render/edición específica en componentes de estudiante.
- Añadir herramientas al editor Tiptap:
  - Crear botón/menú en `components/tiptap-ui/*`.
  - Registrar extensión Tiptap (sub/superscript, tablas, etc.).
- Integrar chat visible para el estudiante:
  - Hook con `sendChatMessage` (`features/attempts/api/attempts-api.ts`).
  - Componente de UI para historial (`/feedback/history`) y entrada de mensajes asociada a `attempt_id`.
- Métricas personalizadas:
  - Extender schemas métricos en `shared/api/schemas.ts` con `.passthrough()`.
  - Crear tabla/panel en `app/admin/metrics` consumiendo nuevo endpoint.

12) Decisiones de diseño (racionales)
- Tiptap vs. Markdown plano: Tiptap ofrece UX WYSIWYG, control fino (extensiones), y persistencia como HTML/MD según necesidad.
- Monaco para “consola”: experiencia conocida (VS Code), alto rendimiento, control de lenguaje/temas y modo sólo-lectura para auditoría.
- React Query + Zod: combinan DX y robustez (tipos derivados de schemas, invalidaciones centralizadas por `query-keys`).
- Aislamiento por intento en chat LLM: evita contaminación de contexto, mejora trazabilidad pedagógica y de métricas.

13) Referencias internas útiles
- Arquitectura frontend: `FRONTEND_ARCHITECTURE.md` (carpetas, reglas, keys, stores).
- Endpoints y contratos: `ENDPOINTS_README.md` (cambios en chat, ejemplos de payloads, modelos).
- Schemas y tipos: `shared/api/schemas.ts`.
- Query keys: `shared/api/query-keys.ts`.
- Attempts API: `features/attempts/api/attempts-api.ts`.
- Editor Tiptap: `components/tiptap-templates/simple/simple-editor.tsx` y `components/tiptap-ui/*`.
- Flujo estudiante – feedback: `features/exercises/components/student/feedback-panel.tsx`.
- Vista admin – intentos: `features/attempts/components/attempts-table.tsx`.

14) FAQ breve
- ¿Dónde activo/desactivo validación o feedback IA en un ejercicio?
  - En el formulario de creación/edición (campos `enable_structural_validation`, `enable_llm_feedback`).
- ¿Por qué mi feedback no aparece?
  - Revisa validación estructural (si falla, no se invoca LLM). Confirma el estado del modelo en `/admin/llm-status` y la sanitización/render (Markdown recomendado).
- ¿Cómo filtro intentos por usuario?
  - En la tabla de intentos (admin) existe un combobox (Command) para filtrar por `user.id`.

Fin del documento.
