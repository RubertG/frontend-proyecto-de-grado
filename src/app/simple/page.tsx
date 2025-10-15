"use client";
import * as React from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function Page() {
  const [value, setValue] = React.useState("<p>Demo inicial</p>");
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Demo Simple Editor</h1>
      <SimpleEditor value={value} onChange={setValue} placeholder="Escribe aquí..." />
      <div className="mt-4 border rounded p-3 text-sm bg-background">
        <h2 className="font-medium mb-2">HTML resultante:</h2>
        <pre className="whitespace-pre-wrap break-words">{value}</pre>
      </div>
    </main>
  );
}
