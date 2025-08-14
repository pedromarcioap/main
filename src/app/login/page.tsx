'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IzyBotanicLogo } from '@/components/icons';

function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Este efeito redirecionará o usuário para o dashboard se ele já estiver logado.
  // Ele é executado somente após o carregamento inicial estar completo.
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Enquanto o estado de 'loading' está ativo, mostramos um loader em tela cheia para
  // evitar qualquer "flash" do formulário de login.
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

  // Se não estiver carregando e não houver usuário, é seguro exibir o formulário de login.
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoginForm />
      </main>
    );
  }

  // Se o usuário estiver logado (e a verificação de 'loading' já passou), renderizamos um loader
  // como fallback enquanto o efeito de redirecionamento está em execução.
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
