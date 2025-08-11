'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="w-24 h-24">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,95 C25,95 5,75 5,50 C5,25 25,5 50,5 C75,5 95,25 95,50 C95,75 75,95 50,95 Z" fill="hsl(var(--primary) / 0.2)" />
            <path d="M62.5,65 C60,75 50,80 40,75 C30,70 27.5,60 32.5,50 C37.5,40 45,35 55,40 C65,45 65,55 62.5,65 Z" fill="hsl(var(--primary))" />
            <path d="M50,15 C45,35 25,40 25,50 C25,60 45,65 50,85 C55,65 75,60 75,50 C75,40 55,35 50,15 Z" fill="hsl(var(--background))" />
            <path d="M50,50 m-2.5,0 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0" fill="hsl(var(--accent))" />
          </svg>
        </div>
        <h1 className="text-2xl font-headline text-primary-foreground/80">IzyBotanic</h1>
        <div className="flex flex-col space-y-3 mt-4">
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
