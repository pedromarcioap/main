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
  
  // Exibe a tela de carregamento apenas se o estado de `loading` for verdadeiro,
  // ou se o usuário já estiver logado (e aguardando redirecionamento).
  if (loading || user) {
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
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </main>
  );
}

export default LoginPage;
