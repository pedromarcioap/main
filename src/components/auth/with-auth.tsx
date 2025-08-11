'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { IzyBotanicLogo } from '@/components/icons';

interface WithAuthOptions {
  protected?: boolean;
}

const withAuth = (WrappedComponent: React.ComponentType<any>, options: WithAuthOptions = { protected: true }) => {
  const AuthComponent = (props: any) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading) {
        const isAuthPage = pathname === '/login' || pathname === '/signup';

        // If trying to access a protected route without a user, redirect to login
        if (options.protected && !user) {
          router.push('/login');
        }

        // If user is logged in and tries to access login/signup page, redirect to dashboard
        if (user && isAuthPage) {
          router.push('/');
        }
      }
    }, [user, loading, router, pathname]);

    // While loading, or if a redirect is imminent, show a loading screen.
    if (loading || (options.protected && !user)) {
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

    // If user is logged in and tries to access a non-protected page (like login),
    // we also show loading until the redirect to dashboard happens.
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
           <div className="flex flex-col items-center gap-4">
            <IzyBotanicLogo className="w-24 h-24 animate-pulse" />
            <h1 className="text-2xl font-headline text-primary-foreground/80">IzyBotanic</h1>
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        </div>
      );
    }
    
    // Otherwise, render the component
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
