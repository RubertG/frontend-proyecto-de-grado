"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Carga dinámica sin SSR para Monaco dentro de un componente cliente
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

export interface ReadOnlyCodeProps {
  value: string;
  language?: string;
  height?: number; // altura fija si no se usa autoHeight
  autoHeight?: boolean; // calcula altura basada en número de líneas
  className?: string;
  maxAutoHeight?: number; // límite máximo para autoHeight
  minAutoHeight?: number; // mínimo
}

export function ReadOnlyCode({
  value,
  language = 'plaintext',
  height = 180,
  autoHeight = false,
  className,
  maxAutoHeight = 420,
  minAutoHeight = 80,
}: ReadOnlyCodeProps) {
  // Normalizar \n literales si vienen escapados desde backend
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    // Si contiene secuencias \n pero no verdaderos saltos de línea
    if (value.includes('\\n') && !value.includes('\n')) {
      return value.replace(/\\n/g, '\n');
    }
    return value;
  }, [value]);

  const computedHeight = React.useMemo(() => {
    if (!autoHeight) return height;
    const lineCount = displayValue.split(/\r?\n/).length || 1;
    // Aproximar: 18px por línea + padding vertical (24)
    const h = lineCount * 18 + 24;
    return Math.min(Math.max(h, minAutoHeight), maxAutoHeight);
  }, [autoHeight, displayValue, height, maxAutoHeight, minAutoHeight]);

  return (
    <div className={"rounded-md border overflow-hidden bg-background " + (className || '')}>
      <MonacoEditor
        height={computedHeight}
        defaultLanguage={language}
        value={displayValue}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'off',
          overviewRulerLanes: 0,
          renderLineHighlight: 'none',
          folding: false,
          glyphMargin: false,
          fontSize: 12,
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
        theme="vs-dark"
      />
    </div>
  );
}
