"use client";
import React from 'react';
import type * as MonacoNS from 'monaco-editor';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

export interface MonacoControlledEditorProps {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  height?: number;
  className?: string;
  placeholder?: string;
}

export interface MonacoControlledEditorHandle { focus: () => void }

export const MonacoControlledEditor = React.forwardRef<MonacoControlledEditorHandle, MonacoControlledEditorProps>(function MonacoControlledEditorFn({ value, onChange, language='plaintext', height=220, className, placeholder }, ref) {
  const editorRef = React.useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const handleChange = (val?: string) => {
    onChange(val ?? '');
  };
  const handleMount = (editor: MonacoNS.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    if (typeof ref === 'function') {
      ref({ focus: () => editor.focus() });
    } else if (ref) {
      (ref as React.MutableRefObject<MonacoControlledEditorHandle | null>).current = { focus: () => editor.focus() };
    }
  };
  return (
    <div className={"relative rounded-md border overflow-hidden bg-background " + (className || '')}>
      <MonacoEditor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          overviewRulerLanes: 0,
          folding: false,
          glyphMargin: false,
          fontSize: 12,
          padding: { top: 10, bottom: 10 },
          renderLineHighlight: 'none',
          lineNumbers: 'off',
        }}
        theme="vs-dark"
      />
      {placeholder && !value && (
        <div className="text-xs text-muted-foreground absolute m-2 pointer-events-none select-none">{placeholder}</div>
      )}
    </div>
  );
});