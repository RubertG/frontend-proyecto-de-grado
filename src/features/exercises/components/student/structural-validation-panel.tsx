"use client";
import React from 'react';
import { useExerciseRuntimeStore } from '@/shared/stores/exercise-runtime-store';
import { AlertTriangle } from 'lucide-react';

interface StructuralValidationPanelProps {
  type: 'command' | 'dockerfile' | 'conceptual' | 'compose';
}

export function StructuralValidationPanel({ type }: StructuralValidationPanelProps) {
  // Hooks siempre primero
  const validation = useExerciseRuntimeStore(s => s.structuralValidation);

  // Sólo aplica a ejercicios con validación estructural
  if (!(type === 'command' || type === 'dockerfile')) return null;
  // Mostrar sólo cuando la validación falló.
  if (validation.status !== 'failed') return null;
  const errs = validation.errors;
  if (!errs || errs.length === 0) return null;
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-destructive text-sm space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5" />
        <div className="font-medium">{validation.message || 'Errores de validación estructural'}</div>
      </div>
      <ul className="list-disc ml-5 space-y-1 marker:text-destructive">
        {errs.map((e,i)=>(<li key={i} className="leading-snug">{e}</li>))}
      </ul>
    </div>
  );
}