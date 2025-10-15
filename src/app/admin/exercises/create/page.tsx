"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useCreateExerciseMutation } from '@/features/exercises/hooks/use-exercises';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { MonacoControlledEditor } from '@/features/exercises/components/monaco-controlled-editor';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { useRouter } from 'next/navigation';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { toast } from 'sonner';

const schema = z.object({
  guide_id: z.string().uuid(),
  title: z.string().min(1),
  content_html: z.string().optional(),
  expected_answer: z.string().min(1),
  ai_context: z.string().optional(),
  type: z.enum(['command','dockerfile','conceptual']),
  difficulty: z.string().optional(),
  enable_structural_validation: z.boolean().default(true),
  enable_llm_feedback: z.boolean().default(true),
  is_active: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

export default function CreateExercisePage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guide_id: '',
      title: '',
      content_html: '',
      expected_answer: '',
      ai_context: '',
      type: 'command',
      difficulty: '',
      enable_structural_validation: true,
      enable_llm_feedback: true,
      is_active: true
    }
  });
  const { handleSubmit } = form;
  const mutation = useCreateExerciseMutation();
  const router = useRouter();

  function onSubmit(values: FormValues) {
    mutation.mutate(values, {
      onSuccess: () => { toast.success('Ejercicio creado'); router.push('/admin/exercises'); },
      onError: () => toast.error('Error al crear ejercicio')
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nuevo Ejercicio</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="guide_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guide ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expected_answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Respuesta esperada</FormLabel>
                <FormControl>
                  <div className="max-w-4xl">
                    <MonacoControlledEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      language={form.getValues('type') === 'dockerfile' ? 'dockerfile' : (form.getValues('type') === 'command' ? 'shell' : 'plaintext')}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ai_context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Context</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="command">command</SelectItem>
                      <SelectItem value="dockerfile">dockerfile</SelectItem>
                      <SelectItem value="conceptual">conceptual</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 max-w-4xl">
            <FormField
              control={form.control}
              name="enable_structural_validation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Validación estructural</FormLabel>
                    <p className="text-xs text-muted-foreground">Compara estructura vs solución esperada</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_llm_feedback"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Feedback LLM</FormLabel>
                    <p className="text-xs text-muted-foreground">Activa retroalimentación IA</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2 max-w-4xl">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Estado</FormLabel>
                  <p className="text-xs text-muted-foreground">Activo / Inactivo</p>
                </div>
                <FormControl><Switch checked={field.value ?? true} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content_html"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contenido</FormLabel>
                <FormControl>
                  <div className="max-w-4xl">
                    <SimpleEditor value={field.value || ''} onChange={field.onChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />}
              Crear
            </Button>
            <Button type="button" variant="secondary" onClick={()=>router.back()} disabled={mutation.isPending}>Cancelar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
                    
