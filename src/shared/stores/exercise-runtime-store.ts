import { create } from 'zustand';

import type { Attempt } from '@/shared/api/schemas';

interface StructuralValidationState {
  status: 'idle' | 'passed' | 'failed';
  message?: string;
  errors: string[]; // errores bloqueantes
}

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
  setExercise: (id) => set({ exerciseId: id, attemptId: null, structuralValidation: { status: 'idle', errors: [] } }),
  setAttempt: (id) => set({ attemptId: id }),
  setAttemptSnapshot: (a) => set({ attemptSnapshot: a }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setGenerating: (v) => set({ isGeneratingFeedback: v }),
  markValidationPassed: () => set({ structuralValidation: { status: 'passed', errors: [] } }),
  markValidationFailed: (message, errors) => set({ structuralValidation: { status: 'failed', message, errors: [...errors] } }),
  resetValidation: () => set({ structuralValidation: { status: 'idle', errors: [] } }),
  reset: () => set({ exerciseId: null, attemptId: null, isSubmitting: false, isGeneratingFeedback: false, structuralValidation: { status: 'idle', errors: [] }, attemptSnapshot: null })
}));
