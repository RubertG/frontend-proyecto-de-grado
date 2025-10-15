import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto">
      <section className="text-center py-10 md:py-16 space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Aprende DevOps guiado y con feedback inteligente</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">Explora guías estructuradas, resuelve ejercicios prácticos y recibe retroalimentación asistida por IA para acelerar tu aprendizaje.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/guias">Explorar guías</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/autenticacion/registro">Crear cuenta</Link>
          </Button>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-6 mt-4">
        {[
          { title: 'Contenido estructurado', desc: 'Guías curadas por tema y nivel.' },
          { title: 'Ejercicios prácticos', desc: 'Casos reales y validación automática.' },
          { title: 'Feedback inteligente', desc: 'Asistencia contextual y análisis.' },
        ].map(f => (
          <div key={f.title} className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-1 text-sm tracking-wide uppercase text-muted-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
      <section className="mt-12 md:mt-16 border rounded-lg p-6 md:p-8 bg-muted/30">
        <h2 className="text-xl md:text-2xl font-semibold mb-3">¿Cómo funciona?</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm md:text-base text-muted-foreground">
          <li>Elige una guía y sigue el recorrido recomendado.</li>
          <li>Abre un ejercicio y lee el enunciado.</li>
          <li>Envía tu respuesta y recibe validación estructural.</li>
          <li>Obtén retroalimentación generada por IA cuando esté disponible.</li>
          <li>Avanza y monitorea tu progreso.</li>
        </ol>
      </section>
      <section className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">Listo para comenzar</p>
        <Button asChild size="lg">
          <Link href="/guias">Ver guías disponibles</Link>
        </Button>
      </section>
    </main>
  );
}
