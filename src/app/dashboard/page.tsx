'use client';

import withAuth from '@/components/auth/with-auth';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarDays, Lightbulb, Droplets, Sun } from 'lucide-react';
import Link from 'next/link';
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
import { IzyBotanicLogo } from '@/components/icons';
import {
  Home,
  Leaf,
  PlusSquare,
  MessageCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Painel' },
  { href: '/my-plants', icon: Leaf, label: 'Minhas Plantas' },
  { href: '/add-plant', icon: PlusSquare, label: 'Adicionar Planta' },
  { href: '/chat', icon: MessageCircle, label: 'Especialista IA' },
  { href: '/discover', icon: Sparkles, label: 'Descobrir' },
];

function DashboardPage() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getCareTasks = () => {
    if (!user) return [];
    return user.plants.slice(0, 2).map((plant, index) => ({
      id: plant.id,
      plantName: plant.nickname,
      task: index % 2 === 0 ? 'Rega' : 'Verificação da luz solar',
      date: new Date(),
    }));
  };

  const careTasks = getCareTasks();
  
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
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href === '/dashboard' && pathname === '/')}
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
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-sidebar-foreground">{user?.name}</span>
                <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
            </div>
          </div>
          <Button variant="ghost" className="justify-start mt-2 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden ml-2">Sair</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
                <h2 className="font-headline text-2xl text-primary-foreground/80">
                    {navItems.find(item => item.href === pathname)?.label || 'Painel'}
                </h2>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
             <div className="space-y-8">
              <div>
                <h1 className="font-headline text-4xl text-foreground">Bem-vindo(a) de volta, {user?.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground mt-1">Veja o que está acontecendo no seu jardim hoje.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <CardTitle>Alertas de Cuidado Crítico</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">Ver Todos</Button>
                  </CardHeader>
                  <CardContent>
                    {user && user.plants.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Droplets className="h-5 w-5 text-destructive" />
                            <div>
                              <p className="font-medium">{user.plants[0].nickname} precisa de rega.</p>
                              <p className="text-sm text-muted-foreground">O solo provavelmente está seco.</p>
                            </div>
                          </div>
                          <Button size="sm">Regado</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                          <p className="text-muted-foreground">Nenhum alerta no momento. Suas plantas estão felizes!</p>
                          <Button asChild variant="link" className="mt-2">
                              <Link href="/add-plant">Adicionar uma nova planta</Link>
                          </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-accent" />
                    <CardTitle>Dica da Estação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Com a proximidade do verão, fique atento ao aumento da exposição solar. Pode ser necessário mover algumas plantas para locais mais sombreados para evitar queimaduras nas folhas.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-primary" />
                  <CardTitle>Próximos Cuidados</CardTitle>
                </CardHeader>
                <CardContent>
                  {careTasks.length > 0 ? (
                      <ul className="space-y-3">
                      {careTasks.map(task => (
                          <li key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                              {task.task === 'Rega' ? <Droplets className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                              <p><span className="font-medium">{task.plantName}</span>: {task.task}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">Hoje</span>
                          </li>
                      ))}
                      </ul>
                  ) : (
                      <p className="text-center text-muted-foreground py-4">Nenhuma tarefa futura. Adicione uma planta para começar!</p>
                  )}
                </CardContent>
              </Card>
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default withAuth(DashboardPage);
