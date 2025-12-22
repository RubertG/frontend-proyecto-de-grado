/**
 * @fileoverview API de gestión de attempts (intentos de resolución de ejercicios).
 *
 * FLUJO DE EVALUACIÓN:
 * 1. Estudiante envía intento via createAttempt()
 * 2. Backend valida estructura (syntax, formato, etc.)
 * 3. Si enable_llm_feedback=true, genera feedback con IA via generateAttemptFeedback()
 * 4. Estudiante puede chatear con IA via sendChatMessage() para aclaraciones
 * 5. Historial completo disponible via fetchFeedbackHistory()
 *
 * VALIDACIÓN ESTRUCTURAL:
 * - Para ejercicios tipo 'command': verifica sintaxis de comandos
 * - Para 'dockerfile': valida estructura Docker
 * - Para 'compose': valida sintaxis YAML
 * - Para 'conceptual': sin validación estructural
 *
 * NOTA: Los attempts quedan registrados permanentemente para tracking de progreso.
 */
import { apiFetch } from '@/shared/api/http-client';
import {
  AttemptsListSchema,
  AttemptSchema,
  FeedbackAttemptOutSchema,
  FeedbackHistorySchema,
  ChatResponseSchema,
} from '@/shared/api/schemas';
import { z } from 'zod';

export type AttemptsList = z.output<typeof AttemptsListSchema>;
type AttemptsListInput = z.input<typeof AttemptsListSchema>;

export async function fetchAttemptsByExercise(exerciseId: string): Promise<AttemptsList> {
  const raw = await apiFetch<AttemptsListInput>(`/attempts/by-exercise/${exerciseId}`, {
    schema: AttemptsListSchema,
  });
  // raw ya validado; casteamos a output (transformations aplicadas por schema)
  return raw as AttemptsList;
}

// Admin: listado global con filtros opcionales exercise_id, user_id, limit
export async function fetchAttemptsAdminAll(params: {
  exerciseId?: string;
  userId?: string;
  limit?: number;
}): Promise<AttemptsList> {
  const sp = new URLSearchParams();
  if (params.exerciseId) sp.set('exercise_id', params.exerciseId);
  if (params.userId) sp.set('user_id', params.userId);
  if (params.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  const url = `/attempts/admin/all${qs ? `?${qs}` : ''}`;
  const raw = await apiFetch<AttemptsListInput>(url, { schema: AttemptsListSchema });
  return raw as AttemptsList;
}

/**
 * Input para crear un nuevo intento de resolución de ejercicio.
 */
export interface CreateAttemptInput {
  /** ID del ejercicio a resolver */
  exercise_id: string;
  /** Código/texto enviado por el estudiante */
  submitted_answer: string;
  /** Marca el ejercicio como completado (opcional, default: false) */
  completed?: boolean;
}

/**
 * Crea un nuevo attempt y ejecuta validación estructural automática.
 *
 * FLUJO:
 * 1. Backend recibe el código y ejecuta validadores según tipo de ejercicio
 * 2. Retorna attempt con campos:
 *    - structural_validation_passed: true/false/null
 *    - structural_validation_errors: array de strings con errores bloqueantes
 * 3. Si validación falla, el feedback LLM NO se genera hasta que se corrija
 *
 * @param input - Datos del intento a crear
 * @returns Attempt creado con estado de validación
 */
export async function createAttempt(input: CreateAttemptInput) {
  const payload = { completed: false, ...input };
  return apiFetch('/attempts/', {
    method: 'POST',
    body: JSON.stringify(payload),
    schema: AttemptSchema,
  });
}

/**
 * Input para generar feedback automático con LLM.
 */
export interface GenerateFeedbackInput {
  /** ID del ejercicio */
  exercise_id: string;
  /** Código enviado por el estudiante */
  submitted_answer: string;
}

/**
 * Genera feedback inteligente usando el sistema LLM del backend.
 *
 * FUNCIONAMIENTO:
 * - Backend usa el ejercicio completo como contexto (enunciado, solución esperada, tips)
 * - Envía prompt estructurado a la API de LLM (Claude/GPT)
 * - Retorna feedback en Markdown con análisis educativo:
 *   * Qué está bien
 *   * Qué puede mejorar
 *   * Sugerencias pedagógicas sin dar la respuesta directa
 *
 * IMPORTANTE:
 * - Solo se ejecuta si exercise.enable_llm_feedback=true
 * - Requiere que structural_validation_passed=true (excepto conceptuales)
 * - El feedback se guarda asociado al attempt para historial
 *
 * @param input - Datos para generar feedback
 * @returns Feedback generado con metadata
 */
export async function generateAttemptFeedback(input: GenerateFeedbackInput) {
  const { exercise_id, submitted_answer } = input;
  const payload = { exercise_id, submitted_answer };
  return apiFetch('/feedback/attempt', {
    method: 'POST',
    body: JSON.stringify(payload),
    schema: FeedbackAttemptOutSchema,
  });
}

export async function fetchFeedbackHistory(exerciseId: string, attemptId?: string) {
  const url = attemptId
    ? `/feedback/history?exercise_id=${exerciseId}&attempt_id=${attemptId}`
    : `/feedback/history?exercise_id=${exerciseId}`;
  return apiFetch(url, { schema: FeedbackHistorySchema });
}

/**
 * Input para enviar mensaje en el chat interactivo con la IA.
 */
export interface ChatMessageInput {
  /** ID del ejercicio */
  exercise_id: string;
  /** ID del attempt específico */
  attempt_id: string;
  /** Mensaje/pregunta del estudiante */
  message: string;
}

/**
 * Envía un mensaje al asistente IA y obtiene respuesta contextual.
 *
 * CONTEXTO MANTENIDO:
 * - Backend mantiene historial completo del chat para este attempt
 * - Cada mensaje tiene contexto del ejercicio + intento + conversación previa
 * - IA puede referenciar el código enviado y el feedback previo
 *
 * CASOS DE USO:
 * - "No entiendo por qué mi comando falla"
 * - "Puedes darme una pista sobre el volumen?"
 * - "Esta parte del feedback no me queda clara"
 *
 * LIMITACIONES:
 * - No da la solución completa (prompts configurados para guiar, no resolver)
 * - Respuestas en Markdown para mejor legibilidad
 *
 * @param input - Mensaje a enviar
 * @returns Respuesta del asistente en formato Markdown
 */
export async function sendChatMessage(input: ChatMessageInput) {
  const payload = {
    exercise_id: input.exercise_id,
    attempt_id: input.attempt_id,
    message: input.message,
  };
  return apiFetch('/feedback/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
    schema: ChatResponseSchema,
  });
}
