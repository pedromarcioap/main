'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
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

import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export function LoginForm() {
  const { toast } = useToast();
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
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description:
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found'
            ? 'Email ou senha inválidos.'
            : 'Ocorreu um erro. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login com Google',
        description:
          'Não foi possível fazer login com o Google. Por favor, tente novamente.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-none bg-card shadow-xl">
      <CardHeader className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <IzyBotanicLogo className="h-12 w-12 text-white" />
          </div>
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
          className="h-12 w-full justify-start border-border text-base font-normal text-muted-foreground"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <div className="mr-3 h-5 w-5" />
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
