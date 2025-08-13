'use client';

import { useEffect, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Plant } from '@/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  Search,
  TestTube2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlantJournal } from '@/components/plants/plant-journal';

function InfoPill({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
      <div className="rounded-full bg-primary/20 p-2 text-primary">
        <Icon className="h-6 w-6" />
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
    if (lowerHealth.includes('saudável'))
      return { icon: Smile, color: 'bg-green-500', label: 'Saudável' };
    if (lowerHealth.includes('problemas menores'))
      return { icon: Meh, color: 'bg-yellow-500', label: 'Problemas Menores' };
    if (lowerHealth.includes('não saudável'))
      return { icon: Frown, color: 'bg-red-500', label: 'Não Saudável' };
    return { icon: Meh, color: 'bg-gray-500', label: 'Desconhecido' };
  }, [health]);

  return (
    <Badge variant="default" className={`${color} text-white hover:${color}`}>
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Badge>
  );
}


function PlantDetailPage() {
  const { id } = useParams();
  const { user, updateUser, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const plant = useMemo(
    () => user?.plants.find((p: Plant) => p.id === id),
    [user, id]
  );

  useEffect(() => {
    // Only run the effect if the user and plant data are fully loaded
    if (!loading && user && plant && !user.achievements.includes('diligent-student')) {
      const updatedUser = {
        ...user,
        achievements: [...user.achievements, 'diligent-student'],
      };
      updateUser(updatedUser);
      toast({
        title: 'Conquista Desbloqueada!',
        description: 'Você ganhou "Estudante Diligente"!',
      });
    }
  }, [loading, user, plant, updateUser, toast]);

  // Handle loading and not found states
  if (loading) {
     return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
                <Card className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                     <CardHeader>
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="mt-2 h-4 w-1/3" />
                    </CardHeader>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Skeleton className="h-10 w-full rounded-md" />
                 <Card className="mt-4">
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
     );
  }

  // After loading, if plant is not found, show 404
  if (!plant) {
    notFound();
  }


  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Card className="overflow-hidden">
          <div className="relative aspect-square w-full">
            <Image
              src={plant.photoDataUri}
              alt={plant.nickname}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-headline text-3xl">
                  {plant.nickname}
                </CardTitle>
                <CardDescription>{plant.species}</CardDescription>
              </div>
              <HealthBadge health={plant.health} />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Tabs defaultValue="care-plan" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="care-plan">Plano de Cuidados</TabsTrigger>
            <TabsTrigger value="health-diagnosis">Diagnóstico</TabsTrigger>
            <TabsTrigger value="expert-tips">Dicas</TabsTrigger>
            <TabsTrigger value="journal">Diário</TabsTrigger>
          </TabsList>

          <TabsContent value="care-plan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList /> Plano de Cuidados Completo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InfoPill
                  icon={Droplets}
                  title="Rega"
                  content={plant.wateringFrequency}
                />
                <InfoPill
                  icon={Sun}
                  title="Luz Solar"
                  content={plant.sunlightNeeds}
                />
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold text-foreground">
                    Instruções Detalhadas
                  </h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {plant.fullCarePlan}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health-diagnosis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse /> Diagnóstico de Saúde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <InfoPill
                  icon={Search}
                  title="Diagnóstico Detalhado"
                  content={plant.detailedDiagnosis}
                />
                <InfoPill
                  icon={TestTube2}
                  title="Análise do Solo"
                  content={plant.soilAnalysis}
                />
                <InfoPill
                  icon={Stethoscope}
                  title="Problemas Potenciais"
                  content={plant.potentialProblems}
                />
                <InfoPill
                  icon={FlaskConical}
                  title="Tratamentos Recomendados"
                  content={plant.treatments}
                />
                <InfoPill
                  icon={Bug}
                  title="Pragas e Doenças"
                  content={plant.potentialPestsAndDiseases}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expert-tips">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb /> Dicas de Especialista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground dark:prose-invert">
                  {plant.expertTips}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="journal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookHeart /> Diário da Planta
                </CardTitle>
                <CardDescription>
                  Registre notas e acompanhe o progresso da sua planta ao longo
                  do tempo.
                </CardDescription>
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
