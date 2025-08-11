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
  
  // Display a loading screen while auth state is being determined,
  // or if the user is already logged in and waiting for redirect.
  if (loading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
          <IzyBotanicLogo className="w-24 h-24 animate-pulse" />
          <h1 className="text-2xl font-headline text-primary-foreground/80">IzyBotanic</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Only render the login form if not loading and no user is found.
  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <LoginForm />
    </main>
  );
}

export default LoginPage;
