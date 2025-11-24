# API Endpoints – Referencia para Frontend

Formato: `METHOD /path` – (Auth / Rol) – Descripción breve.
Encabezado de autenticación estándar: `Authorization: Bearer <jwt_supabase>`.
Los campos `admin` indican verificación de rol mediante `require_role('admin')`.

---
## 1. Usuarios
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | /users/me | Sí | cualquiera | Perfil del usuario autenticado |
| GET | /users/ | Sí | admin | Listar todos los usuarios |

### Ejemplos
#### GET /users/me
```json
{
  "id": "8b7c8c0e-7c3d-4c1c-af2b-9d9b2f9f1a33",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "student"
}
```

#### GET /users/
```json
[
  {"id": "...","email": "admin@example.com","name": "Admin","role": "admin"},
  {"id": "...","email": "alice@example.com","name": "Alice","role": "student"}
]
```

---
## 2. Intentos (Attempts)
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | /attempts/ | Sí | student/admin | Crear intento (valida estructura si aplica) |
| GET | /attempts/by-exercise/{exercise_id} | Sí | student/admin | Listar intentos propios |
| GET | /attempts/admin/all | Sí | admin | Listar intentos (global, filtros) |

### Crear intento – POST /attempts/
Request body:
```json
{
  "exercise_id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11",
  "submitted_answer": "FROM python:3.12-slim\nRUN pip install flask",
  "completed": false
}
```
Response (201):
```json
{
  "id": "3d1f0f7a-5e3d-4a8a-a7a4-9d1e6b2c8f90",
  "exercise_id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11",
  "user": {
    "id": "8b7c8c0e-7c3d-4c1c-af2b-9d9b2f9f1a33",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student"
  },
  "submitted_answer": "FROM python:3.12-slim\nRUN pip install flask",
  "structural_validation_passed": true,
  "structural_validation_errors": [],
  "structural_validation_warnings": [],
  "llm_feedback": null,
  "completed": false,
  "created_at": "2025-11-15T10:00:00Z"
}
```

Reglas de asignación de `completed` al crear un intento:
- Ejercicio `conceptual`: se marca `completed=true` inmediatamente (no hay validación estructural).
- Ejercicio `command` o `dockerfile`: sólo se marca `completed=true` si `structural_validation_passed=true`. (El feedback LLM puede venir después, pero no afecta el estado.)
- Campo `completed` enviado por el cliente es ignorado; el backend lo determina.
- Cuando todos los ejercicios activos de una guía están `completed=true`, la guía se marca automáticamente como completada (inserción en `/progress/completed`).

### Listar intentos – GET /attempts/by-exercise/{exercise_id}
```json
[
  {
    "id": "...",
    "exercise_id": "...",
    "user": {"id": "...", "name": "Alice", "email": "alice@example.com", "role": "student"},
    "submitted_answer": "FROM python:3.12-slim",
    "structural_validation_passed": true,
    "structural_validation_errors": [],
    "structural_validation_warnings": [],
    "llm_feedback": "## Fortalezas...",
    "completed": false,
    "created_at": "2025-11-15T10:00:00Z"
  }
]
```

### Listar intentos global (admin) – GET /attempts/admin/all
Parámetros query opcionales:
- `exercise_id`: filtra por ejercicio
- `user_id`: filtra por usuario
- `limit`: máximo de registros (default 500)

Ejemplo sin filtros:
```
GET /attempts/admin/all
```

Ejemplo filtrando por ejercicio:
```
GET /attempts/admin/all?exercise_id=9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11&limit=200
```

Response (200):
```json
[
  {
    "id": "3d1f0f7a-5e3d-4a8a-a7a4-9d1e6b2c8f90",
    "exercise_id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11",
    "user": {
      "id": "8b7c8c0e-7c3d-4c1c-af2b-9d9b2f9f1a33",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "student"
    },
    "submitted_answer": "FROM python:3.12-slim\nRUN pip install flask",
    "structural_validation_passed": true,
    "structural_validation_errors": [],
    "structural_validation_warnings": [],
    "llm_feedback": null,
    "completed": false,
    "created_at": "2025-11-15T10:00:00Z"
  }
]
```

Notas:
- Si el usuario fue eliminado, se devuelve `name: "unknown"`, `email: "unknown@example.com"` y `role: "unknown"`.
- Usar paginación futura si `limit` no es suficiente.

---
## 3. Guías
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | /guides/ | No* | - | Listar guías activas |
| GET | /guides/{guide_id} | No* | - | Obtener guía |
| GET | /guides/{guide_id}/exercises-with-progress | Sí | student/admin | Ejercicios + progreso usuario |
| DELETE | /guides/{guide_id} | Sí | admin | Eliminar guía (204) |

(* Dependiendo de política futura se puede exigir auth.)

### GET /guides/
```json
[
  {"id": "...","title": "Introducción a Docker","topic": "docker","order": 1,"is_active": true},
  {"id": "...","title": "CLI Básica","topic": "linux","order": 2,"is_active": true}
]
```

### GET /guides/{guide_id}
```json
{
  "id": "2c9b2d4d-6d9a-4a8f-8231-0a4d13e1c222",
  "title": "Introducción a Docker",
  "topic": "docker",
  "content_html": "<h1>Docker</h1>...",
  "order": 1,
  "is_active": true,
  "created_at": "2025-09-13T10:00:00Z",
  "updated_at": "2025-09-13T10:00:00Z"
}
```

### GET /guides/{guide_id}/exercises-with-progress
```json
[
  {
    "id": "...",
    "title": "Construir imagen base",
    "type": "dockerfile",
    "difficulty": "medio",
    "completed": false
  }
]
```

---
## 4. Ejercicios
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | /exercises/ | Sí | admin | Crear ejercicio |
| PATCH | /exercises/{exercise_id} | Sí | admin | Modificar ejercicio |
| DELETE | /exercises/{exercise_id} | Sí | admin | Eliminar (204) |
| GET | /exercises/by-guide/{guide_id} | No* | - | Listar ejercicios de una guía |
| GET | /exercises/{exercise_id} | No* | - | Obtener ejercicio |
| GET | /exercises/all | Sí | admin | Listado completo (filtrable) |

### GET /exercises/by-guide/{guide_id}
```json
[
  {"id": "...","title": "Construir imagen base","type": "dockerfile","difficulty": "medio"},
  {"id": "...","title": "Listar archivos","type": "command","difficulty": "fácil"}
]
```

### GET /exercises/{exercise_id}
```json
{
  "id": "...",
  "guide_id": "...",
  "title": "Construir imagen base",
  "content_html": "<p>Crea un Dockerfile...</p>",
  "expected_answer": "FROM python:3.12-slim",
  "ai_context": null,
  "type": "dockerfile",
  "difficulty": "medio",
  "enable_structural_validation": true,
  "enable_llm_feedback": true
}
```

### GET /exercises/all
```json
[
  {
    "id": "...",
    "guide_id": "...",
    "title": "Construir imagen base",
    "type": "dockerfile",
    "difficulty": "medio",
    "enable_structural_validation": true,
    "enable_llm_feedback": true,
    "is_active": true
  },
  {
    "id": "...",
    "guide_id": "...",
    "title": "Ejercicio desactivado",
    "type": "command",
    "difficulty": null,
    "enable_structural_validation": false,
    "enable_llm_feedback": false,
    "is_active": false
  }
]
```

### PATCH /exercises/{exercise_id}
Request body (parcial):
```json
{
  "title": "Construir imagen base (optimizada)",
  "expected_answer": "FROM python:3.12-slim AS base"
}
```
Response:
```json
{
  "id": "...",
  "title": "Construir imagen base (optimizada)",
  "difficulty": "medio",
  "type": "dockerfile",
  "enable_structural_validation": true,
  "enable_llm_feedback": true
}
```

Notas:
- Query param `only_active=true` en `/exercises/all` filtra activos.
- Campos `ai_context` y `expected_answer` pueden ser `null`.

---
## 5. Feedback LLM
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | /feedback/attempt | Sí | student/admin | Generar feedback (valida estructura antes de LLM) |
| POST | /feedback/chat | Sí | student/admin | Conversación contextual **por intento** |
| GET | /feedback/history | Sí | student/admin | Historial vectorial (filtrable por intento) |

### POST /feedback/attempt
Request body:
```json
{
  "exercise_id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11",
  "submitted_answer": "FROM python:3.12-slim\nRUN pip install flask"
}
```
Response (200):
```json
{
  "attempt_id": "3d1f0f7a-5e3d-4d8a-a7a4-9d1e6b2c8f90",
  "content_md": "## Fortalezas...",
  "metrics": {
    "model": "gemini-2.0-flash",
    "prompt_tokens": 480,
    "completion_tokens": 120,
    "latency_ms": 620.4,
    "quality_flags": {
      "similarity_used": true,
      "truncated": false,
      "stub_mode": false,
      "specialization_applied": true,
      "generic_feedback": false
    }
  }
}
```

### POST /feedback/chat ⚠️ CAMBIO IMPORTANTE
**BREAKING CHANGE:** Ahora requiere `attempt_id` para aislar conversaciones por intento.

Request body:
```json
{
  "exercise_id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11",
  "attempt_id": "3d1f0f7a-5e3d-4d8a-a7a4-9d1e6b2c8f90",
  "message": "¿Cómo puedo reducir el tamaño de la imagen?"
}
```

Response (200):
```json
{
  "content_md": "Puedes mejorar el Dockerfile usando multi-stage...",
  "metrics": {
    "model": "gemini-2.0-flash",
    "prompt_tokens": 190,
    "completion_tokens": 52,
    "latency_ms": 310.2,
    "quality_flags": {"similarity_used": true, "stub_mode": false, "truncated": false}
  }
}
```

**Validaciones:**
- El `attempt_id` debe existir
- El `attempt_id` debe pertenecer al usuario autenticado
- El `attempt_id` debe corresponder al `exercise_id`

**Errores posibles:**
- `404`: Intento no encontrado o no autorizado
- `400`: El intento no corresponde al ejercicio

### GET /feedback/history
**Parámetros query:**
- `exercise_id` (requerido): UUID del ejercicio
- `attempt_id` (opcional): UUID del intento para filtrar

**Ejemplos:**

Historial de todos los intentos del ejercicio:
```
GET /feedback/history?exercise_id=9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11
```

Historial solo del intento específico:
```
GET /feedback/history?exercise_id=9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11&attempt_id=3d1f0f7a-5e3d-4d8a-a7a4-9d1e6b2c8f90
```

Response (200):
```json
[
  {"type": "attempt", "content_md": "FROM python:3.12-slim", "created_at": "2025-11-15T10:00:00Z"},
  {"type": "feedback", "content_md": "## Fortalezas...", "created_at": "2025-11-15T10:00:05Z"},
  {"type": "question", "content_md": "¿Cómo reducir tamaño?", "created_at": "2025-11-15T10:01:00Z"},
  {"type": "answer", "content_md": "Puedes usar multi-stage...", "created_at": "2025-11-15T10:01:02Z"}
]
```

### 5.1 Notas de Uso
- `attempt` requiere `{ "exercise_id": str, "submitted_answer": str }`.
- **`chat` requiere `{ "exercise_id": str, "attempt_id": str, "message": str }`** ← CAMBIO
- Si falla validación estructural (command/dockerfile) se aborta sin consumir LLM.
- Estructura típica del `content_md` de feedback: encabezados Markdown como "## Fortalezas", "## Oportunidades de mejora", "## Sugerencias prácticas" (según aplique). Puede omitir secciones vacías. No incluye pregunta de seguimiento final; el cierre es conciso y motivador (sin signos de interrogación para forzar respuesta).
- **Aislamiento por intento:** Cada conversación de chat está asociada a un intento específico. No se mezcla contexto de intentos anteriores.

### 5.2 Cambios en el Sistema de Chat (Noviembre 2025)

#### Problema Resuelto
Anteriormente el chat mezclaba contexto de **todos los intentos** del mismo ejercicio, causando:
- Respuestas confusas con información de intentos anteriores
- Pérdida de coherencia en la conversación
- Mensajes repetitivos sin contexto relevante

#### Solución Implementada
- **Aislamiento estricto por intento:** Cada `attempt_id` tiene su propia conversación independiente
- **Validación de pertenencia:** El sistema verifica que el intento pertenece al usuario
- **Historial filtrado:** Solo se recupera contexto del intento actual
- **Búsqueda de similaridad limitada:** Solo busca en mensajes del mismo intento

#### Optimizaciones Adicionales
1. **Deduplicación inteligente:** Elimina mensajes duplicados o muy similares (85% de similitud)
2. **Detección de patrones repetitivos:** Alerta al LLM cuando detecta 3+ respuestas similares
3. **Control de mensajes off-topic:** Detecta y redirige preguntas fuera del tema educativo
4. **Limpieza automática:** Mantiene máximo 80 entradas por usuario/ejercicio
5. **Historial optimizado:** Solo últimos 8 mensajes de pregunta/respuesta del intento actual

#### Impacto en el Frontend
**Antes:**
```typescript
// ❌ Antiguo - Ya no funciona
await fetch('/api/feedback/chat', {
  method: 'POST',
  body: JSON.stringify({
    exercise_id: exerciseId,
    message: userMessage
  })
})
```

**Ahora:**
```typescript
// ✅ Nuevo - Requerido
await fetch('/api/feedback/chat', {
  method: 'POST',
  body: JSON.stringify({
    exercise_id: exerciseId,
    attempt_id: currentAttemptId, // ← Debe provenir del intento activo
    message: userMessage
  })
})
```

**Gestión del Estado:**
```typescript
// El frontend debe mantener el attempt_id del intento en curso
const [currentAttempt, setCurrentAttempt] = useState<{
  id: string;
  exercise_id: string;
  // ... otros campos
}>(null);

// Al crear un nuevo intento
const response = await createAttempt(exerciseId, answer);
setCurrentAttempt(response);

// Al chatear, usar el attempt_id del intento actual
const chatResponse = await sendChatMessage({
  exercise_id: currentAttempt.exercise_id,
  attempt_id: currentAttempt.id,
  message: userMessage
});
```

**Recuperar Historial:**
```typescript
// Historial del intento actual solamente
const history = await fetch(
  `/api/feedback/history?exercise_id=${exerciseId}&attempt_id=${attemptId}`
);

// O historial de todos los intentos (para vista global)
const allHistory = await fetch(
  `/api/feedback/history?exercise_id=${exerciseId}`
);
```

### 5.3 Errores de Validación Estructural (422)
Formato general:
```json
{
  "detail": {
    "message": "Validación estructural falló (command)",
    "errors": ["Comando no permitido: foo"],
    "structure_valid": false
  }
}
```
Dockerfile ejemplo:
```json
{
  "detail": {
    "message": "Validación estructural falló (dockerfile)",
    "errors": ["La primera instrucción debe ser FROM", "Falta instrucción FROM"],
    "warnings": [],
    "structure_valid": false
  }
}
```
Frontend:
1. Mostrar `detail.message`.
2. Listar `detail.errors`.
3. Warnings son informativos.
4. No reintentar igual sin cambios.

---
## 6. Progreso
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | /progress/complete | Sí | student/admin | Marca guía completada |
| GET | /progress/completed | Sí | student/admin | Listar guías completadas |
| GET | /progress/guides | Sí | student/admin | Resumen progreso por guía |
| GET | /progress/overview | Sí | student/admin | Resumen global (totales + guías) |

### POST /progress/complete
```json
{
  "id": "5c2d8f40-bd12-4b8d-9d55-3f2a6be91a10",
  "guide_id": "2c9b2d4d-6d9a-4a8f-8231-0a4d13e1c222",
  "user_id": "8b7c8c0e-7c3d-4c1c-af2b-9d9b2f9f1a33",
  "completed_at": "2025-09-13T10:20:00Z"
}
```

### GET /progress/guides
```json
[
  {"guide_id": "2c9...","title": "Introducción a Docker","topic": "docker","total_exercises": 5,"completed_exercises": 3},
  {"guide_id": "...","title": "CLI Básica","topic": "linux","total_exercises": 4,"completed_exercises": 4}
]
```

### GET /progress/overview (nuevo)
Query params:
- `include_exercises=true` (opcional). Si se incluye, añade arreglo compacto de ejercicios dentro de cada guía.

Ejemplo sin `include_exercises`:
```json
{
  "totals": {
    "total_guides": 5,
    "completed_guides": 2,
    "total_exercises": 42,
    "completed_exercises": 17,
    "percent_exercises": 40.48
  },
  "guides": [
    {
      "guide_id": "7f1...",
      "title": "Introducción a Docker",
      "order": 1,
      "total_exercises": 10,
      "completed_exercises": 6,
      "percent": 60.0,
      "completed": false
    }
  ]
}
```

Ejemplo con `include_exercises=true`:
```json
{
  "totals": {
    "total_guides": 2,
    "completed_guides": 1,
    "total_exercises": 14,
    "completed_exercises": 9,
    "percent_exercises": 64.29
  },
  "guides": [
    {
      "guide_id": "7f1...",
      "title": "Introducción a Docker",
      "order": 1,
      "total_exercises": 10,
      "completed_exercises": 6,
      "percent": 60.0,
      "completed": false,
      "exercises": [
        {"exercise_id": "ex1...", "title": "Construir imagen base", "completed": true},
        {"exercise_id": "ex2...", "title": "Listar capas", "completed": false}
      ]
    },
    {
      "guide_id": "9ab...",
      "title": "CLI Básica",
      "order": 2,
      "total_exercises": 4,
      "completed_exercises": 4,
      "percent": 100.0,
      "completed": true,
      "exercises": [
        {"exercise_id": "ex10...", "title": "Listar archivos", "completed": true}
      ]
    }
  ]
}
```

Detalles:
- `percent` y `percent_exercises` redondeados a 2 decimales.
- `completed_guides` cuenta guías donde `completed_exercises == total_exercises` (y total_exercises > 0).
- Clave `exercises` sólo se incluye si se pasa `include_exercises=true`.

---
## 7. Seed de Datos de Prueba
Archivo: `seed_test_data.sql`

Uso recomendado sólo en entorno local de desarrollo para poblar:
- 3 guías activas (CLI, Docker, Conceptos)
- Ejercicios command, dockerfile y conceptuales
- Attempts de ejemplo (uno conceptual completo, uno command completo, uno dockerfile incompleto)
- Una guía marcada como completada

Pasos:
1. Crear tablas (migraciones / schema inicial).
2. Abrir el editor SQL de Supabase (o usar `psql`).
3. Pegar el contenido de `seed_test_data.sql` y ejecutar.
4. Ajustar `user_id` (`test-user-...`) para que coincida con un usuario real autenticable en tu proyecto (o crea un usuario con ese UUID en la tabla `users`).

Advertencias:
- Los `DELETE` iniciales están comentados; descoméntalos si quieres limpiar, pero evitar en entornos compartidos.
- Si existen UUID duplicados fallará la inserción: cambia los IDs conflictivos.
- No ejecutar en producción: datos pedagógicos sintéticos.
- El attempt dockerfile incompleto sirve para probar porcentajes parciales en `/progress/overview`.

Frontend/testing:
- Después de hacer login con el usuario ajustado, llamar a `/api/v1/progress/overview` para verificar números.
- Crear nuevos attempts y observar cómo cambian `completed_exercises` y el auto-marcado de guías.

Próximo paso sugerido (no implementado aún): script de carga automatizada (p.ej. `scripts/load_seed.py`).

---
## 8. Estado LLM
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | /llm/status | Sí | student/admin | Estado operacional |

```json
{
  "model": "gemini-2.0-flash",
  "temperature": 0.3,
  "stub_mode": false,
  "api_key_present": true,
  "similarity_enabled": true,
  "prompt_budget_chars": 6000,
  "lazy_attempts": 1,
  "last_lazy_error": null,
  "last_lazy_time": "2025-09-13T09:59:00Z"
}
```

---
## 9. Modelos (Resumen)
### 8.1 Exercise
```json
{
  "id": "uuid",
  "guide_id": "uuid",
  "title": "string",
  "content_html": "string|null",
  "expected_answer": "string|null",
  "ai_context": "string|null",
  "type": "command|dockerfile|conceptual",
  "difficulty": "string|null",
  "enable_structural_validation": true,
  "enable_llm_feedback": true
}
```

### 8.2 Attempt
```json
{
  "id": "uuid",
  "exercise_id": "uuid",
  "user": {"id": "uuid", "name": "string", "email": "user@example.com", "role": "student|admin"},
  "submitted_answer": "string",
  "structural_validation_passed": true,
  "structural_validation_errors": [],
  "structural_validation_warnings": [],
  "llm_feedback": "markdown|null",
  "completed": false,
  "created_at": "2025-11-15T10:00:00Z"
}
```

### 8.3 FeedbackAttemptOut
```json
{
  "attempt_id": "uuid",
  "content_md": "markdown feedback",
  "metrics": {
    "model": "string",
    "prompt_tokens": 120,
    "completion_tokens": 85,
    "latency_ms": 450.2,
    "quality_flags": {"similarity_used": true, "truncated": false}
  }
}
```

---
## 9. Flags LLM
| Campo | Significado |
|-------|-------------|
| stub_mode | No hay cliente real (sin API key) |
| similarity_used | Se inyectó contexto similar |
| truncated | Prompt excedió presupuesto |
| specialization_applied | Se aplicó contexto pedagógico |
| generic_feedback | Heurística de feedback genérico |
 

---
## 10. Errores Comunes
| Código | Caso |
|--------|------|
| 400 | Feature desactivada / payload inválido |
| 401 | Token ausente / inválido |
| 403 | Rol insuficiente |
| 404 | Recurso inexistente |
| 422 | Validación estructural fallida (command/dockerfile) |

---
## 11. Recomendaciones Frontend
- Cachear `/users/me` tras login.
- Mostrar aviso si `stub_mode=true`.
- Plegar métricas detrás de un panel avanzado.
- No mostrar warnings estructurales como errores bloqueantes.

---
## 12. Versionado y Evolución
- Cabecera opcional `X-Client-Version`.
- Futuro: filtros métricas, panel admin avanzado.

---
## 13. Métricas LLM – GET /metrics/overview (admin)
Query params: `limit` (default 200)
```json
{
  "items": [
    {
      "id": "5f5d3e4c-2c1a-4a8d-9d44-11aa22bb33cc",
      "user_id": "8b7c8c0e-7c3d-4c1c-af2b-9d9b2f9f1a33",
      "exercise_id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11",
      "attempt_id": "3d1f0f7a-5e3d-4d8a-a7a4-9d1e6b2c8f90",
      "model": "gemini-2.0-flash",
      "prompt_tokens": 480,
      "completion_tokens": 120,
      "latency_ms": 620.4,
      "quality_flags": {"similarity_used": true, "truncated": false, "stub_mode": false},
      "created_at": "2025-09-13T10:30:00Z",
      "user": {"id": "8b7c8c0e-7c3d-4c1c-af2b-9d9b2f9f1a33", "name": "Alice", "email": "alice@example.com", "role": "student"},
      "exercise": {"id": "9a3f6d40-3fb2-45d4-9c7d-76c9ea5f1d11", "title": "Construir imagen base", "type": "dockerfile", "difficulty": "medio"}
    }
  ],
  "count": 1
}
```

Notas:
- `user` / `exercise` pueden ser `{}` si el registro fue eliminado.
- Limitar visualización (paginación futura).

---
Documento operativo para frontend. Mantener sincronizado con cambios en FastAPI.
