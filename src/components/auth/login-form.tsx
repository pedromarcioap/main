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

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export function LoginForm() {
  const { login, googleLogin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { success, error } = await login(values.email, values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description:
          error === 'auth/invalid-credential'
            ? 'Email ou senha inválidos.'
            : 'Ocorreu um erro. Por favor, tente novamente.',
      });
    }
    // No need to redirect here, the Home page will do it.
    setIsLoading(false);
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    const { success, error } = await googleLogin();
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login com Google',
        description: 'Não foi possível fazer login com o Google.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-sm shadow-xl bg-card border-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full" />
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
                  <FormLabel className="text-muted-foreground font-normal">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-muted/50 border-border"
                      placeholder="nome@exemplo.com"
                      {...field}
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
                  <FormLabel className="text-muted-foreground font-normal">
                    Senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-muted/50 border-border"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                'Entrar'
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
        <Button
          variant="outline"
          className="w-full h-12 text-base border-border justify-start font-normal text-muted-foreground"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <div className="w-5 h-5 mr-3 border-2 border-border rounded-full" />
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
