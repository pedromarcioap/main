'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { IzyBotanicLogo } from '@/components/icons';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

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
