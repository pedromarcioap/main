'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IzyBotanicLogo } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Home,
  Leaf,
  PlusSquare,
  MessageCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/my-plants', icon: Leaf, label: 'My Plants' },
  { href: '/add-plant', icon: PlusSquare, label: 'Add Plant' },
  { href: '/chat', icon: MessageCircle, label: 'AI Expert' },
  { href: '/discover', icon: Sparkles, label: 'Discover' },
];

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex items-center gap-4">
          <IzyBotanicLogo className="w-12 h-12 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading your garden...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
             <IzyBotanicLogo className="w-10 h-10" />
            <h1 className="font-headline text-2xl group-data-[collapsible=icon]:hidden">IzyBotanic</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
            </div>
          </div>
          <Button variant="ghost" className="justify-start mt-2 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden ml-2">Log Out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
                <h2 className="font-headline text-2xl text-primary-foreground/80">
                    {navItems.find(item => item.href === pathname)?.label || 'Welcome'}
                </h2>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
