# Sistema de Evaluación con LLM

## 📖 Visión General

El sistema de evaluación inteligente usa modelos de lenguaje (LLMs) como Claude o GPT para proporcionar feedback educativo personalizado a los estudiantes. Este documento explica en detalle cómo funciona la integración y el flujo completo.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│  AttemptSubmissionForm                                      │
│    ↓ createAttempt()                                        │
│  Backend API (FastAPI)                                       │
│    ↓ Validación Estructural                                 │
│    ├─ ✅ Passed → generateAttemptFeedback()                 │
│    └─ ❌ Failed → Retorna errores bloqueantes               │
│                                                              │
│  generateAttemptFeedback()                                  │
│    ↓ POST /feedback/attempt                                 │
│  Backend construye prompt contextual                         │
│    ↓                                                         │
│  ┌────────────────────────────────────────┐                 │
│  │  Prompt Template:                      │                 │
│  │  - Enunciado del ejercicio             │                 │
│  │  - Solución esperada (si existe)       │                 │
│  │  - Código enviado por estudiante       │                 │
│  │  - Instrucciones pedagógicas           │                 │
│  │  - Restricciones (no dar respuesta)    │                 │
│  └────────────────────────────────────────┘                 │
│    ↓                                                         │
│  API de LLM (Claude/GPT)                                     │
│    ↓ Streaming response                                     │
│  Feedback en Markdown                                        │
│    ↓ Guardado en DB (llm_feedback)                          │
│  Frontend renderiza con react-markdown                       │
│    ↓                                                         │
│  FeedbackChat                                                │
│    └─ Chat interactivo disponible                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Componentes Clave

### 1. API Endpoints

#### `POST /feedback/attempt`

**Propósito**: Genera feedback inicial para un attempt recién enviado.

**Request**:
```typescript
{
  exercise_id: string;      // ID del ejercicio
  submitted_answer: string; // Código enviado por el estudiante
}
```

**Response**:
```typescript
{
  feedback_md: string;      // Feedback en Markdown
  attempt_id: string;       // ID del attempt actualizado
  model_used: string;       // Ej: "claude-3-5-sonnet"
  tokens_used: number;      // Tokens consumidos
}
```

**Lógica Backend** (pseudocódigo):
```python
def generate_feedback(exercise_id, submitted_answer):
    # 1. Obtener ejercicio completo de DB
    exercise = db.get_exercise(exercise_id)
    
    # 2. Construir prompt contextual
    prompt = f"""
    Eres un tutor experto en DevOps. Evalúa la siguiente respuesta:
    
    EJERCICIO:
    {exercise.content_html}
    
    SOLUCIÓN ESPERADA (no compartir directamente):
    {exercise.expected_solution}
    
    RESPUESTA DEL ESTUDIANTE:
    {submitted_answer}
    
    INSTRUCCIONES:
    - Identifica lo que está bien
    - Señala lo que puede mejorar
    - Da sugerencias pedagógicas SIN dar la respuesta completa
    - Usa Markdown para formato claro
    - Tono amigable y motivador
    """
    
    # 3. Llamar a API de LLM
    response = llm_client.generate(prompt, model="claude-3-5-sonnet")
    
    # 4. Guardar feedback en DB
    db.update_attempt(attempt_id, llm_feedback=response.text)
    
    return {
        "feedback_md": response.text,
        "tokens_used": response.usage.total_tokens
    }
```

#### `POST /feedback/chat`

**Propósito**: Chat interactivo para aclaraciones después del feedback inicial.

**Request**:
```typescript
{
  exercise_id: string;
  attempt_id: string;
  message: string;         // Pregunta del estudiante
}
```

**Response**:
```typescript
{
  content_md: string;      // Respuesta del asistente en Markdown
  role: "assistant";
  model_used: string;
}
```

**Lógica Backend**:
```python
def chat_message(exercise_id, attempt_id, message):
    # 1. Obtener contexto completo
    exercise = db.get_exercise(exercise_id)
    attempt = db.get_attempt(attempt_id)
    chat_history = db.get_chat_history(attempt_id)
    
    # 2. Construir prompt con historial
    messages = [
        {"role": "system", "content": f"Contexto: {exercise.content_html}"},
        {"role": "system", "content": f"Código del estudiante: {attempt.submitted_answer}"},
        {"role": "system", "content": f"Feedback previo: {attempt.llm_feedback}"},
        *chat_history,  # Mensajes previos del chat
        {"role": "user", "content": message}
    ]
    
    # 3. Llamar a LLM con historial
    response = llm_client.chat(messages, model="claude-3-5-sonnet")
    
    # 4. Guardar mensaje en historial
    db.save_chat_message(attempt_id, role="assistant", content=response.text)
    
    return {"content_md": response.text}
```

#### `GET /feedback/history`

**Propósito**: Obtener historial completo de feedback y chat.

**Query Params**:
- `exercise_id`: ID del ejercicio
- `attempt_id`: (opcional) ID de attempt específico

**Response**:
```typescript
{
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>;
}
```

---

### 2. Frontend Integration

#### Hook: `useGenerateFeedbackMutation`

```typescript
// src/features/attempts/hooks/use-attempts.ts

export function useGenerateFeedbackMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: generateAttemptFeedback,
    onSuccess: (data, variables) => {
      // Invalidar queries para refetch con nuevo feedback
      queryClient.invalidateQueries({
        queryKey: ['attempts', 'by-exercise', variables.exercise_id]
      });
      
      // Opcional: agregar feedback a cache optimista
      queryClient.setQueryData(['attempt', data.attempt_id], (old) => ({
        ...old,
        llm_feedback: data.feedback_md
      }));
    }
  });
}
```

#### Hook: `useChatMessageMutation`

```typescript
export function useChatMessageMutation(exerciseId: string, attemptId: string) {
  return useMutation({
    mutationFn: (input: { message: string }) => 
      sendChatMessage({ 
        exercise_id: exerciseId, 
        attempt_id: attemptId, 
        message: input.message 
      }),
    onError: (error) => {
      toast.error('Error al enviar mensaje');
    }
  });
}
```

#### Componente: `FeedbackChat`

**Estados clave**:
```typescript
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
const { mutateAsync: sendMessage, isPending } = useChatMessageMutation(exerciseId, attemptId);

async function handleSend(e: FormEvent) {
  e.preventDefault();
  
  // 1. Agregar mensaje del usuario localmente
  const userMessage = { id: Date.now(), role: 'user', content: message };
  setChatMessages(prev => [...prev, userMessage]);
  setMessage('');
  
  // 2. Enviar al backend
  const response = await sendMessage({ message });
  
  // 3. Agregar respuesta del asistente
  const assistantMessage = { 
    id: Date.now() + 1, 
    role: 'assistant', 
    content: response.content_md 
  };
  setChatMessages(prev => [...prev, assistantMessage]);
}
```

---

## 🎯 Flujo Completo de Evaluación

### Paso 1: Usuario Envía Intento

```typescript
// AttemptSubmissionForm.tsx

async function submitAttempt() {
  runtime.setSubmitting(true);
  
  // 1. Crear attempt (incluye validación estructural)
  const attempt = await createAttempt({
    exercise_id: exercise.id,
    submitted_answer: code
  });
  
  // 2. Verificar resultado de validación
  if (attempt.structural_validation_passed === false) {
    // Mostrar errores, NO generar feedback
    runtime.markValidationFailed(
      'Validación estructural falló',
      attempt.structural_validation_errors
    );
    return;
  }
  
  // 3. Si pasa validación y LLM está habilitado
  if (exercise.enable_llm_feedback) {
    runtime.setGenerating(true);
    
    try {
      await genFeedback({ 
        exercise_id: exercise.id, 
        submitted_answer: code 
      });
    } catch (error) {
      toast.error('Error generando feedback');
    } finally {
      runtime.setGenerating(false);
    }
  }
}
```

### Paso 2: Backend Valida y Genera Feedback

```python
# Backend (FastAPI)

@router.post("/attempts/")
async def create_attempt(input: CreateAttemptInput, user: User):
    # 1. Validación estructural
    validation_result = validate_structure(
        exercise.type, 
        input.submitted_answer
    )
    
    # 2. Crear attempt con resultado
    attempt = Attempt(
        exercise_id=input.exercise_id,
        user_id=user.id,
        submitted_answer=input.submitted_answer,
        structural_validation_passed=validation_result.passed,
        structural_validation_errors=validation_result.errors,
        completed=input.completed
    )
    db.add(attempt)
    db.commit()
    
    return attempt

@router.post("/feedback/attempt")
async def generate_feedback(input: FeedbackInput):
    exercise = db.get_exercise(input.exercise_id)
    
    # Construir prompt
    prompt = build_evaluation_prompt(exercise, input.submitted_answer)
    
    # Llamar a LLM
    response = await llm_service.generate(prompt)
    
    # Guardar feedback
    attempt = db.get_latest_attempt(input.exercise_id)
    attempt.llm_feedback = response.text
    db.commit()
    
    return {"feedback_md": response.text}
```

### Paso 3: Frontend Renderiza Feedback

```tsx
// FeedbackChat.tsx

<Bubble role="assistant">
  <article className="prose prose-sm dark:prose-invert">
    <ReactMarkdown 
      rehypePlugins={[rehypeSanitize]} 
      remarkPlugins={[remarkGfm]}
    >
      {attempt.llm_feedback}
    </ReactMarkdown>
  </article>
</Bubble>
```

### Paso 4: Usuario Chatea con IA

```typescript
// Usuario escribe: "¿Por qué mi comando falló?"

const userMsg = { role: 'user', content: '¿Por qué mi comando falló?' };
setChatMessages(prev => [...prev, userMsg]);

const response = await sendChatMessage({
  exercise_id,
  attempt_id,
  message: '¿Por qué mi comando falló?'
});

const assistantMsg = { 
  role: 'assistant', 
  content: response.content_md 
};
setChatMessages(prev => [...prev, assistantMsg]);

// Backend mantiene contexto completo en cada llamada
```

---

## 🔐 Consideraciones de Seguridad

### 1. Sanitización de Inputs

```typescript
// Validar y sanitizar código antes de enviar
function sanitizeCode(code: string): string {
  // Remover caracteres peligrosos
  return code
    .replace(/[<>]/g, '') // Evitar HTML
    .trim()
    .slice(0, 10000); // Límite de caracteres
}
```

### 2. Rate Limiting

```python
# Backend: limitar requests de feedback por usuario
@limiter.limit("5/minute")
@router.post("/feedback/attempt")
async def generate_feedback(...):
    ...
```

### 3. Validación de Markdown

```tsx
// Siempre usar rehype-sanitize para renderizar Markdown
<ReactMarkdown 
  rehypePlugins={[rehypeSanitize]}
  remarkPlugins={[remarkGfm]}
>
  {feedback}
</ReactMarkdown>
```

### 4. Protección de Datos Sensibles

```python
# Backend: NO incluir datos sensibles en prompts
def build_prompt(exercise, submitted_answer):
    # ❌ NO incluir: emails, tokens, datos personales
    # ✅ Solo incluir: contenido educativo y código
    return f"""
    Ejercicio: {sanitize(exercise.content)}
    Código: {sanitize(submitted_answer)}
    """
```

---

## 📊 Monitoreo y Métricas

### Métricas Clave

1. **Tokens Consumidos**: Trackear uso de API LLM
2. **Latencia**: Tiempo de respuesta de generación
3. **Tasa de Error**: Fallos en API de LLM
4. **Calidad de Feedback**: Rating de estudiantes (futuro)

### Implementación

```typescript
// Frontend: enviar métricas a analytics
const startTime = Date.now();

await generateFeedback(input);

const latency = Date.now() - startTime;
analytics.track('feedback_generated', {
  exercise_id,
  latency_ms: latency,
  model: 'claude-3-5-sonnet'
});
```

---

## 🐛 Troubleshooting

### Problema: Feedback no se genera

**Causas comunes**:
1. Validación estructural falló → Revisar `structural_validation_errors`
2. `enable_llm_feedback=false` en ejercicio → Habilitar en admin
3. API de LLM caída → Revisar `/llm/status` endpoint
4. Token expirado → Verificar autenticación

**Debug**:
```typescript
console.log('Attempt:', attempt);
console.log('Validation:', attempt.structural_validation_passed);
console.log('Enable LLM:', exercise.enable_llm_feedback);
```

### Problema: Chat no responde

**Causas**:
1. `attemptId` o `exerciseId` null → Verificar runtime store
2. Backend no encuentra historial → Revisar DB
3. Timeout de API LLM → Reintentar

**Debug**:
```typescript
const { exerciseId, attemptId } = useExerciseRuntimeStore();
console.log('Can chat:', !!(exerciseId && attemptId));
```

### Problema: Feedback tarda mucho

**Optimizaciones**:
1. Usar modelos más rápidos (GPT-3.5 en vez de GPT-4)
2. Reducir tamaño de prompts
3. Implementar streaming de respuestas
4. Cache de respuestas similares

---

## 🚀 Futuras Mejoras

### 1. Streaming de Feedback

```typescript
// Mostrar feedback en tiempo real mientras se genera
async function streamFeedback(input) {
  const stream = await apiFetch('/feedback/attempt/stream', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  
  for await (const chunk of stream) {
    setFeedback(prev => prev + chunk);
  }
}
```

### 2. Multi-Modal Feedback

```typescript
// Incluir imágenes, diagramas, y enlaces
interface FeedbackWithMedia {
  text: string;
  images?: string[];
  diagrams?: string[];
  references?: Array<{ title: string; url: string }>;
}
```

### 3. Feedback Adaptativo

```python
# Ajustar prompt según nivel del estudiante
def build_adaptive_prompt(student_level, exercise):
    if student_level == "beginner":
        return "Usa lenguaje simple y ejemplos básicos..."
    elif student_level == "advanced":
        return "Asume conocimiento previo y profundiza..."
```

---

## 📚 Referencias

- [API de Claude (Anthropic)](https://docs.anthropic.com/)
- [API de OpenAI](https://platform.openai.com/docs/)
- [Best Practices para Prompts Educativos](https://example.com)
- [react-markdown Docs](https://github.com/remarkjs/react-markdown)

---

**Nota**: Este sistema está en constante evolución. Consulta el código fuente para la implementación más actualizada.
