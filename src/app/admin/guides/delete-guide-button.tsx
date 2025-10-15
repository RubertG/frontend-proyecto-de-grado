"use client";
import { Button } from '@/shared/ui/button';
import { useDeleteGuideMutation } from '@/features/guides/hooks/use-guides';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props { id: string }

export function DeleteGuideButton({ id }: Props) {
  const mutation = useDeleteGuideMutation();
  const router = useRouter();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(id, {
        onSuccess: () => { toast.success('Guía eliminada'); router.refresh(); },
        onError: () => toast.error('Error al eliminar guía')
      })}
    >
      {mutation.isPending && <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />}
      Borrar
    </Button>
  );
}
