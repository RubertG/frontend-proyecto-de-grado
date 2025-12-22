/**
 * @fileoverview Store Zustand para gestionar el estado runtime de resolución de ejercicios.
 *
 * RESPONSABILIDADES:
 * - Trackear el ejercicio y attempt activo
 * - Gestionar estados de carga (submitting, generating feedback)
 * - Controlar el flujo de validación estructural
 * - Mantener snapshot del attempt actual para UI optimista
 *
 * FLUJO TÍPICO:
 * 1. Usuario abre ejercicio: setExercise(id)
 * 2. Usuario envía código: setSubmitting(true) -> createAttempt
 * 3. Backend valida: markValidationPassed() o markValidationFailed()
 * 4. Si pasa validación: setGenerating(true) -> generateFeedback
 * 5. Usuario puede chatear si hay feedback
 * 6. Al salir del ejercicio: reset()
 *
 * VALIDACIÓN ESTRUCTURAL:
 * - 'idle': Estado inicial, sin validación ejecutada
 * - 'passed': Estructura correcta, puede generar feedback LLM
 * - 'failed': Errores bloqueantes, feedback LLM no se genera
 */
import { create } from 'zustand';

import type { Attempt } from '@/shared/api/schemas';

/**
 * Estado de validación estructural del código enviado.
 */
interface StructuralValidationState {
  /** Estado actual de la validación */
  status: 'idle' | 'passed' | 'failed';
  /** Mensaje descriptivo del resultado (opcional) */
  message?: string;
  /** Lista de errores bloqueantes encontrados */
  errors: string[];
}

/**
 * Store para trackear el estado de resolución de un ejercicio.
 *
 * CAMPOS PRINCIPALES:
 * - exerciseId: Ejercicio activo en la sesión del usuario
 * - attemptId: Último attempt creado (para chat y refetch)
 * - isSubmitting: Flag de carga mientras se crea el attempt
 * - isGeneratingFeedback: Flag de carga mientras LLM genera feedback
 * - structuralValidation: Estado de validación del código (bloqueante para feedback)
 * - attemptSnapshot: Copia del attempt actual para UI optimista
 *
 * ACCIONES:
 * - setExercise: Cambia ejercicio activo y resetea validación
 * - setAttempt: Registra ID del attempt recién creado
 * - markValidationPassed/Failed: Actualiza estado de validación
 * - reset: Limpia todo el estado (llamar al desmontar componente)
 */
interface ExerciseRuntimeState {
  exerciseId: string | null;
  attemptId: string | null;
  isSubmitting: boolean;
  isGeneratingFeedback: boolean;
  structuralValidation: StructuralValidationState;
  attemptSnapshot: Attempt | null;
  setExercise: (id: string | null) => void;
  setAttempt: (id: string | null) => void;
  setAttemptSnapshot: (a: Attempt | null) => void;
  setSubmitting: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  markValidationPassed: () => void;
  markValidationFailed: (message: string | undefined, errors: string[]) => void;
  resetValidation: () => void;
  reset: () => void;
}

export const useExerciseRuntimeStore = create<ExerciseRuntimeState>((set) => ({
  exerciseId: null,
  attemptId: null,
  isSubmitting: false,
  isGeneratingFeedback: false,
  structuralValidation: { status: 'idle', errors: [] },
  attemptSnapshot: null,
  setExercise: (id) =>
    set({ exerciseId: id, attemptId: null, structuralValidation: { status: 'idle', errors: [] } }),
  setAttempt: (id) => set({ attemptId: id }),
  setAttemptSnapshot: (a) => set({ attemptSnapshot: a }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setGenerating: (v) => set({ isGeneratingFeedback: v }),
  markValidationPassed: () => set({ structuralValidation: { status: 'passed', errors: [] } }),
  markValidationFailed: (message, errors) =>
    set({ structuralValidation: { status: 'failed', message, errors: [...errors] } }),
  resetValidation: () => set({ structuralValidation: { status: 'idle', errors: [] } }),
  reset: () =>
    set({
      exerciseId: null,
      attemptId: null,
      isSubmitting: false,
      isGeneratingFeedback: false,
      structuralValidation: { status: 'idle', errors: [] },
      attemptSnapshot: null,
    }),
}));
