'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IzyBotanicLogo } from '@/components/icons';

function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  // Exibe a tela de carregamento apenas se o estado de `loading` for verdadeiro.
  // Não exibe mais o loader se 'user' for verdadeiro, pois o useEffect cuidará do redirecionamento.
  if (loading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
          <IzyBotanicLogo className="h-24 w-24 animate-pulse" />
          <h1 className="font-headline text-2xl text-foreground/80">IzyBotanic</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se não estiver carregando e não houver usuário, exibe o formulário de login.
  // O caso de 'user' ser verdadeiro é tratado pelo redirecionamento no useEffect.
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoginForm />
      </main>
    );
  }

  // Retorna um loader como fallback enquanto o redirecionamento do useEffect está acontecendo.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <IzyBotanicLogo className="h-24 w-24 animate-pulse" />
        <h1 className="font-headline text-2xl text-foreground/80">IzyBotanic</h1>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}

export default LoginPage;
