export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { AttemptsIndexClient } from './attempts-index-client';

// Página índice de Intentos: lista ejercicios y link a intentos
export default async function AttemptsIndexPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Intentos (por ejercicio)</h1>
        <p className="text-xs text-muted-foreground">Filtra y accede a los intentos realizados por los estudiantes.</p>
      </div>
      <AttemptsIndexClient />
      <p className="text-xs text-muted-foreground">Para añadir conteos de intentos se necesitará un endpoint agregado.</p>
    </div>
  );
}
