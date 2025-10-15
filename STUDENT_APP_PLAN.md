# Plan de Implementación – Superficie Estudiante (Cliente)

Este documento especializa la ejecución de la **superficie del estudiante** derivada de `FRONTEND_ARCHITECTURE.md`. Sirve como backlog vivo y contrato funcional/técnico para implementar la fase "usuario" (exploración, resolución de ejercicios, feedback LLM, progreso, futuro chat). No repite reglas globales salvo donde sea necesario enfatizar.

> Estado inicial: Solo área Admin implementada parcialmente. Este plan arranca desde ese baseline.
IMPORTANTE: todos los componentes base deben utilizarse con shadcn para mantener consistencia y evitar duplicación. Si necesitas componentes nuevos, dime y los intalamos de shadcn. Shadcn cuenta con un set muy completo de componentes como: Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Dialog, Drawer, Dropdown Menu, Empty, Field, React Hook Form, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography.
Si no consigues uno me dices y lo instalamos. 

---
## 1. Alcance (Scope Inicial)
Incluye en Fase 1 Estudiante:
- Listado público de guías (sin login duro si política lo permite; si no, exigir auth tras MVP).
- Vista detalle de guía con listado de ejercicios.
- Vista de ejercicio: contenido, editor (Monaco lazy), envío de intento.
- Recepción de feedback LLM (cuando disponible) + fallback si vacío.
- Visualización de intentos previos básicos (en la misma página del ejercicio).
- Marcado de progreso (ejercicios completados / guía completada) y página general de progreso.

Fuera de alcance inmediato:
- Chat contextual (streaming SSE) – se prepara scaffolding.
- Métricas cliente (telemetría interna).
- Gamificación / ranking.
- Exportaciones / historial detallado.
- Internacionalización.
- Offline/optimistic advanced.
- Theming múltiple.

---
## 2. Principios Específicos de la Superficie Estudiante
1. Carga percibida rápida: prefetched guides + skeletons.
2. Evitar bloqueo si feedback tarda: mostrar estado “Generando feedback...” con spinner/badge.
3. Fallback único y consistente para feedback vacío (según arquitectura global).
4. Minimizar uso de estado global (solo runtime ejercicio + session).
5. Editor desacoplado (Monaco) → fallback textarea si falla import dinámico.
6. Accesibilidad: navegación por teclado en editor y CTA reintento.
7. Chat diseñado como canal opcional (interfaces definidas sin implementación completa en Fase 1).

---
## 3. Mapa de Rutas (App Router) – Versión en Español
Convención: slugs en minúsculas, sin tildes ni eñes. Multi‑palabra en kebab-case.
```
/app
   /guias                       -> Listado de guías
   /guias/[guiaId]              -> Detalle guía + ejercicios
   /ejercicios/[ejercicioId]    -> Vista ejercicio + editor + intentos + feedback
   /progreso                    -> Resumen de progreso (por guía y total)
   /auth/login -> Login
   /auth/register       -> Registro
```

Ruta futura (chat diferido): `/ejercicios/[ejercicioId]/chat`.
Listado global diferido: `/ejercicios` (hasta disponer del endpoint global).

---
## 4. Entidades y Schemas Relevantes
(Se referencian schemas que deben existir / ampliarse en `shared/api/schemas.ts`).

| Entidad | Campos clave (lectura estudiante) | Notas |
|---------|------------------------------------|-------|
| User | id, name, email | Para ownership de attempts |
| Guide | id, title, topic, order, is_active | Mostrar solo activas (o flag visual) |
| Exercise | id, guide_id, title, content_html / content_md, type, difficulty | Sanitizar antes de render |
| Attempt | id, exercise_id, user_id, submitted_answer, completed, created_at, structural_validation_passed, llm_feedback, quality_flags | Listado lateral o seccion inferior |
| Feedback (implícito en Attempt) | llm_feedback (Markdown) | Si vacío => fallback panel |
| ChatMessage (futuro) | id, attempt_id, role, content_md, created_at | Deferred |
| Progress (agregado) | completed_exercises[], guide_completed[] | Derivado de backend |

---
## 5. Endpoints (Subconjunto Estudiante)
| Función | Endpoint | Método | Notas |
|---------|----------|--------|-------|
| Listar guías | `/guides/` | GET | Filtrar activas | 
| Detalle guía | `/guides/{id}` | GET | Incluye metadata básica |
| Ejercicios por guía | `/exercises/by-guide/{guide_id}` | GET | Prefetch al abrir guía |
| Detalle ejercicio | `/exercises/{id}` | GET | Contenido completo |
| Crear intento | `/attempts/` | POST | Body: exercise_id + answer |
| Intentos por ejercicio | `/attempts/by-exercise/{exercise_id}` | GET | Lista orden desc por fecha|
| Generar feedback | `/feedback/attempt` | POST | Tras crear intento (si feedback enabled) |
| Progreso agregado | `/progress/completed` | GET | Guías y ejercicios completados |
| Marcar completado (servidor) | `/progress/complete` | POST | (Opcional si backend lo maneja) |

---
## 6. Flujos Funcionales
### 6.1 Explorar Guías
- Usuario abre `/guias`.
- Query: `guides` (React Query). Skeleton si loading.
- Orden por `order` asc.

### 6.2 Ver Guía
- Ruta `/guias/[guiaId]` SSR (RSC) para datos iniciales (guía + ejercicios) → hidrata queries.
- Cada ejercicio muestra: título, difficulty (badge), estado (completado/pendiente).

### 6.3 Abrir Ejercicio
- Ruta `/ejercicios/[ejercicioId]`.
- Carga: ejercicio + intentos recientes + (opcional) progreso global.
- Se crea `exerciseRuntimeStore` con `exerciseId`, `activeAttemptId`.
- Si no hay intentos, mostrar panel “Aún no has enviado un intento”.

### 6.4 Enviar Intento
1. Usuario edita respuesta (editor/textarea).
2. Click “Enviar”. Estado: `SubmittingAttempt`.
3. POST `/attempts/`.
4. Si respuesta OK y validación estructural aprobada y feedback habilitado: transicionar a `GeneratingFeedback` y llamar a `/feedback/attempt`.
5. Guardar attempt en cache `['attempts','by-exercise',exerciseId]` (insert top). 

### 6.5 Feedback
- Si `llm_feedback` llega vacío: panel fallback con CTA “Reintentar feedback” (que re-dispara `POST /feedback/attempt` sobre el último attempt).
- Mostrar badges de flags (`quality_flags`).

### 6.6 Reintentos / Progreso
- Si un attempt no está `completed=true`, usuario puede enviar otro.
- Progreso se recalcula (invalidate `['progress','guides']`).

### 6.7 Chat (Futuro)
- Interfaz placeholder: botón “Chat (próximamente)”.
- Código: preparar hook `useExerciseChatChannel(exerciseId, attemptId)` sin implementación de streaming.

---
## 7. React Query – Nuevas Keys
Ampliar fábrica en `shared/api/query-keys.ts` (no hardcode):
| Key Propuesta | Forma | Uso |
|---------------|-------|-----|
| guias | `['guides']` (clave interna puede seguir siendo 'guides' para no romper admin; UI muestra “Guías”) |
| guiaDetalle | `['guides','detail', guiaId]` |
| ejerciciosPorGuia | `['exercises','by-guide', guiaId]` |
| ejercicioDetalle | `['exercises','detail', ejercicioId]` |
| intentosPorEjercicio | `['attempts','by-exercise', ejercicioId]` |
| progresoGuias | `['progress','guides']` |
| historialFeedback (futuro) | `['feedback','history', ejercicioId, attemptId?]` |

(Algunos ya implementados en admin; simplemente reutilizar) 

---

## 8. Diseño por Vista (Resumen Alto Nivel)
Modelo adoptado: Top Nav global + Sidebar contextual (sólo guía y ejercicio). Sidebar = componente oficial shadcn (mobile-ready) sin lógica custom. Progreso (check o badge) al lado de cada ejercicio desde el MVP. Todas las rutas y etiquetas visibles en español.

Breadcrumbs: se mostrarán (en español) en guías, detalle de guía y ejercicios. No aparecerán en la landing (`/`). Estructura típica:
Inicio > Guías > {Título Guía} > {Título Ejercicio}
Cada segmento clickable excepto el último. Usar componente `Breadcrumb` ya existente en `shared/ui/breadcrumb.tsx` con textos en español ("Inicio", "Guías").

Botón Admin: En el Sidebar contextual (y opcionalmente en el Top Nav) se mostrará un botón/enlace "Administración" visible sólo si el usuario tiene rol/flag admin (ver store de sesión). Ubicación sugerida: parte inferior del sidebar dentro de una sección separada (divider) etiquetada "Sistema".

Localización: Todos los rótulos y textos de navegación serán en español (Guías, Ejercicios, Progreso, Enviar intento, Feedback, Intentos, Administración, Iniciar sesión, Registrarse). Se evitará mezclar idiomas.

Listado global `/exercises` diferido: antes de implementarlo se solicitará explícitamente endpoint `GET /exercises/` (list all) para evitar N+1.

Landing: versión intermedia (Hero + 2–3 highlights + mini flujo + CTA final + pie “Creado por Rubert Gonzalez”). (Ruta `/` sin breadcrumb.)

Referencias: Sidebar shadcn → https://ui.shadcn.com/docs/components/sidebar

Objetivo: descripciones conceptuales sin fijar clases ni tamaños; detalles se deciden en implementación.

### 8.1 Landing (`/`)
Objetivo: Presentar la plataforma (qué es, beneficios, flujo básico) de forma limpia y moderna. Secciones sugeridas: Hero (título + subtítulo + CTA “Explorar guías”), Highlights (3–4 bloques), Flujo (pasos guía→ejercicio→intento→feedback→progreso), Tecnología (logos), CTA final y pie con “Creado por Rubert Gonzalez”. Sin sidebar; sólo top nav mínima.

### 8.2 Navegación Global
Top Nav (sticky simple): Logo / Inicio / Guías (/guias) / Ejercicios (diferido) / Progreso (/progreso, si autenticado) / Acceso (login/logout) / Administración (si rol admin).
Sidebar contextual: sólo en `/guias/[guiaId]` y `/ejercicios/[ejercicioId]` mostrando título de guía + lista de ejercicios con icono de estado (✓ completado / • pendiente).

### 8.3 Listado de Guías (`/guias`)
Lista (cards o filas simples) ordenada por `order`. Cada item clic → detalle. Estados: loading (skeleton genérico), empty (mensaje simple), error (alert + retry). No sobrecargar con filtros iniciales; búsqueda/tema diferido.

### 8.4 Detalle de Guía (`/guias/[guiaId]`)
Estructura: top nav + sidebar contextual (guía + ejercicios). En el panel principal: título de la guía, listado de ejercicios (también clicables) y opcional barra sencilla de progreso de esa guía. Si no hay ejercicios: mensaje neutral. Error: mensaje + link volver.

### 8.5 Listado Global de Ejercicios (`/ejercicios`) (Diferido)
No visible inicialmente. Se activa tras disponibilidad de endpoint global.

### 8.6 Vista de Ejercicio (`/ejercicios/[ejercicioId]`)
Top nav + sidebar contextual (misma guía y ejercicios hermanos). Secciones principales: contenido del ejercicio, editor (Monaco lazy + fallback textarea), botón de envío intento, panel de feedback (si existe) o fallback vacío con CTA reintento, lista compacta de intentos recientes, placeholder de chat futuro. Estados: enviando, generando feedback, error envío (toast) sin perder contenido. Diseño vertical simple en primera iteración; layout en dos columnas se puede evaluar luego.

### 8.7 Progreso (`/progreso`)
Top nav (sin sidebar). Mostrar resumen global (X/Y completados) y listado por guía (barra de progreso y link a la guía). Empty: mensaje amable; error: alert + retry.

### 8.8 Autenticación (`/autenticacion/iniciar-sesion`, `/autenticacion/registro`)
Card centrada minimal (campos necesarios, validación básica con zod). Botones para alternar. Sin sidebar.

### 8.9 Chat Placeholder
Bloque discreto con mensaje “Chat contextual próximamente” y botón disabled. No invertir tiempo en UI compleja.

### 8.10 Estados Transversales (Simplificados)
- Loading: skeleton genéricos (formas aproximadas; no pixel-perfect).
- Empty: icono o emoji + una línea de texto.
- Error: Alert destructivo + botón retry.
- Acción en curso: botón con spinner.

### 8.11 Accesibilidad (Resumen)
- Focus visible por defecto.
- Aria-live para cambios de estado de generación de feedback.
- Evitar usar sólo color para estados (texto o icono adicional cuando aplique).

### 8.12 Performance (Resumen)
- Monaco lazy import sólo cuando se monta el editor.
- Prefetch ejercicios de la guía al entrar a detalle guía (para sidebar y vista ejercicio subsecuente).
- Reutilizar cache de attempts; no refrescar agresivamente salvo tras mutación.

### 8.13 Dependencias / Notas
- Endpoint global ejercicios (GET /exercises/) pendiente de solicitud.
- Sidebar shadcn sin modificarse (aprovechar responsive integrado).
- Progreso por ejercicio: depende de datos en attempts o progress endpoint.

---

## 9. Estado Local (Stores)
`exerciseRuntimeStore` (extender si no existe):
- `exerciseId: string`
- `activeAttemptId?: string`
- `isSubmitting: boolean`
- `isGeneratingFeedback: boolean`
- `lastError?: string`
- Actions: `startSubmit()`, `finishSubmit(attemptId)`, `startFeedback(attemptId)`, `finishFeedback()`, `setError(msg)`

No duplicar attempts: solo IDs en store si imprescindible (el detalle vive en queries).

---
## 10. Backlog Priorizado (Iteraciones)
### Iteración 1 – Fundaciones Estudiante
1. Top Nav global (rutas en español) + landing intermedia (`/`).
2. Query keys ampliadas / verificación schemas (mantener claves técnicas, UI usa etiquetas españolas).
3. `/guias` y `/guias/[guiaId]` con SSR/RSC + Sidebar contextual + progreso en lista.
4. `/ejercicios/[ejercicioId]` estructura base (contenido + skeleton estados). 
5. Store runtime ejercicio + hook envío inicial.
6. Envío intento básico (sin feedback aún).

### Iteración 2 – Feedback y Flags
6. Integrar `POST /feedback/attempt` tras intento si procede.
7. Panel Feedback con markdown render y sanitizado.
8. Fallback feedback vacío + CTA reintento.
9. Badges de flags.

### Iteración 3 – Progreso
10. Endpoint progreso + cache + página `/progress`.
11. Badges completado en listas.
12. Invalidación progreso tras attempt completado.

### Iteración 4 – Pulido UX
13. Lazy Monaco + fallback.
14. AttemptsInlineList (historial compacto).
15. Skeletons y estados de carga refinados.

### Iteración 5 – Preparación Chat (sin UI final)
16. Definir interfaces `ChatMessage`, hook `useExerciseChatChannel` (stub).
17. Placeholder chat + documentación migrable a SSE.

### Iteración 6 – Hardening
18. Manejo de errores central (toasts) y retry.
19. Pruebas unitarias schemas / hooks críticos.
20. Documentar decisiones y actualizar este plan.

---
## 11. Detalle de Tareas con Criterios de Aceptación
Ejemplos (resto seguir misma estructura):

1. (I1) Páginas `/guides` & `/guides/[guideId]`:
   - CA: Lista guías ordenadas; al hacer click abre detalle guía con ejercicios; errores muestran mensaje neutral.
   - Métrica: TTFB aceptable (<500ms en dev) y sin errores de parseo.

2. (I2) FeedbackPanel:
   - CA: Render markdown seguro; si string vacío => muestra fallback; muestra flags outline.
   - Edge: feedback con HTML potencialmente maligno no ejecuta scripts.

3. (I3) Progreso:
   - CA: Al completar intento (completed=true) aparece badge en ejercicio y se refleja en `/progress` tras invalidación.

4. (I4) AttemptsInlineList:
   - CA: Muestra N últimos (configurable, default 5) y botón “Ver todos” que expande.

---
## 12. Errores y Fallbacks
| Contexto | Fallback | Log |
|----------|----------|-----|
| Error fetch guía | Mensaje "No se pudo cargar la guía" + retry | console.warn (dev) |
| Intento POST falla | Toast error + permanece contenido en editor | console.error |
| Feedback vacío | Panel fallback + CTA reintento | Evento (futuro) |
| Monaco falla cargar | Cambiar a textarea y aviso discreto | console.warn |

---
## 13. Observabilidad / Métricas (Futuro)
Eventos planificados (no implementar aún):
`view_guide`, `view_exercise`, `submit_attempt`, `feedback_generated`, `feedback_missing`, `attempt_completed`.

---
## 14. Testing Estrategia
| Tipo | Casos Iniciales |
|------|------------------|
| Unit (schemas) | Guide, Exercise, Attempt parse |
| Unit (hooks) | useSubmitAttempt, feedback retry |
| Component | FeedbackPanel fallback, GuideList vacía |
| E2E (posterior) | Flujo: listar guías → abrir ejercicio → enviar intento → ver feedback |

---
## 15. Riesgos Específicos
| Riesgo | Mitigación |
|--------|------------|
| Feedback lento bloquea UI | Estados separados: submitting vs generatingFeedback |
| Duplicar attempts en cache | Insertar solo al inicio; no duplicar si ID existe |
| Fuga de HTML malicioso | Sanitizar markdown + no dangerouslySetInnerHTML directo |
| Monaco pesado | Dynamic import + fallback textarea |
| Estados carrera reintento | Lock mientras isGeneratingFeedback |

---
## 18. Pendientes para Comenzar
- Confirmar si guías públicas requieren auth inmediata: No requieren, solo requiere el hacer un ejercicio.
- Crear/ajustar schemas faltantes (Attempt flags ya existentes?).
- Verificar endpoints dev backend disponibles: Todos los endpoints estan listados en el README de endpoints.

---
## 19. Glosario Específico
| Término | Definición |
|---------|-----------|
| Runtime Ejercicio | Estado efímero de envío y feedback para un ejercicio abierto |
| Fallback Feedback | Panel estándar cuando no hay contenido LLM |
| Flags | quality_flags dict retornado por backend |

---
## 20. Mantenimiento del Documento
Actualizar en cada bloque completado o cambio significativo. 

Fecha creación: 2025-10-04
Última revisión: (actualizar manualmente)

---
Fin del documento.
