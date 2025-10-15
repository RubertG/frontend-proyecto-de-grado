import { apiFetch } from '@/shared/api/http-client';
import { GuideSchema, type Guide } from '@/shared/api/schemas';
import { sanitizeHtml } from '@/shared/markdown/sanitize-html';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { notFound } from 'next/navigation';

interface Params { guideId: string }

// Next.js 15: params puede ser una Promise; lo aguardamos explícitamente
export default async function AdminGuidePreviewPage({ params }: { params: Promise<Params> }) {
  const { guideId } = await params;
  let guide: Guide;
  try {
    guide = await apiFetch(`/guides/${guideId}`, { schema: GuideSchema });
  } catch {
    return notFound();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{guide.title}</h1>
        <Button asChild variant="secondary"><Link href={`/admin/guides/${guideId}/edit`}>Editar</Link></Button>
      </div>
      <div className="text-sm text-muted-foreground flex gap-4 flex-wrap">
        {guide.topic && <span>Tema: <strong>{guide.topic}</strong></span>}
        <span>Orden: {guide.order}</span>
        <span className={guide.is_active ? 'text-green-600' : 'text-red-600'}>{guide.is_active ? 'Activa' : 'Inactiva'}</span>
      </div>
      <article className="prose max-w-none rich-content">
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(guide.content_html) || '<p><em>Sin contenido</em></p>'
          }}
        />
      </article>
    </div>
  );
}
