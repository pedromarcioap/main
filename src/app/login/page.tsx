'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IzyBotanicLogo } from '@/components/icons';

function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // This effect will redirect the user to the dashboard if they are already logged in.
  // It runs only after the initial loading is complete.
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // While loading, we show a full-screen loader to prevent any flashes of the login form.
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

  // If not loading and there's no user, it's safe to show the login form.
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoginForm />
      </main>
    );
  }

  // If the user is logged in, we render a loader as a fallback while the redirection effect is running.
  // This avoids showing the login form for a split second before redirecting.
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
