'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { IzyBotanicLogo } from '../icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export function LoginForm() {
  const { toast } = useToast();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await loginWithEmail(values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login com Google',
        description: error.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-none bg-card shadow-xl">
      <CardHeader className="text-center">
        <div className="mb-6 flex justify-center">
          <IzyBotanicLogo className="h-20 w-20" />
        </div>
        <CardTitle className="font-headline text-3xl font-bold text-foreground">
          Bem-vindo(a) de Volta!
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Faça login para gerenciar suas companheiras verdes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal text-muted-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-border bg-muted/50"
                      placeholder="nome@exemplo.com"
                      autoComplete="email"
                      {...field}
                      disabled={isLoading || isGoogleLoading}
                    />
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
                  <FormLabel className="font-normal text-muted-foreground">
                    Senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="border-border bg-muted/50"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                      disabled={isLoading || isGoogleLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
              {!isLoading && 'Entrar'}
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <Separator />
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center bg-card px-2">
            <span className="text-sm text-muted-foreground">OU</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-12 w-full justify-center border-border text-base font-normal text-muted-foreground"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <svg
              className="mr-3 h-5 w-5"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 8 244 8c70.4 0 129.8 27.8 174.3 72.8l-67.4 64.8C288.5 99.8 268.4 88 244 88c-66.2 0-120 53.8-120 120s53.8 120 120 120c72.5 0 111.4-52.4 114.9-78.2h-114.9V209.7h194.2c2.1 12.3 3.8 24.9 3.8 38.2z"
              ></path>
            </svg>
          )}
          Entrar com Google
        </Button>
        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <Link
            href="/signup"
            className="font-semibold text-foreground hover:underline"
          >
            Cadastre-se
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
