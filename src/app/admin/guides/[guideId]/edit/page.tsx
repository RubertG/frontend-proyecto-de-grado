"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { Switch } from '@/shared/ui/switch';
import { toast } from 'sonner';
import { useGuideQuery, useUpdateGuideMutation } from '@/features/guides/hooks/use-guides';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from '@/shared/ui/Loader';

const schema = z.object({
  title: z.string().min(1),
  topic: z.string().optional(),
  order: z.coerce.number().int().min(0),
  content_html: z.string().optional(),
  is_active: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

export default function EditGuidePage() {
  const params = useParams<{ guideId: string }>();
  const id = params.guideId;
  const { data, isLoading } = useGuideQuery(id);
  const mutation = useUpdateGuideMutation(id);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      topic: '',
      order: 0,
      content_html: '',
      is_active: true
    }
  });
  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (data) {
      reset({ title: data.title, topic: data.topic || '', order: data.order, content_html: data.content_html || '', is_active: data.is_active });
    }
  }, [data, reset]);

  function onSubmit(values: FormValues) {
    mutation.mutate(values, {
      onSuccess: () => { toast.success('Guía actualizada'); router.push('/admin/guides'); },
      onError: () => toast.error('Error al actualizar guía')
    });
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Editar Guía</h1>
      {isLoading && <div><Loader /></div>}
      {!isLoading && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content_html"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido (HTML)</FormLabel>
                  <FormControl>
                    <SimpleEditor value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Activa</FormLabel>
                    <p className="text-xs text-muted-foreground">Visible para estudiantes</p>
                  </div>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />}
                Guardar
              </Button>
              <Button type="button" variant="secondary" onClick={()=>router.back()} disabled={mutation.isPending}>Cancelar</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
