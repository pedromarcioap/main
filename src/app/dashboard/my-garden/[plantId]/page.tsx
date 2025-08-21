'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlantJournal } from '@/components/plants/plant-journal';
import {
  AlertCircle,
  BookOpenCheck,
  Droplets,
  HeartPulse,
  Leaf,
  Sparkles,
  Sun,
  Trash2,
  BrainCircuit,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function PlantDetailPage() {
  const { user, updateUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const plantId = params.plantId as string;

  const plant = user?.plants.find((p) => p.id === plantId);

  useEffect(() => {
    // If the user data has loaded and the plant is no longer found
    // (e.g., after deletion), redirect to the main garden page.
    if (user && !plant) {
      router.replace('/dashboard/my-garden');
    }
  }, [user, plant, router]);
  
  const unlockAchievement = async (achievementId: string, title: string, description: string) => {
    if (!user || user.achievements.includes(achievementId)) return;
    
    try {
      const updatedUser = {
        ...user,
        achievements: [...user.achievements, achievementId],
      };
      await updateUser(updatedUser);
      toast({
        title: title,
        description: description,
      });
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  }

  const handleDeletePlant = async () => {
    if (!user || !plant) return;

    const updatedPlants = user.plants.filter((p) => p.id !== plantId);
    const updatedJournal = user.journal.filter((j) => j.plantId !== plantId);

    try {
      await updateUser({ ...user, plants: updatedPlants, journal: updatedJournal });
      toast({
        title: 'Planta Excluída!',
        description: `${plant.nickname} foi removida do seu jardim.`,
      });
      // The useEffect hook will handle the redirection automatically
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a planta. Tente novamente.',
      });
    }
  };

  if (!plant) {
    // This state will be temporary before the useEffect redirects.
    // It also handles cases where the plantId is invalid from the start.
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Leaf className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Planta não encontrada</h1>
        <p className="text-muted-foreground">
          Redirecionando para o seu jardim...
        </p>
      </div>
    );
  }

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'Saudável':
        return 'default';
      case 'Problemas menores':
        return 'secondary';
      case 'Não saudável':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <Image
                  src={plant.photoURL}
                  alt={plant.nickname}
                  width={400}
                  height={400}
                  className="rounded-lg object-cover aspect-square"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold font-headline">
                      {plant.nickname}
                    </h1>
                    <p className="text-xl text-muted-foreground italic">
                      {plant.species}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente a planta e todas as suas anotações do diário.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlant} className="bg-destructive hover:bg-destructive/90">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5" />
                  <span className="font-semibold">Saúde:</span>
                  <Badge variant={getHealthBadgeVariant(plant.health)}>
                    {plant.health}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    Adicionada em:{' '}
                    {new Date(plant.addedDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <BrainCircuit className="w-5 h-5 mr-2" />
                  Diagnóstico da Izy
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-md">Problemas Potenciais</h4>
                    <p className="text-muted-foreground">{plant.potentialProblems}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md">Diagnóstico Detalhado</h4>
                    <p className="text-muted-foreground">{plant.detailedDiagnosis}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md">Análise do Solo</h4>
                    <p className="text-muted-foreground">{plant.soilAnalysis}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger
                  onClick={() => unlockAchievement(
                    'diligent-student', 
                    'Nova Conquista!',
                    'Estudante Diligente: Você viu o plano de cuidados completo de uma de suas plantas.'
                    )}
                >
                  <BookOpenCheck className="w-5 h-5 mr-2" />
                  Plano de Cuidados Completo
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Droplets className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Rega</h4>
                      <p className="text-muted-foreground">{plant.wateringFrequency}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <Sun className="w-6 h-6 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Luz Solar</h4>
                      <p className="text-muted-foreground">{plant.sunlightNeeds}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <Leaf className="w-6 h-6 text-gray-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Tratamentos</h4>
                      <p className="text-muted-foreground">{plant.treatments}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-amber-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Dicas de Especialista</h4>
                      <p className="text-muted-foreground">{plant.expertTips}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Pragas e Doenças Potenciais
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{plant.potentialPestsAndDiseases}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <PlantJournal plantId={plant.id} />
      </div>
    </div>
  );
}
