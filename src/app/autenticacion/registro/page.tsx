"use client";
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/shared/auth/supabase-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
	name: z.string().min(2, { message: 'Nombre muy corto' }),
	email: z.string().email({ message: 'Email inválido' }),
	password: z.string().min(6, { message: 'Mínimo 6 caracteres' })
});
type FormValues = z.infer<typeof schema>;

export default function RegistroPage() {
	const router = useRouter();
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } });
	const { handleSubmit, formState } = form;

	async function onSubmit(values: FormValues) {
		try {
			const supabase = supabaseClient();
			const { data, error } = await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { name: values.name } } });
			if (error) throw error;
			if (data.session) {
				toast.success('Registro exitoso');
				router.push('/');
			} else {
				toast.success('Verifica tu correo para activar la cuenta');
				router.push('/autenticacion/iniciar-sesion');
			}
		} catch (err: unknown) {
			let message = 'Error al registrar';
			if (err && typeof err === 'object' && 'message' in err) {
				message = String((err as { message?: unknown }).message || message);
			}
			form.setError('password', { type: 'server', message });
			toast.error(message);
		}
	}

	return (
		<main className="max-w-sm mx-auto py-10">
			<h1 className="text-xl font-semibold mb-4">Registro</h1>
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nombre</FormLabel>
								<FormControl><Input {...field} /></FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl><Input type="email" {...field} /></FormControl>
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
								<FormControl><Input type="password" {...field} /></FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={formState.isSubmitting} className="w-full">
						{formState.isSubmitting && <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />}
						Crear cuenta
					</Button>
				</form>
			</Form>
			<p className="mt-4 text-sm">¿Ya tienes cuenta? <a className="underline" href="/autenticacion/iniciar-sesion">Ingresar</a></p>
		</main>
	);
}
