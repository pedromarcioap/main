'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarDays, Lightbulb, Leaf } from 'lucide-react';
import Link from 'next/link';
import { getSeasonalTip } from '@/ai/flows/get-seasonal-tip';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Plant } from '@/types';


function DashboardPage() {
  const { user } = useAuth(); // No longer need loading state here, layout handles it
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

  const getCareSchedule = (plants: Plant[] | undefined) => {
    if (!plants) return [];

    const schedule: { day: Date; tasks: { plantName: string; task: string }[] }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const day = addDays(today, i);
        schedule.push({ day, tasks: [] });
    }

    plants.forEach(plant => {
        const wateringFrequency = plant.wateringFrequency.toLowerCase();
        let interval = 7; // Padrão
        if (wateringFrequency.includes('diariamente')) interval = 1;
        else if (wateringFrequency.includes('2-3 dias')) interval = 3;
        else if (wateringFrequency.includes('semanalmente')) interval = 7;
        else if (wateringFrequency.includes('a cada 2 semanas')) interval = 14;

        for (let i = 0; i < 7; i++) {
            // Simplificando a lógica de agendamento para o exemplo
            // Uma lógica mais robusta usaria a última data de rega
            if (i % interval === 0) {
                 schedule[i].tasks.push({ plantName: plant.nickname, task: 'Regar' });
            }
        }
    });

    return schedule;
  };
  
  // The layout ensures user is loaded, so we can safely access user properties.
  const criticalAlerts = user?.plants?.filter(p => p.health.toLowerCase().includes('não saudável') || p.health.toLowerCase().includes('problemas menores')) || [];
  const careSchedule = getCareSchedule(user?.plants);

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
          <CardTitle>Calendário de Cuidados (Próximos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {careSchedule.map(({ day, tasks }) => (
              <div key={day.toISOString()} className={cn("p-2 rounded-lg", isSameDay(day, new Date()) ? "bg-primary/20" : "bg-muted/50")}>
                <p className={cn("font-bold", isSameDay(day, new Date()) ? "text-primary" : "")}>{format(day, 'E', { locale: ptBR })}</p>
                <p className="text-xs text-muted-foreground">{format(day, 'd')}</p>
                <div className="mt-2 space-y-1">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-1.5 p-1 bg-background rounded text-xs justify-center">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="truncate">{task.plantName}</span>
                    </div>
                  ))}
                  {tasks.length === 0 && <div className="h-5"></div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
