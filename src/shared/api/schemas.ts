import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin','student'])
});
export type User = z.infer<typeof UserSchema>;

export const GuideSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  topic: z.string().nullable().optional(),
  content_html: z.string().nullable().optional(),
  order: z.number().int(),
  is_active: z.boolean().optional()
});
export type Guide = z.infer<typeof GuideSchema>;

export const GuideListSchema = z.array(GuideSchema.pick({ id:true, title:true, topic:true, order:true, is_active:true }));

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  guide_id: z.string().uuid(),
  title: z.string(),
  content_html: z.string().nullable().optional(),
  expected_answer: z.string().nullable().optional(),
  ai_context: z.string().nullable().optional(),
  type: z.enum(['command','dockerfile','conceptual','compose']),
  difficulty: z.string().nullable().optional(),
  enable_structural_validation: z.boolean(),
  enable_llm_feedback: z.boolean(),
  is_active: z.boolean().optional()
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const ExercisesByGuideSchema = z.array(ExerciseSchema.pick({ id:true, title:true, type:true, difficulty:true, is_active:true }));
export const ExercisesAllSchema = z.array(ExerciseSchema.pick({ id:true, guide_id:true, title:true, type:true, difficulty:true, enable_structural_validation:true, enable_llm_feedback:true, is_active:true }));

// Ejercicios con progreso (endpoint: GET /guides/{guide_id}/exercises-with-progress)
export const ExerciseWithProgressSchema = ExerciseSchema.pick({ id:true, title:true, type:true, difficulty:true, is_active:true }).extend({
  completed: z.boolean(),
  attempts_count: z.number().int()
});
export const ExercisesWithProgressListSchema = z.array(ExerciseWithProgressSchema);

const _AttemptBase = z.object({
  id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin','student'])
  }).optional(),
  submitted_answer: z.string().nullable().optional(),
  structural_validation_passed: z.boolean().nullable().optional(),
  llm_feedback: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  structural_validation_errors: z.array(z.string()).nullable().optional().transform(v => v ?? []),
  structural_validation_warnings: z.array(z.string()).nullable().optional().transform(v => v ?? [])
}).passthrough();

export const AttemptSchema = _AttemptBase.transform((v) => ({
  ...v,
  completed: v.completed ?? false
}));

export type Attempt = z.output<typeof AttemptSchema>; // usar output tras transform
export const AttemptsListSchema = z.array(AttemptSchema);

export const FeedbackAttemptOutSchema = z.object({
  attempt_id: z.string().uuid(),
  content_md: z.string(),
  metrics: z.object({
    model: z.string().optional(),
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    latency_ms: z.number().optional(),
    quality_flags: z.record(z.any()).optional(),
    density_chars_per_token: z.number().optional(),
    lexical_diversity: z.number().optional(),
    avg_sentence_length: z.number().optional()
  }).optional()
});
export type FeedbackAttemptOut = z.infer<typeof FeedbackAttemptOutSchema>;

export const ChatResponseSchema = z.object({
  content_md: z.string(),
  metrics: FeedbackAttemptOutSchema.shape.metrics.optional()
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const FeedbackHistoryItemSchema = z.object({
  type: z.string(),
  content_md: z.string().nullable().optional()
});
export const FeedbackHistorySchema = z.array(FeedbackHistoryItemSchema);

export const LlmStatusSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().optional(),
  stub_mode: z.boolean().optional(),
  api_key_present: z.boolean().optional(),
  similarity_enabled: z.boolean().optional(),
  prompt_budget_chars: z.number().optional(),
  lazy_attempts: z.number().optional(),
  last_lazy_error: z.string().nullable().optional(),
  last_lazy_time: z.string().nullable().optional()
});
export type LlmStatus = z.infer<typeof LlmStatusSchema>;

export const ProgressCompletedGuideSchema = z.object({
  id: z.string().uuid(),
  guide_id: z.string().uuid(),
  user_id: z.string().uuid(),
  completed_at: z.string()
});
export const ProgressCompletedListSchema = z.array(ProgressCompletedGuideSchema);

// Overview de progreso agregado (/progress/overview)
export const ProgressOverviewGuideSchema = z.object({
  guide_id: z.string().uuid(),
  title: z.string(),
  order: z.number().nullable().optional(),
  total_exercises: z.number(),
  completed_exercises: z.number(),
  percent: z.number().optional(),
  completed: z.boolean().optional(),
  // Sólo presente si include_exercises=true
  exercises: z.array(z.object({
    exercise_id: z.string().uuid(),
    title: z.string(),
    completed: z.boolean()
  })).optional()
});
export type ProgressOverviewGuide = z.infer<typeof ProgressOverviewGuideSchema>;

export const ProgressOverviewTotalsSchema = z.object({
  total_guides: z.number(),
  completed_guides: z.number(),
  total_exercises: z.number(),
  completed_exercises: z.number(),
  percent_exercises: z.number().optional()
});
export type ProgressOverviewTotals = z.infer<typeof ProgressOverviewTotalsSchema>;

export const ProgressOverviewSchema = z.object({
  totals: ProgressOverviewTotalsSchema,
  guides: z.array(ProgressOverviewGuideSchema)
});
export type ProgressOverview = z.infer<typeof ProgressOverviewSchema>;

// Métricas agregadas (Dashboard Admin)
// NOTA: Todos optional para tolerar evolución de backend sin romper parse.
export const MetricsOverviewSchema = z.object({
  total_guides: z.number().optional(),
  total_exercises: z.number().optional(),
  active_exercises: z.number().optional(),
  attempts_total: z.number().optional(),
  attempts_completed: z.number().optional(),
  feedback_generated: z.number().optional(),
  users_total: z.number().optional(),
  users_admin: z.number().optional(),
  last_attempt_time: z.string().nullable().optional(),
  last_feedback_time: z.string().nullable().optional()
}).passthrough(); // permitir 'items', 'count' u otros campos del backend sin fallo
export type MetricsOverview = z.infer<typeof MetricsOverviewSchema>;

// Items detallados de métricas LLM (endpoint /metrics/overview con items + count)
export const MetricsOverviewItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  exercise_id: z.string().uuid().optional(),
  attempt_id: z.string().uuid().nullable().optional(),
  model: z.string().nullable().optional(),
  prompt_tokens: z.number().nullable().optional(),
  completion_tokens: z.number().nullable().optional(),
  latency_ms: z.number().nullable().optional(),
  quality_flags: z.record(z.any()).nullable().optional(),
  created_at: z.string().nullable().optional(),
  user: z.object({
    id: z.string().uuid().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin','student']).optional()
  }).passthrough().optional(),
  exercise: z.object({
    id: z.string().uuid().optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    difficulty: z.string().nullable().optional()
  }).passthrough().optional()
}).passthrough();
export type MetricsOverviewItem = z.infer<typeof MetricsOverviewItemSchema>;

export const MetricsOverviewItemsResponseSchema = z.object({
  items: z.array(MetricsOverviewItemSchema),
  count: z.number().optional()
});
export type MetricsOverviewItemsResponse = z.infer<typeof MetricsOverviewItemsResponseSchema>;

// Schema unificado tolerante: puede venir sólo métricas, sólo items o array directo.
export const MetricsOverviewFlexibleSchema = z.union([
  MetricsOverviewItemsResponseSchema, // { items, count }
  MetricsOverviewSchema.extend({
    items: z.array(MetricsOverviewItemSchema).optional(),
    count: z.number().optional()
  }),
  z.array(MetricsOverviewItemSchema) // array plano
]);
export type MetricsOverviewFlexible = z.infer<typeof MetricsOverviewFlexibleSchema>;

