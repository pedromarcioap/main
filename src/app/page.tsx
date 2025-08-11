'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component now simply acts as an entry point to redirect to the main dashboard.
// The actual authentication check is handled by the layout in the (app) group.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-headline text-primary-foreground/80">IzyBotanic</h1>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}
