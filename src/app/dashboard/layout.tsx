'use client';

import { IzyBotanicLogo } from '@/components/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  LogOut,
  PlusCircle,
  Flower2,
  Home,
  Bot,
  BookHeart,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <IzyBotanicLogo className="h-24 w-24 animate-pulse" />
          <h1 className="font-headline text-2xl text-foreground/80">
            IzyBotanic
          </h1>
          <p className="text-muted-foreground">Carregando seu jardim...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/dashboard/my-garden', label: 'Meu Jardim', icon: Flower2 },
    { href: '/dashboard/add-plant', label: 'Adicionar Planta', icon: PlusCircle },
    { href: '/dashboard/chat', label: 'Fale com a Izy', icon: Bot },
    { href: '/dashboard/achievements', label: 'Conquistas', icon: BookHeart },
    { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <IzyBotanicLogo className="h-10 w-10" />
            <span className="font-headline text-xl">IzyBotanic</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    variant="ghost"
                  >
                    <item.icon />
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarGroup className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} variant="ghost">
                  <LogOut />
                  Sair
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <IzyBotanicLogo className="h-8 w-8" />
            <span className="font-headline text-lg">IzyBotanic</span>
          </Link>
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;
