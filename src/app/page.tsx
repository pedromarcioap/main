'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { IzyBotanicLogo } from '@/components/icons';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

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
        <IzyBotanicLogo className="h-24 w-24 animate-pulse" />
        <h1 className="font-headline text-2xl text-foreground/80">IzyBotanic</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
