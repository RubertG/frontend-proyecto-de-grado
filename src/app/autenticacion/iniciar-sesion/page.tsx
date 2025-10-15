"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSessionStore } from '@/shared/stores/session-store';
import { supabaseBrowser } from '@/shared/supabase/client';

const schema = z.object({
	email: z.string().email({ message: 'Email inválido' }),
	password: z.string().min(6, { message: 'Mínimo 6 caracteres' })
});
type FormValues = z.infer<typeof schema>;

export default function IniciarSesionPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const setSession = useSessionStore(s => s.setSession);
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
	const { handleSubmit, formState } = form;

	async function onSubmit(values: FormValues) {
		try {
			const { data, error } = await supabaseBrowser.auth.signInWithPassword(values);
			if (error || !data.session?.access_token) {
				throw new Error(error?.message || 'Credenciales inválidas');
			}
			setSession(null); // trigger refetch /users/me
			toast.success('Inicio de sesión exitoso');
			const redirect = searchParams.get('redirect') || '/';
			router.push(redirect);
		} catch (err: unknown) {
			let message = 'Error al iniciar sesión';
			if (err instanceof TypeError && /fetch/i.test(err.message)) {
				message = 'No se pudo conectar con Supabase. Verifica tu red o variables .env';
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
