'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Plant } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Droplets,
  Sun,
  HeartPulse,
  Stethoscope,
  Bug,
  FlaskConical,
  ClipboardList,
  Lightbulb,
  Smile,
  Meh,
  Frown,
  BookHeart,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlantJournal } from '@/components/plants/plant-journal';


function InfoPill({ icon: Icon, title, content }: { icon: React.ElementType; title: string; content: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
      <div className="p-2 rounded-full bg-primary/20 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-muted-foreground">{content}</p>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: string }) {
    const { icon: Icon, color, label } = useMemo(() => {
        const lowerHealth = health.toLowerCase();
        if (lowerHealth.includes('saudável')) return { icon: Smile, color: 'bg-green-500', label: 'Saudável' };
        if (lowerHealth.includes('problemas menores')) return { icon: Meh, color: 'bg-yellow-500', label: 'Problemas Menores' };
        if (lowerHealth.includes('não saudável')) return { icon: Frown, color: 'bg-red-500', label: 'Não Saudável' };
        return { icon: Meh, color: 'bg-gray-500', label: 'Desconhecido' };
    }, [health]);
    
    return <Badge className={`${color} text-white`}><Icon className="w-4 h-4 mr-2" />{label}</Badge>;
}

function PlantDetailPage() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const plant = useMemo(() => user?.plants.find((p: Plant) => p.id === id), [user, id]);
  
  useEffect(() => {
    if (user && plant && !user.achievements.includes('diligent-student')) {
      const updatedUser = { ...user, achievements: [...user.achievements, 'diligent-student'] };
      updateUser(updatedUser);
      toast({ title: 'Conquista Desbloqueada!', description: 'Você ganhou "Estudante Diligente"!' });
    }
  }, [user, plant, updateUser, toast]);

  if (!user || !plant) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative w-full aspect-square">
              <Image src={plant.photoDataUri} alt={plant.nickname} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-3xl">{plant.nickname}</CardTitle>
                    <CardDescription>{plant.species}</CardDescription>
                  </div>
                  <HealthBadge health={plant.health} />
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Tabs defaultValue="care-plan" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="care-plan">Plano de Cuidados</TabsTrigger>
                    <TabsTrigger value="health-diagnosis">Diagnóstico</TabsTrigger>
                    <TabsTrigger value="expert-tips">Dicas</TabsTrigger>
                    <TabsTrigger value="journal">Diário</TabsTrigger>
                </TabsList>

                <TabsContent value="care-plan">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ClipboardList /> Plano de Cuidados Completo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <InfoPill icon={Droplets} title="Rega" content={plant.wateringFrequency} />
                            <InfoPill icon={Sun} title="Luz Solar" content={plant.sunlightNeeds} />
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold text-foreground mb-2">Instruções Detalhadas</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plant.fullCarePlan}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health-diagnosis">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HeartPulse /> Diagnóstico de Saúde</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <InfoPill icon={Stethoscope} title="Problemas Potenciais" content={plant.potentialProblems} />
                            <InfoPill icon={FlaskConical} title="Tratamentos Recomendados" content={plant.treatments} />
                            <InfoPill icon={Bug} title="Pragas e Doenças" content={plant.potentialPestsAndDiseases} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expert-tips">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb /> Dicas de Especialista</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                {plant.expertTips}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="journal">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookHeart /> Diário da Planta</CardTitle>
                             <CardDescription>Registre notas e acompanhe o progresso da sua planta ao longo do tempo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <PlantJournal plantId={plant.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
  );
}

export default PlantDetailPage;
