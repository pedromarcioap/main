'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IzyBotanicLogo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.02,35.622,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}

export function LoginForm() {
  const { login, googleLogin, loading } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { success, error } = await login(values.email, values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: error === 'auth/invalid-credential' 
            ? 'Email ou senha inválidos.' 
            : 'Ocorreu um erro. Por favor, tente novamente.',
      });
    }
  }

  async function handleGoogleLogin() {
    const { success, error } = await googleLogin();
    if (!success) {
       toast({
        variant: 'destructive',
        title: 'Falha no Login com Google',
        description: 'Não foi possível fazer login com o Google.',
      });
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm border-border/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <IzyBotanicLogo className="w-20 h-20" />
        </div>
        <CardTitle className="font-headline text-4xl">Bem-vindo(a) de Volta!</CardTitle>
        <CardDescription>Faça login para gerenciar suas companheiras verdes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nome@exemplo.com" {...field} />
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Entrar com Email'
              )}
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <Separator />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center bg-card px-2">
            <span className="text-sm text-muted-foreground">OU</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
           {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           ) : (
            <GoogleIcon className="mr-2 h-5 w-5" />
           )}
          Entrar com Google
        </Button>
        <div className="mt-6 text-center text-sm">
          Não tem uma conta?{' '}
          <Link href="/signup" legacyBehavior passHref>
            <a className="underline text-primary-foreground/80 hover:text-primary-foreground">
             Cadastre-se
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
