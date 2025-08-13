'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { IzyBotanicLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import {
  Home,
  Leaf,
  PlusSquare,
  MessageCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Painel' },
  { href: '/my-plants', icon: Leaf, label: 'Minhas Plantas' },
  { href: '/add-plant', icon: PlusSquare, label: 'Adicionar Planta' },
  { href: '/chat', icon: MessageCircle, label: 'Especialista IA' },
  { href: '/discover', icon: Sparkles, label: 'Descobrir' },
];

function FullScreenLoader() {
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <FullScreenLoader />;
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const isCurrentPage = (href: string) => {
    if (href === pathname) {
      return true;
    }
    // Handle cases where the current path is a sub-path of the nav item
    if (href !== '/' && pathname.startsWith(href) && href !== '/my-plants') {
       return true;
    }
    return false;
  };
  
  const currentLabel =
    navItems.find((item) => isCurrentPage(item.href))?.label || 'Painel';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <IzyBotanicLogo className="h-10 w-10" />
            <h1 className="font-headline text-2xl group-data-[collapsible=icon]:hidden">
              IzyBotanic
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={isCurrentPage(item.href)}
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
              <AvatarImage
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                alt={user.name}
              />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {user.name}
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                {user.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden md:ml-2">
              Sair
            </span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/50 px-6 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="font-headline text-2xl text-foreground/80">
              {currentLabel}
            </h2>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
