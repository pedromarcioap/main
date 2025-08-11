'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarDays, Lightbulb, Leaf } from 'lucide-react';
import Link from 'next/link';
import { getSeasonalTip } from '@/ai/flows/get-seasonal-tip';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';


function DashboardPage() {
  const { user } = useAuth();
  const [seasonalTip, setSeasonalTip] = useState<string>('');
  const [tipLoading, setTipLoading] = useState(true);

  useEffect(() => {
    getSeasonalTip({ season: 'inverno' }) // Pode ser dinâmico no futuro
      .then(response => setSeasonalTip(response.tip))
      .catch(err => {
        console.error("Erro ao buscar dica sazonal:", err);
        setSeasonalTip("Fique atento às suas plantas. A observação regular é a chave para um jardim saudável!");
      })
      .finally(() => setTipLoading(false));
  }, []);

  const criticalAlerts = user?.plants?.filter(p => p.health.toLowerCase().includes('não saudável') || p.health.toLowerCase().includes('problemas menores')) || [];
  const upcomingTasks = user?.plants?.slice(0, 3).map(plant => ({
    id: plant.id,
    plantName: plant.nickname,
    task: `Regar`,
    schedule: plant.wateringFrequency
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl text-foreground">Bem-vindo(a) de volta, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Veja o que está acontecendo no seu jardim hoje.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-destructive" />Alertas de Cuidado Crítico</CardTitle>
            {criticalAlerts.length > 0 && <Button variant="ghost" size="sm" asChild><Link href="/my-plants">Ver Todos</Link></Button>}
          </CardHeader>
          <CardContent>
            {criticalAlerts.length > 0 ? (
              <div className="space-y-4">
                {criticalAlerts.slice(0, 2).map(plant => (
                  <div key={plant.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">{plant.nickname} precisa de atenção.</p>
                        <p className="text-sm text-muted-foreground">Diagnóstico: {plant.health}</p>
                      </div>
                    </div>
                    <Button size="sm" asChild><Link href={`/my-plants/${plant.id}`}>Ver Detalhes</Link></Button>
                  </div>
                ))}
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
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            <CardTitle>Dica da Estação</CardTitle>
          </CardHeader>
          <CardContent>
            {tipLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : (
                <CardDescription>
                {seasonalTip}
                </CardDescription>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <CardTitle>Próximos Cuidados</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length > 0 ? (
              <ul className="space-y-3">
              {upcomingTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="font-medium">{task.plantName}: {task.task}</p>
                            <p className="text-sm text-muted-foreground">{task.schedule}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Marcar como feito</Button>
                  </li>
              ))}
              </ul>
          ) : (
              <p className="text-center text-muted-foreground py-4">Nenhuma tarefa futura. Adicione uma planta para começar!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
