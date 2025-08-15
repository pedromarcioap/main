'use client';

import { useEffect, useState } from 'react';
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
import { IzyBotanicLogo } from '../icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export function LoginForm() {
  const { toast } = useToast();
  const { loginWithEmail, loginWithGoogle, developerLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Ensure window is defined before using it
    if (typeof window !== 'undefined') {
      setIsDevMode(window.location.hostname === 'localhost');
    }
  }, []);

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
      // On success, onAuthStateChanged will redirect
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

  async function handleDeveloperLogin() {
    setIsLoading(true);
    try {
      await developerLogin();
      router.push('/dashboard');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Falha no Login Dev',
        description: 'Não foi possível simular o login.',
      });
    } finally {
      setIsLoading(false);
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
              {isLoading && !isGoogleLoading && <Loader2 className="h-6 w-6 animate-spin" />}
              {!isLoading && 'Entrar'}
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">OU</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="h-12 w-full justify-center border-border text-base font-normal text-muted-foreground"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
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
                    d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.8 244 11.8c70.3 0 129.5 28.5 173.4 72.8l-65.8 64.3c-23.5-22.5-56-36.5-98.6-36.5-74.3 0-134.3 60-134.3 134.3s60 134.3 134.3 134.3c81.7 0 119.5-56.5 124-87.5h-124v-75h236.1c2.4 12.8 3.9 26.5 3.9 41.5z"
                  ></path>
                </svg>
                Entrar com Google
              </>
            )}
          </Button>
          {isDevMode && (
              <Button
                variant="destructive"
                className="h-12 w-full justify-center text-base"
                onClick={handleDeveloperLogin}
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading && !isGoogleLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Entrar como Desenvolvedor"}
              </Button>
            )}
        </div>
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
