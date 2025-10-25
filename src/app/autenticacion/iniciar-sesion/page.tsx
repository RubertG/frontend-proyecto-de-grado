"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSessionStore } from '@/shared/stores/session-store';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
	email: z.string().email({ message: 'Email inválido' }),
	password: z.string().min(6, { message: 'Mínimo 6 caracteres' })
});
type FormValues = z.infer<typeof schema>;

export default function IniciarSesionPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { clear } = useSessionStore();
	const queryClient = useQueryClient();
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
	const { handleSubmit, formState } = form;

	async function onSubmit(values: FormValues) {
		try {
			// Llamar directamente a nuestro API endpoint unificado
			const loginResponse = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values)
			});

			if (!loginResponse.ok) {
				const errorData = await loginResponse.json().catch(() => ({}));
				throw new Error(errorData.message || 'Credenciales inválidas');
			}

			// Resetear el estado de logout y limpiar sesión previa
			clear();
			
			// Invalidar todas las queries de autenticación para forzar refetch inmediato
			await queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
			
			// Aguardar brevemente para que las queries se ejecuten
			await new Promise(resolve => setTimeout(resolve, 100));
			
			toast.success('Inicio de sesión exitoso');
			
			// Usar navegación SPA en lugar de reload forzado
			const redirect = searchParams.get('redirect') || '/';
			router.push(redirect);
		} catch (err: unknown) {
			let message = 'Error al iniciar sesión';
			if (err instanceof TypeError && /fetch/i.test(err.message)) {
				message = 'No se pudo conectar con el servidor. Verifica tu red o configuración';
			} else if (err && typeof err === 'object' && 'message' in err) {
				message = String((err as { message?: unknown }).message || message);
			}
			form.setError('password', { type: 'server', message });
			toast.error(message);
		}
	}

	return (
		<main className="max-w-sm mx-auto py-10">
			<h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Contraseña</FormLabel>
								<FormControl>
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={formState.isSubmitting} className="w-full">
						{formState.isSubmitting && <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />}
						Entrar
					</Button>
				</form>
			</Form>
			<p className="mt-4 text-sm">¿No tienes cuenta? <a className="underline" href="/autenticacion/registro">Registrarse</a></p>
		</main>
	);
}
